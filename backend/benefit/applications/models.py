from applications.enums import (
    ApplicationStatus,
    ApplicationStep,
    AttachmentType,
    BenefitType,
)
from companies.models import Company
from django.db import connection, models
from django.utils.translation import gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField
from localflavor.generic.models import IBANField
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords

from shared.models.abstract_models import TimeStampedModel, UUIDModel

# todo: move to some better location?
APPLICATION_LANGUAGE_CHOICES = (
    ("fi", "suomi"),
    ("sv", "svenska"),
    ("en", "english"),
)

PAY_SUBSIDY_PERCENT_CHOICES = (
    (30, "30%"),
    (40, "40%"),
    (50, "50%"),
    (100, "100%"),
)

ATTACHMENT_CONTENT_TYPE_CHOICES = (
    ("application/pdf", "pdf"),
    ("image/png", "png"),
    ("image/jpeg", "jpeg"),
)


def _get_next_application_number():
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT nextval(%s)", [Application.APPLICATION_NUMBER_SEQUENCE_ID]
        )
        return cursor.fetchone()[0]


class Application(UUIDModel, TimeStampedModel):
    """
    Data model for Helsinki benefit applications

    The business id (y-tunnus) and company name are stored in the Company model

    There can be only one employee per application. Employees can not be shared with
    multiple applications.

    For additional descriptions of the fields, see the API documentation (serializers.py)
    """

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

    application_number = models.IntegerField(
        verbose_name=_("application number"), default=_get_next_application_number
    )

    company_name = models.CharField(max_length=256, verbose_name=_("company name"))

    company_form = models.CharField(max_length=64, verbose_name=_("company form"))

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

    company_bank_account_number = IBANField(
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

    co_operation_negotiations = models.BooleanField(null=True)
    co_operation_negotiations_description = models.CharField(
        max_length=256,
        verbose_name=_(
            "additional information about the ongoing co-operation negotiations"
        ),
        blank=True,
    )

    pay_subsidy_granted = models.BooleanField(null=True)

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

    APPLICATION_NUMBER_SEQUENCE_ID = "seq_application_number"

    def get_available_benefit_types(self):
        if (
            self.is_association_application()
            and not self.association_has_business_activities
        ):
            return [BenefitType.SALARY_BENEFIT]
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

    """
    In future - add Ahjo batch
    ahjo_batch = models.ForeignKey("AhjoBatch",
                              verbose_name=_("ahjo batch"),
                              related_name="applications",
                              null=True,
                              on_delete=models.SET_NULL,
    )
    """

    bases = models.ManyToManyField("ApplicationBasis", related_name="applications")

    history = HistoricalRecords(table_name="bf_applications_application_history")

    def __str__(self):
        return "{}: {} {}".format(self.pk, self.company_name, self.status)

    class Meta:
        db_table = "bf_applications_application"
        verbose_name = _("application")
        verbose_name_plural = _("applications")


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
    history = HistoricalRecords(table_name="applications_deminimisaid_history")

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
        table_name="bf_applications_applicationlogentry_history"
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


class ApplicationBasis(UUIDModel, TimeStampedModel):
    """
    basis/justification for the application.
    The identifier is not meant to be displayed to the end user. The actual name that is shown to the applicant
    is determined by the UI, and localized as needed.
    """

    identifier = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)

    history = HistoricalRecords(table_name="bf_applications_applicationbasis_history")

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

    first_name = models.CharField(
        max_length=128, verbose_name=_("first name"), blank=True
    )
    last_name = models.CharField(
        max_length=128, verbose_name=_("last name"), blank=True
    )
    social_security_number = EncryptedCharField(
        max_length=11, verbose_name=_("social security number"), blank=True
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
        decimal_places=1,
        max_digits=4,
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

    def __str__(self):
        return "{} {} ({})".format(self.first_name, self.last_name, self.email)

    class Meta:
        db_table = "bf_applications_employee"
        verbose_name = _("employee")
        verbose_name_plural = _("employees")


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
    attachment_file = models.FileField(verbose_name=_("application attachment content"))

    class Meta:
        db_table = "bf_applications_attachment"
        verbose_name = _("attachment")
        verbose_name_plural = _("attachments")
        ordering = ["application__created_at", "attachment_type", "created_at"]
