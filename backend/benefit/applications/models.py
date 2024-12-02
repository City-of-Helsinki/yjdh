import re
from datetime import date, timedelta
from typing import List

from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ObjectDoesNotExist
from django.db import connection, models
from django.db.models import Exists, F, JSONField, OuterRef, Prefetch, Subquery
from django.db.models.constraints import UniqueConstraint
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField, SearchField
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords

from applications.enums import (
    AhjoDecision,
    AhjoDecisionDetails,
    AhjoStatus as AhjoStatusEnum,
    ApplicationAlterationState,
    ApplicationAlterationType,
    ApplicationBatchStatus,
    ApplicationOrigin,
    ApplicationStatus,
    ApplicationStep,
    ApplicationTalpaStatus,
    AttachmentType,
    BenefitType,
    DecisionType,
    HandlerRole,
    PaySubsidyGranted,
)
from applications.exceptions import (
    BatchCompletionDecisionDateError,
    BatchCompletionRequiredFieldsError,
    BatchTooManyDraftsError,
)
from calculator.enums import InstalmentStatus
from common.localized_iban_field import LocalizedIBANField
from common.utils import DurationMixin
from companies.models import Company
from shared.common.utils import social_security_number_birthdate
from shared.models.abstract_models import TimeStampedModel, UUIDModel
from users.models import User

# todo: move to some better location?
APPLICATION_LANGUAGE_CHOICES = (
    ("fi", "suomi"),
    ("sv", "svenska"),
    ("en", "english"),
)

PAY_SUBSIDY_PERCENT_CHOICES = (
    (50, "50%"),
    (70, "70%"),
    (100, "100%"),
)

ATTACHMENT_CONTENT_TYPE_CHOICES = (
    ("application/pdf", "pdf"),
    ("image/png", "png"),
    ("image/jpeg", "jpeg"),
    ("application/xml", "xml"),
)


def _get_next_application_number():
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT nextval(%s)", [Application.APPLICATION_NUMBER_SEQUENCE_ID]
        )
        return cursor.fetchone()[0]


def address_property(field_suffix):
    def _address_property_getter(self):
        if self.use_alternative_address:
            field_prefix = "alternative"
        else:
            field_prefix = "official"
        field_name = f"{field_prefix}_{field_suffix}"
        return getattr(self, field_name)

    return _address_property_getter


class ApplicationManager(models.Manager):
    HANDLED_STATUSES = [
        ApplicationStatus.REJECTED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
    ]

    COMPLETED_BATCH_STATUSES = [
        ApplicationBatchStatus.DECIDED_ACCEPTED,
        ApplicationBatchStatus.DECIDED_REJECTED,
        ApplicationBatchStatus.SENT_TO_TALPA,
        ApplicationBatchStatus.COMPLETED,
    ]

    ARCHIVE_THRESHOLD = relativedelta(days=-14)

    def _annotate_with_log_timestamp(self, qs, field_name, to_statuses):
        subquery = (
            ApplicationLogEntry.objects.filter(
                application=OuterRef("pk"), to_status__in=to_statuses
            )
            .order_by("-created_at")
            .values("created_at")[:1]
        )
        return qs.annotate(**{field_name: Subquery(subquery)})

    def get_queryset(self):
        """
        Annotate the queryset with information about timestamps of past status transitions.
        If multiple transitions to the same status have occurred, then use the latest status transition timestamp.
        """
        qs = super().get_queryset()
        qs = self._annotate_with_log_timestamp(qs, "handled_at", self.HANDLED_STATUSES)
        qs = self._annotate_with_log_timestamp(
            qs,
            "additional_information_requested_at",
            [ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED],
        )
        qs = self._annotate_with_log_timestamp(
            qs, "submitted_at", [ApplicationStatus.RECEIVED]
        )
        return qs

    def with_non_downloaded_attachments(self):
        """
        Returns applications with only those attachments that have
        null in 'downloaded_by_ahjo' and where  the applications have a non-null ahjo_case_id,
        which means that a case has been opened for them in AHJO.
        """

        # Define a queryset for attachments where downloaded_by_ahjo is NULL
        attachments_queryset = Attachment.objects.filter(
            downloaded_by_ahjo__isnull=True,
            attachment_type__in=[
                AttachmentType.EMPLOYMENT_CONTRACT,
                AttachmentType.PAY_SUBSIDY_DECISION,
                AttachmentType.COMMISSION_CONTRACT,
                AttachmentType.EDUCATION_CONTRACT,
                AttachmentType.HELSINKI_BENEFIT_VOUCHER,
                AttachmentType.EMPLOYEE_CONSENT,
                AttachmentType.OTHER_ATTACHMENT,
            ],
        )

        # Create an Exists subquery for at least one undownloaded attachment
        attachment_exists = Exists(
            attachments_queryset.filter(application_id=OuterRef("pk"))
        )

        # Annotate applications with a boolean indicating the existence of undownloaded attachments
        qs = (
            self.get_queryset()
            .annotate(has_undownloaded_attachments=attachment_exists)
            .filter(
                ahjo_case_id__isnull=False,
                has_undownloaded_attachments=True,  # Filter using the annotated field
            )
        )

        # Use Prefetch to specify the filtered queryset for prefetching attachments
        attachments_prefetch = Prefetch("attachments", queryset=attachments_queryset)

        # Return the filtered applications with the specified prefetched related attachments
        return qs.prefetch_related(attachments_prefetch)

    def with_due_instalments(self, status: InstalmentStatus):
        """Query applications with instalments with past due date and a specific status."""
        return (
            self.filter(
                status=ApplicationStatus.ACCEPTED,
                calculation__instalments__due_date__lte=timezone.now().date(),
                calculation__instalments__status=status,
            )
            .select_related("calculation")
            .select_related("batch")
            .prefetch_related("calculation__instalments")
        )

    def get_by_statuses(
        self,
        application_statuses: List[ApplicationStatus],
        ahjo_statuses: List[AhjoStatusEnum],
        has_no_case_id: bool,
        retry_failed_older_than_hours: int = 0,
        retry_status: AhjoStatusEnum = None,
    ):
        """
        Query applications by their latest AhjoStatus relation
        and their current ApplicationStatus and if they have a case id in Ahjo or not.
        The latest ahjo status can be one of several as for example in the case of update
        records request, where the previous status can be either:
        AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
        or
        AhjoStatusEnum.NEW_RECORDS_RECEIVED
        """
        # if hours are specified, then the retry_status is used to query the applications for the re-attempt
        if retry_failed_older_than_hours > 0 and retry_status:
            ahjo_statuses = [retry_status]

        # Subquery to get the latest AhjoStatus id for each application
        latest_ahjo_status_subquery = (
            AhjoStatus.objects.filter(application=OuterRef("pk"))
            .order_by("-created_at")
            .values("id")[:1]
        )

        latest_ahjo_status_created_at_subquery = (
            AhjoStatus.objects.filter(application=OuterRef("pk"))
            .order_by("-created_at")
            .values("created_at")[:1]
        )

        # Excluded attachment types
        excluded_types = [
            AttachmentType.PDF_SUMMARY,
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ]

        # Prefetch query for attachments excluding specified types
        attachments_queryset = Attachment.objects.exclude(
            attachment_type__in=excluded_types
        )
        attachments_prefetch = Prefetch("attachments", queryset=attachments_queryset)

        # Annotate applications with the latest AhjoStatus id and filter accordingly
        applications = self.annotate(
            latest_ahjo_status_id=Subquery(latest_ahjo_status_subquery),
            latest_ahjo_status_created_at=Subquery(
                latest_ahjo_status_created_at_subquery.values("created_at")
            ),
        ).filter(
            status__in=application_statuses,
            ahjo_status__id=F("latest_ahjo_status_id"),
            ahjo_status__status__in=ahjo_statuses,
            ahjo_case_id__isnull=has_no_case_id,
        )

        # Dynamically add time-based filter if requested, so that applications that have
        # been in a certain AhjoStatus for a certain time are queried
        if retry_failed_older_than_hours > 0:
            time_in_past = timezone.now() - timedelta(
                hours=retry_failed_older_than_hours
            )
            applications = applications.filter(
                latest_ahjo_status_created_at__lt=time_in_past
            )

        return applications.prefetch_related(
            attachments_prefetch, "calculation", "company"
        )

    def get_for_ahjo_decision(
        self,
        application_statuses: List[ApplicationStatus],
        ahjo_statuses: List[AhjoStatusEnum],
        has_no_case_id: bool = False,
        retry_failed_older_than_hours: int = 0,
        retry_status: AhjoStatusEnum = None,
    ):
        """
        Get applications that are in a state where a decision proposal should be sent to Ahjo.
        This means applications that have been accepted or rejected, their talpa status is not_processed_by_talpa,
        have a ahjo_case_id, a decisiontext and their latest ahjo_status is case_opened.
        """

        if retry_failed_older_than_hours > 0 and retry_status:
            ahjo_statuses = [retry_status]

        latest_ahjo_status_subquery = (
            AhjoStatus.objects.filter(application=OuterRef("pk"))
            .order_by("-created_at")
            .values("id")[:1]
        )

        latest_ahjo_status_created_at_subquery = (
            AhjoStatus.objects.filter(application=OuterRef("pk"))
            .order_by("-created_at")
            .values("created_at")[:1]
        )

        applications = (
            self.get_queryset()
            .annotate(
                latest_ahjo_status_id=Subquery(latest_ahjo_status_subquery),
                latest_ahjo_status_created_at=Subquery(
                    latest_ahjo_status_created_at_subquery.values("created_at")
                ),
            )
            .filter(
                status__in=application_statuses,
                talpa_status=ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
                ahjo_case_id__isnull=has_no_case_id,
                ahjodecisiontext__isnull=False,
                id__in=AhjoDecisionText.objects.filter(
                    application_id=OuterRef("id")
                ).values("application_id"),
                ahjo_status__id=F("latest_ahjo_status_id"),
                ahjo_status__status__in=ahjo_statuses,
            )
        )

        if retry_failed_older_than_hours > 0:
            time_in_past = timezone.now() - timedelta(
                hours=retry_failed_older_than_hours
            )
            applications = applications.filter(
                latest_ahjo_status_created_at__lt=time_in_past
            )
        return applications.select_related("ahjodecisiontext")


class Application(UUIDModel, TimeStampedModel, DurationMixin):
    """
    Data model for Helsinki benefit applications

    The business id (y-tunnus) and company name are stored in the Company model

    There can be only one employee per application. Employees can not be shared with
    multiple applications.

    For additional descriptions of the fields, see the API documentation (serializers.py)
    """

    objects = ApplicationManager()

    BENEFIT_MAX_MONTHS = 12

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name=_("company"),
    )

    """
    Status of the application, as shown to the applicant
    """
    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT,
    )

    talpa_status = models.CharField(
        max_length=64,
        verbose_name=_("talpa_status"),
        choices=ApplicationTalpaStatus.choices,
        default=ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA,
    )

    application_origin = models.CharField(
        max_length=64,
        verbose_name=_("application origin"),
        choices=ApplicationOrigin.choices,
        default=ApplicationOrigin.APPLICANT,
    )

    application_number = models.IntegerField(
        verbose_name=_("application number"), default=_get_next_application_number
    )

    company_name = models.CharField(max_length=256, verbose_name=_("company name"))

    company_form = models.CharField(
        max_length=64, verbose_name=_("company form as user-readable text")
    )

    company_form_code = models.IntegerField(
        verbose_name=_("YTJ type code for company form")
    )

    company_department = models.CharField(
        max_length=256, blank=True, verbose_name=_("company department")
    )

    official_company_street_address = models.CharField(
        max_length=256,
        verbose_name=_("company street address"),
    )
    official_company_city = models.CharField(
        max_length=256, verbose_name=_("company city")
    )
    official_company_postcode = models.CharField(
        max_length=256, verbose_name=_("company post code")
    )

    use_alternative_address = models.BooleanField()

    alternative_company_street_address = models.CharField(
        max_length=256, verbose_name=_("company street address"), blank=True
    )
    alternative_company_city = models.CharField(
        max_length=256, verbose_name=_("company city"), blank=True
    )
    alternative_company_postcode = models.CharField(
        max_length=256, verbose_name=_("company post code"), blank=True
    )

    # the following property values are evaluated based on use_alternative_address setting
    effective_company_street_address = property(
        address_property("company_street_address")
    )
    effective_company_city = property(address_property("company_city"))
    effective_company_postcode = property(address_property("company_postcode"))

    company_bank_account_number = LocalizedIBANField(
        include_countries=("FI",),
        verbose_name=_("company bank account number"),
        blank=True,
    )

    company_contact_person_first_name = models.CharField(
        max_length=128, verbose_name=_("first name"), blank=True
    )
    company_contact_person_last_name = models.CharField(
        max_length=128, verbose_name=_("last name"), blank=True
    )

    company_contact_person_phone_number = PhoneNumberField(
        verbose_name=_("company contact person's phone number"),
        blank=True,
    )
    company_contact_person_email = models.EmailField(
        blank=True, verbose_name=_("company contact person's email")
    )

    """
    Only required if the applicant company form is an association or something else that might not have
    business activities. For "normal" businesses, this field has no effect and should always be set to None.
    """
    association_has_business_activities = models.BooleanField(null=True)

    """
    Store the language of the user filling the application.
    In case a handler enters data from a paper form, this field must be entered by the admin.

    Notes:
    Default language is "fi".
    if language is swedish, then the decision text in Ahjo must be also in swedish
    if language is english, then an english translation of the decision is included
    in Ahjo as attachment
    """
    applicant_language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],
        max_length=2,
    )

    """
    This field is required if the applicant company form is an association.
    For "normal" businesses, this field has no effect and should always be set to None.
    """
    association_immediate_manager_check = models.BooleanField(null=True)

    co_operation_negotiations = models.BooleanField(null=True)
    co_operation_negotiations_description = models.CharField(
        max_length=256,
        verbose_name=_(
            "additional information about the ongoing co-operation negotiations"
        ),
        blank=True,
    )

    pay_subsidy_granted = models.CharField(
        choices=PaySubsidyGranted.choices,
        max_length=128,
        null=True,
        blank=True,
    )

    # The PaySubsidy model stores the values entered by handlers for the calculation.
    # This field is filled by the applicant.
    pay_subsidy_percent = models.IntegerField(
        verbose_name=_("Pay subsidy percent"),
        choices=PAY_SUBSIDY_PERCENT_CHOICES,
        null=True,
        blank=True,
    )

    additional_pay_subsidy_percent = models.IntegerField(
        verbose_name=_("Pay subsidy percent for second pay subsidy grant"),
        choices=PAY_SUBSIDY_PERCENT_CHOICES,
        null=True,
        blank=True,
    )

    apprenticeship_program = models.BooleanField(null=True)

    """
    After applications are moved to archive, they are hidden from the default view.
    """
    archived = models.BooleanField()

    """
    current/latest application step shown in the UI
    """
    application_step = models.CharField(choices=ApplicationStep.choices, max_length=64)

    """
    The type of benefit the applicant is applying for
    """
    benefit_type = models.CharField(
        choices=BenefitType.choices, max_length=64, blank=True
    )

    start_date = models.DateField(
        verbose_name=_("benefit start from date"), null=True, blank=True
    )
    end_date = models.DateField(
        verbose_name=_("benefit end date"), null=True, blank=True
    )

    paper_application_date = models.DateField(
        verbose_name=_("paper application date"), null=True, blank=True
    )

    APPLICATION_NUMBER_SEQUENCE_ID = "seq_application_number"

    def get_available_benefit_types(self):
        if (
            self.is_association_application()
            and not self.association_has_business_activities
        ):
            return [
                BenefitType.SALARY_BENEFIT,
            ]
        else:
            return [
                BenefitType.SALARY_BENEFIT,
                BenefitType.COMMISSION_BENEFIT,
                BenefitType.EMPLOYMENT_BENEFIT,
            ]

    """
    If the value of de_minimis_aid is None, that indicates the applicant has not made the selection.
    de_minimis_aid is only applicable to applicants with business activities, otherwise it should be None.
    If value is set to True, then this application must have at least one DeMinimisAid, and if False,
    then the application must have no DeMinimisAid objects.
    """
    de_minimis_aid = models.BooleanField(null=True)

    batch = models.ForeignKey(
        "ApplicationBatch",
        verbose_name=_("ahjo batch"),
        related_name="applications",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    bases = models.ManyToManyField("ApplicationBasis", related_name="applications")

    history = HistoricalRecords(
        history_change_reason_field=models.TextField(null=True),
        table_name="bf_applications_application_history",
        cascade_delete_history=True,
    )
    # This is the diary number in Ahjo
    ahjo_case_id = models.CharField(max_length=64, null=True, blank=True)
    ahjo_case_guid = models.UUIDField(null=True, blank=True)
    handled_by_ahjo_automation = models.BooleanField(default=False)

    handler = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    @property
    def number_of_instalments(self):
        return self.calculation.instalments.count()

    @property
    def calculated_benefit_amount(self):
        if hasattr(self, "calculation"):
            return self.calculation.calculated_benefit_amount
        else:
            return None

    @property
    def calculated_effective_benefit_amount(self):
        original_benefit = self.calculated_benefit_amount

        if original_benefit is not None and self.alteration_set is not None:
            return original_benefit - sum(
                [
                    alteration.recovery_amount or 0
                    for alteration in self.alteration_set.all()
                ]
            )
        else:
            return original_benefit

    @property
    def ahjo_decision(self):
        if self.batch:
            return self.batch.ahjo_decision
        return None

    @property
    def ahjo_application_number(self) -> str:
        return str(self.application_number)

    @property
    def ahjo_rows(self):
        # enable uniform handling of applications with and without a calculation object
        from calculator.models import CalculationRow

        if hasattr(self, "calculation"):
            return self.calculation.ahjo_rows
        else:
            return CalculationRow.objects.none()

    @property
    def latest_decision_comment(self):
        return self.get_log_entry_field(
            [
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.CANCELLED,
                ApplicationStatus.REJECTED,
            ],
            "comment",
        )

    @property
    def total_deminimis_amount(self):
        total = 0
        for deminimis_aid in self.de_minimis_aid_set.all():
            total += deminimis_aid.amount
        return total

    @property
    def contact_person(self):
        return f"{self.company_contact_person_first_name} {self.company_contact_person_last_name}"

    def get_log_entry_field(self, to_statuses, field_name):
        if (
            log_entry := self.log_entries.filter(to_status__in=to_statuses)
            .order_by(
                "-created_at"
            )  # the latest transition to one of the statuses listed in to_statuses
            .first()
        ):
            return getattr(log_entry, field_name)
        else:
            return None

    @property
    def is_accepted_in_ahjo(self):
        if self.batch is not None:
            return self.batch.status in [
                ApplicationBatchStatus.DECIDED_ACCEPTED,
                ApplicationBatchStatus.DECIDED_REJECTED,
                ApplicationBatchStatus.SENT_TO_TALPA,
                ApplicationBatchStatus.COMPLETED,
            ]
        else:
            return False

    def __str__(self):
        return "{}: {} {} {}-{}".format(
            self.pk, self.company_name, self.status, self.start_date, self.end_date
        )

    class Meta:
        db_table = "bf_applications_application"
        verbose_name = _("application")
        verbose_name_plural = _("applications")
        ordering = ("created_at",)


class DeMinimisAid(UUIDModel, TimeStampedModel):
    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="de_minimis_aid_set",
        on_delete=models.CASCADE,
    )
    granter = models.CharField(
        max_length=64, verbose_name=_("granter of the de minimis aid")
    )
    amount = models.DecimalField(
        max_digits=8, decimal_places=2, verbose_name=_("amount of the de minimis aid")
    )
    granted_at = models.DateField(verbose_name=_("benefit granted at"))
    ordering = models.IntegerField(default=0)
    history = HistoricalRecords(
        # TODO this table name is inconsistent with the others, it lacks the bf_ prefix
        table_name="applications_deminimisaid_history",
        cascade_delete_history=True,
    )

    def __str__(self):
        return "{}: {} {}".format(self.pk, self.application.pk, self.granter)

    class Meta:
        db_table = "bf_applications_deminimisaid"
        verbose_name = _("de minimis aid")
        verbose_name_plural = _("de minimis aids")
        unique_together = [("application", "ordering")]
        ordering = ["application__created_at", "ordering"]


class ApplicationLogEntry(UUIDModel, TimeStampedModel):
    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="log_entries",
        on_delete=models.CASCADE,
    )
    from_status = models.CharField(choices=ApplicationStatus.choices, max_length=64)
    to_status = models.CharField(choices=ApplicationStatus.choices, max_length=64)
    comment = models.TextField(blank=True)

    history = HistoricalRecords(
        table_name="bf_applications_applicationlogentry_history",
        cascade_delete_history=True,
    )

    def __str__(self):
        return (
            f"Application {self.application.id} | {self.from_status or 'N/A'} --> "
            f"{self.to_status}"
        )

    class Meta:
        db_table = "bf_applications_applicationlogentry"
        verbose_name = _("application log entry")
        verbose_name_plural = _("application log entries")
        ordering = ["application__created_at", "created_at"]


def validate_decision_date(value):
    """
    Validate batch decision date: allow empty or
    +/- 3 months and a day from today
    """
    months = 3
    max_value = date.today() + relativedelta(days=1, months=months)
    min_value = date.today() + relativedelta(days=-1, months=-months)

    if value:
        return (value < max_value and value > min_value) or value == ""
    else:
        raise BatchCompletionDecisionDateError(
            f"Decision date must be +/- {months} months from this date"
        )


class ApplicationBatch(UUIDModel, TimeStampedModel):
    """
    Represents grouping of applications for:
    * Decision making in Ahjo
    * Transferring payment data to Talpa

    If Ahjo automation / integration is in use, a single application batch will be created for each
    application, after a case has been opened in Ahjo after which auto_generated_by ahjo is set to True.
    """

    handler = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=64,
        verbose_name=_("status of batch"),
        choices=ApplicationBatchStatus.choices,
        default=ApplicationBatchStatus.DRAFT,
    )

    proposal_for_decision = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name=_("proposal for decision"),
        choices=AhjoDecision.choices,
    )

    decision_maker_title = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name=_("decision maker's title in Ahjo"),
    )
    decision_maker_name = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name=_("decision maker's name in Ahjo"),
    )
    section_of_the_law = models.CharField(
        max_length=16,
        blank=True,
        null=True,
        verbose_name=_("section of the law in Ahjo decision"),
    )
    decision_date = models.DateField(
        verbose_name=_("date of the decision in Ahjo"),
        null=True,
        blank=True,
        validators=[validate_decision_date],
    )
    p2p_inspector_name = models.CharField(
        max_length=128, blank=True, null=True, verbose_name=_("P2P inspector's name")
    )
    p2p_inspector_email = models.EmailField(
        blank=True, null=True, verbose_name=_("P2P inspector's email address")
    )
    p2p_checker_name = models.CharField(
        max_length=64, blank=True, null=True, verbose_name=_("P2P acceptor's title")
    )

    expert_inspector_name = models.CharField(
        max_length=128, blank=True, null=True, verbose_name=_("Expert inspector's name")
    )
    expert_inspector_email = models.EmailField(
        blank=True, null=True, verbose_name=_("Expert inspector's email address")
    )

    expert_inspector_title = models.CharField(
        max_length=64, blank=True, null=True, verbose_name=_("Expert inspector's title")
    )

    auto_generated_by_ahjo = models.BooleanField(
        blank=True,
        default=False,
        verbose_name=_("Batch created through Ahjo integration"),
    )

    def clean(self):
        # Deny any attempt to create more than one draft for accepted or rejected batch
        def _clean_one_draft_per_decision(self):
            proposal_states = [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]

            if (
                self.proposal_for_decision in proposal_states
                and self.status == ApplicationBatchStatus.DRAFT
            ):
                drafts = ApplicationBatch.objects.filter(
                    status__in=[
                        ApplicationBatchStatus.DRAFT,
                        ApplicationBatchStatus.AHJO_REPORT_CREATED,
                    ],
                    proposal_for_decision=self.proposal_for_decision,
                ).exclude(id=self.id)
                if len(drafts) > 0:
                    raise BatchTooManyDraftsError(
                        (
                            f"Too many existing drafts of type {self.proposal_for_decision}"
                        )
                    )

        def _clean_require_batch_data_on_completion(self):
            def raise_error():
                raise BatchCompletionRequiredFieldsError(
                    "Required batch fields are missing!"
                )

            if self.status not in [
                ApplicationBatchStatus.DECIDED_ACCEPTED,
                ApplicationBatchStatus.DECIDED_REJECTED,
            ]:
                return

            required_fields_rejected = [
                self.decision_maker_title,
                self.decision_maker_name,
                self.section_of_the_law,
                validate_decision_date(self.decision_date),
            ]

            required_fields_accepted_ahjo = required_fields_rejected + [
                self.p2p_checker_name,
            ]

            required_fields_accepted_p2p = required_fields_rejected + [
                self.p2p_inspector_name,
                self.p2p_inspector_email,
                self.p2p_checker_name,
            ]

            if (
                self.status == ApplicationBatchStatus.DECIDED_ACCEPTED
                and not all(required_fields_accepted_ahjo)
                and not all(required_fields_accepted_p2p)
            ):
                raise_error()
            if self.status == ApplicationBatchStatus.DECIDED_REJECTED and not all(
                required_fields_rejected
            ):
                raise_error()

        _clean_require_batch_data_on_completion(self)
        _clean_one_draft_per_decision(self)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def update_batch_after_details_request(
        self, status_to_update: ApplicationBatchStatus, details: AhjoDecisionDetails
    ):
        """
        Update the application batch with the details received from the Ahjo decision request and with
        details from the applications_ahjo_setting table.
        """
        try:
            if not self.auto_generated_by_ahjo:
                raise ImproperlyConfigured(
                    "This batch was not auto-generated by Ahjo, so it should not be updated"
                )
            self.decision_maker_name = details.decision_maker_name
            self.decision_maker_title = details.decision_maker_title
            self.section_of_the_law = details.section_of_the_law
            self.decision_date = details.decision_date.date()

            p2p_settings = AhjoSetting.objects.get(name="p2p_settings")
            self.p2p_checker_name = p2p_settings.data["acceptor_name"]
            self.p2p_inspector_name = p2p_settings.data["inspector_name"]
            self.p2p_inspector_email = p2p_settings.data["inspector_email"]

            if status_to_update == ApplicationBatchStatus.DECIDED_ACCEPTED:
                self.proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
            elif status_to_update == ApplicationBatchStatus.DECIDED_REJECTED:
                self.proposal_for_decision = AhjoDecision.DECIDED_REJECTED

            self.status = status_to_update
            self.save()
        except ObjectDoesNotExist:
            raise ImproperlyConfigured("No p2p settings found in the database")

    @property
    def applications_can_be_modified(self):
        """
        After the applications have been sent to Ahjo, the handlers should not be able to modify
        the applications. If the batch is returned without decision (as might theoretically happen),
        then the handlers may need to make changes again.
        """
        return self.status in [
            ApplicationBatchStatus.DRAFT,
            ApplicationBatchStatus.RETURNED,
        ]

    @property
    def is_decided(self):
        return self.ahjo_decision is not None

    AHJO_DECISION_LOGIC = {
        ApplicationBatchStatus.DRAFT: None,
        ApplicationBatchStatus.RETURNED: None,  # decision was not made, the applications are returned for processing
        ApplicationBatchStatus.AWAITING_AHJO_DECISION: None,
        ApplicationBatchStatus.DECIDED_ACCEPTED: AhjoDecision.DECIDED_ACCEPTED,
        ApplicationBatchStatus.DECIDED_REJECTED: AhjoDecision.DECIDED_REJECTED,
        # If the batch is rejected, it can not move to SENT_TO_TALPA status
        ApplicationBatchStatus.SENT_TO_TALPA: AhjoDecision.DECIDED_ACCEPTED,
        # If the batch is rejected, it can not move to COMPLETED status
        ApplicationBatchStatus.COMPLETED: AhjoDecision.DECIDED_ACCEPTED,
    }

    @property
    def ahjo_decision(self):
        return self.AHJO_DECISION_LOGIC[self.status]

    def __str__(self):
        return (
            "Application batch"
            f" {self.applications.count()} {self.proposal_for_decision} {self.status}"
        )

    class Meta:
        db_table = "bf_applicationbatch"
        verbose_name = _("application batch")
        verbose_name_plural = _("application batches")


class ApplicationBasis(UUIDModel, TimeStampedModel):
    """
    basis/justification for the application.
    The identifier is not meant to be displayed to the end user. The actual name that is shown to the applicant
    is determined by the UI, and localized as needed.
    """

    identifier = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)

    history = HistoricalRecords(
        table_name="bf_applications_applicationbasis_history",
        cascade_delete_history=True,
    )

    def __str__(self):
        return self.identifier

    class Meta:
        db_table = "bf_applications_applicationbasis"
        verbose_name = _("application basis")
        verbose_name_plural = _("application bases")


class Employee(UUIDModel, TimeStampedModel):
    application = models.OneToOneField(
        Application,
        verbose_name=_("application"),
        related_name="employee",
        on_delete=models.CASCADE,
    )

    history = HistoricalRecords(
        table_name="bf_applications_employee_history",
        cascade_delete_history=True,
    )

    encrypted_first_name = EncryptedCharField(
        max_length=128, verbose_name=_("first name"), blank=True
    )

    encrypted_last_name = EncryptedCharField(
        max_length=128, verbose_name=_("last name"), blank=True
    )

    first_name = SearchField(
        hash_key=settings.EMPLOYEE_FIRST_NAME_HASH_KEY,
        encrypted_field_name="encrypted_first_name",
    )

    last_name = SearchField(
        hash_key=settings.EMPLOYEE_LAST_NAME_HASH_KEY,
        encrypted_field_name="encrypted_last_name",
    )

    encrypted_social_security_number = EncryptedCharField(
        max_length=11, verbose_name=_("social security number"), blank=True
    )

    social_security_number = SearchField(
        hash_key=settings.SOCIAL_SECURITY_NUMBER_HASH_KEY,
        encrypted_field_name="encrypted_social_security_number",
    )

    phone_number = PhoneNumberField(
        verbose_name=_("phone number"),
        blank=True,
    )
    email = models.EmailField(blank=True, verbose_name=_("email"))

    employee_language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],
        max_length=2,
        blank=True,  # as of 2021-06, only required for power of attorney, so it's optional
    )

    job_title = models.CharField(
        blank=True, verbose_name=_("job title"), max_length=128
    )
    monthly_pay = models.DecimalField(  # non-zero
        verbose_name=_("monthly pay"),
        decimal_places=2,
        max_digits=7,
        blank=True,
        null=True,
    )
    vacation_money = models.DecimalField(  # can be zero
        verbose_name=_("vacation money"),
        decimal_places=2,
        max_digits=7,
        blank=True,
        null=True,
    )

    other_expenses = models.DecimalField(  # can be zero
        verbose_name=_("other expenses"),
        decimal_places=2,
        max_digits=7,
        blank=True,
        null=True,
    )
    working_hours = models.DecimalField(
        verbose_name=_("working hour"),
        decimal_places=2,
        max_digits=5,
        blank=True,
        null=True,
    )
    collective_bargaining_agreement = models.CharField(
        max_length=64, blank=True, verbose_name=_("collective bargaining agreement")
    )
    is_living_in_helsinki = models.BooleanField(
        default=False, verbose_name=_("is living in helsinki")
    )

    commission_amount = models.DecimalField(
        verbose_name=_("amount of the commission (eur)"),
        decimal_places=2,
        max_digits=7,
        blank=True,
        null=True,
    )

    commission_description = models.CharField(
        max_length=256,
        verbose_name=_("Description of the commission"),
        blank=True,
    )

    @property
    def birthday(self):
        if not self.social_security_number:
            return None
        # invalid social security number results in ValueError.
        # input validation should ensure it's always valid.
        return social_security_number_birthdate(self.social_security_number)

    def __str__(self):
        return "{} {} ({})".format(self.first_name, self.last_name, self.email)

    class Meta:
        db_table = "bf_applications_employee"
        verbose_name = _("employee")
        verbose_name_plural = _("employees")


def cleanup_filename(instance, filename):
    filename = re.sub(
        r"^[\s.]", "_", filename
    )  # replace leading whitespace and dots with underscore
    filename = re.sub(
        r"\.[^.]+$", lambda m: m.group(0).lower(), filename
    )  # replace extension with lowercase
    return filename


class Attachment(UUIDModel, TimeStampedModel):
    """
    created_at field from TimeStampedModel provides the upload timestamp
    """

    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="attachments",
        on_delete=models.CASCADE,
    )
    attachment_type = models.CharField(
        max_length=64,
        verbose_name=_("attachment type in business rules"),
        choices=AttachmentType.choices,
    )
    content_type = models.CharField(
        max_length=100,
        choices=ATTACHMENT_CONTENT_TYPE_CHOICES,
        verbose_name=_("technical content type of the attachment"),
    )
    attachment_file = models.FileField(
        verbose_name=_("application attachment content"), upload_to=cleanup_filename
    )

    ahjo_version_series_id = models.CharField(max_length=64, null=True, blank=True)

    ahjo_hash_value = models.CharField(max_length=64, null=True, blank=True)

    downloaded_by_ahjo = models.DateTimeField(null=True, blank=True)

    history = HistoricalRecords(
        table_name="bf_applications_attachment_history", cascade_delete_history=True
    )

    class Meta:
        db_table = "bf_applications_attachment"
        verbose_name = _("attachment")
        verbose_name_plural = _("attachments")
        ordering = ["application__created_at", "attachment_type", "created_at"]

    def __str__(self):
        return "{} {}".format(self.attachment_type, self.attachment_file.name)


class ReviewState(models.Model):
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_("application"),
    )
    paper = models.BooleanField(default=False, verbose_name=_("paper"))
    company = models.BooleanField(default=False, verbose_name=_("company"))
    company_contact_person = models.BooleanField(
        default=False, verbose_name=_("company contact person")
    )
    de_minimis_aids = models.BooleanField(
        default=False, verbose_name=_("de minimis aids")
    )
    co_operation_negotiations = models.BooleanField(
        default=False, verbose_name=_("co-operation negotiations")
    )
    employee = models.BooleanField(default=False, verbose_name=_("employee"))
    pay_subsidy = models.BooleanField(default=False, verbose_name=_("pay subsidy"))
    benefit = models.BooleanField(default=False, verbose_name=_("benefit"))
    employment = models.BooleanField(default=False, verbose_name=_("employment"))
    approval = models.BooleanField(default=False, verbose_name=_("approval"))


class AhjoSetting(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    data = JSONField()


class AhjoStatus(TimeStampedModel):
    """
    Ahjo status of the application
    """

    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=AhjoStatusEnum.choices,
        default=AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
    )
    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="ahjo_status",
        on_delete=models.CASCADE,
    )
    error_from_ahjo = JSONField(
        null=True,
        blank=True,
    )

    ahjo_request_id = models.CharField(
        max_length=64,
        null=True,
        blank=True,
    )

    validation_error_from_ahjo = JSONField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.status} for application {self.application.application_number}, \
created_at: {self.created_at}, modified_at: {self.modified_at}, \
ahjo_request_id: {self.ahjo_request_id}"

    class Meta:
        db_table = "bf_applications_ahjo_status"
        verbose_name = _("ahjo status")
        verbose_name_plural = _("ahjo statuses")
        ordering = ["application__created_at", "created_at"]
        get_latest_by = "created_at"
        UniqueConstraint(fields=["application_id", "status"], name="unique_status")


class DecisionProposalTemplateSection(UUIDModel, TimeStampedModel):
    """Model representing a template section of a decision proposal text, usually either the decision
    text or the following justification text.
    """

    decision_type = models.CharField(
        max_length=64,
        verbose_name=_("type of the decision"),
        choices=DecisionType.choices,
        default=DecisionType.ACCEPTED,
    )

    language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],
        max_length=2,
    )

    template_decision_text = models.TextField(
        verbose_name=_("Proposal text, decision"), null=True
    )

    template_justification_text = models.TextField(
        verbose_name=_("Proposal text, justification"), null=True
    )

    name = models.CharField(
        max_length=256, verbose_name=_("name of the decision text template")
    )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "bf_applications_decision_proposal_template_section"
        verbose_name = _("Ahjo decision text template")
        verbose_name_plural = _("Ahjo decision text templates")


class AhjoDecisionText(UUIDModel, TimeStampedModel):
    """Model representing a submitted decision text submitted to Ahjo for an application."""

    decision_type = models.CharField(
        max_length=64,
        verbose_name=_("type of the decision"),
        choices=DecisionType.choices,
        default=DecisionType.ACCEPTED,
    )

    language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],
        max_length=2,
    )

    decision_text = models.TextField(verbose_name=_("decision text content"))

    application = models.OneToOneField(
        Application,
        verbose_name=_("application"),
        on_delete=models.CASCADE,
    )
    decision_maker_name = models.TextField(
        verbose_name=_("the name of the decision maker"),
        null=True,
        blank=True,
    )

    decision_maker_id = models.CharField(
        verbose_name=_("the ID of the decision maker"),
        null=True,
        blank=True,
        max_length=64,
    )

    signer_name = models.TextField(
        verbose_name=_("the name of the signer"),
        null=True,
        blank=True,
    )

    signer_id = models.CharField(
        verbose_name=_("the ID of the signer"),
        null=True,
        blank=True,
        max_length=64,
    )

    def __str__(self):
        return (
            "Ahjo decision text for application %s"
            % self.application.application_number
        )

    class Meta:
        db_table = "bf_applications_ahjo_decision_text"
        verbose_name = _("ahjo decision text")
        verbose_name_plural = _("ahjo decision texts")


class ApplicationAlteration(TimeStampedModel):
    """
    An alteration reported by the applying organization, due to changes in
    the employment of the employee in question. An application may have
    multiple alterations applied to it.
    """

    application = models.ForeignKey(
        Application,
        verbose_name=_("Alteration of application"),
        related_name="alteration_set",
        on_delete=models.CASCADE,
    )

    alteration_type = models.TextField(
        verbose_name=_("Type of alteration"), choices=ApplicationAlterationType.choices
    )

    state = models.TextField(
        verbose_name=_("State of alteration"),
        choices=ApplicationAlterationState.choices,
        default=ApplicationAlterationState.RECEIVED,
    )

    end_date = models.DateField(verbose_name=_("New benefit end date"))

    resume_date = models.DateField(
        verbose_name=_("Date when employment resumes after suspended"),
        null=True,
        blank=True,
    )

    reason = models.TextField(
        verbose_name=_("Reason for alteration"),
        blank=True,
    )

    handled_at = models.DateField(
        verbose_name=_("Date when alteration notice was handled"),
        null=True,
        blank=True,
    )

    recovery_start_date = models.DateField(
        verbose_name=_("The first day the unwarranted benefit will be collected from"),
        null=True,
        blank=True,
    )

    recovery_end_date = models.DateField(
        verbose_name=_("The last day the unwarranted benefit will be recovered from"),
        null=True,
        blank=True,
    )

    recovery_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name=_("Amount of unwarranted benefit to be recovered"),
        null=True,
        blank=True,
    )

    use_einvoice = models.BooleanField(
        verbose_name=_(
            "Whether to use handle billing with an e-invoice instead of a bill sent to a physical address"
        ),
        default=False,
    )

    einvoice_provider_name = models.TextField(
        verbose_name=_("Name of the e-invoice provider"),
        blank=True,
    )

    einvoice_provider_identifier = models.TextField(
        verbose_name=_("Identifier of the e-invoice provider"),
        blank=True,
    )

    einvoice_address = models.TextField(
        verbose_name=_("E-invoice address"),
        blank=True,
    )

    contact_person_name = models.TextField(
        verbose_name=_("Contact person"),
    )

    is_recoverable = models.BooleanField(
        verbose_name=_("Whether the alteration should be recovered"),
        default=False,
    )

    recovery_justification = models.TextField(
        verbose_name=_(
            "The justification provided in the recovering bill, if eligible"
        ),
        blank=True,
    )

    handled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        verbose_name=_("Handled by"),
    )

    cancelled_at = models.DateField(
        verbose_name=_(
            "The date the alteration was cancelled after it had been handled"
        ),
        null=True,
        blank=True,
    )

    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        verbose_name=_("Cancelled by"),
    )


class AhjoDecisionProposalDraft(TimeStampedModel):
    """
    Draft of decision proposal. Supports application handling
    when drafting a decision that ultimately leads to Ahjo handling and decision.
    """

    class Meta:
        db_table = "bf_applications_decision_proposal_draft"
        verbose_name = _("decision_proposal_draft")
        verbose_name_plural = _("decision_proposal_drafts")

    application = models.OneToOneField(
        Application,
        verbose_name=_("application"),
        related_name="decision_proposal_draft",
        on_delete=models.CASCADE,
    )

    review_step = models.CharField(
        max_length=64,
        verbose_name=_("step of the draft proposal"),
        blank=True,
        null=True,
        default=1,
        choices=[(1, "step 1"), (2, "step 2"), (3, "step 3"), (4, "submitted")],
    )

    status = models.CharField(
        max_length=64,
        verbose_name=_("Proposal status"),
        choices=[
            (ApplicationStatus.ACCEPTED, "accepted"),
            (ApplicationStatus.REJECTED, "rejected"),
        ],
        null=True,
        blank=True,
    )

    log_entry_comment = models.TextField(
        verbose_name=_("Log entry comment"),
        blank=True,
        null=True,
    )

    granted_as_de_minimis_aid = models.BooleanField(
        default=False, null=True, blank=False
    )

    handler_role = models.CharField(
        max_length=64,
        verbose_name=_(
            "Handler role (DEPRECATED, was used before dynamic fetch of decision makers)"
        ),
        blank=True,
        null=True,
        choices=HandlerRole.choices,
    )

    decision_text = models.TextField(
        verbose_name=_("Decision text content"),
        blank=True,
        null=True,
    )

    justification_text = models.TextField(
        verbose_name=_("Justification text content"),
        blank=True,
        null=True,
    )
    decision_maker_name = models.TextField(
        verbose_name=_("the name of the decision maker role"),
        null=True,
        blank=True,
    )

    decision_maker_id = models.CharField(
        verbose_name=_("the ID of the decision maker"),
        null=True,
        blank=True,
        max_length=64,
    )

    signer_name = models.TextField(
        verbose_name=_("the name of the signer"),
        null=True,
        blank=True,
    )

    signer_id = models.CharField(
        verbose_name=_("the ID of the signer"),
        null=True,
        blank=True,
        max_length=64,
    )


class ArchivalApplication(UUIDModel, TimeStampedModel):
    class Meta:
        db_table = "bf_applications_archival_application"

    application_number = models.TextField(
        verbose_name="application_number",
        blank=True,
        null=True,
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="archival_applications",
        verbose_name=_("company"),
        null=True,
    )

    submitted_at = models.TextField(
        verbose_name="submitted_at",
        blank=True,
        null=True,
    )

    encrypted_employee_first_name = EncryptedCharField(
        max_length=128, verbose_name=_("first name"), blank=True
    )

    encrypted_employee_last_name = EncryptedCharField(
        max_length=128, verbose_name=_("last name"), blank=True
    )

    employee_first_name = SearchField(
        hash_key=settings.EMPLOYEE_FIRST_NAME_HASH_KEY,
        encrypted_field_name="encrypted_employee_first_name",
    )

    employee_last_name = SearchField(
        hash_key=settings.EMPLOYEE_LAST_NAME_HASH_KEY,
        encrypted_field_name="encrypted_employee_last_name",
    )

    start_date = models.DateField(
        verbose_name="start_date",
        blank=True,
        null=True,
    )
    end_date = models.DateField(
        verbose_name="end_date",
        blank=True,
        null=True,
    )
    benefit_type = models.TextField(
        verbose_name="benefit_type",
        blank=True,
        null=True,
    )

    months_total = models.TextField(
        verbose_name="months_total",
        blank=True,
        null=True,
    )

    year_of_birth = models.TextField(
        verbose_name="day_of_birth",
        blank=True,
        null=True,
    )

    status = models.TextField(
        choices=ApplicationStatus.choices, default=ApplicationStatus.ARCHIVAL
    )

    handled_at = models.DateField(
        verbose_name="handled_at",
        blank=True,
        null=True,
    )

    def employee(self):
        return {
            "first_name": self.employee_first_name,
            "last_name": self.employee_last_name,
        }
