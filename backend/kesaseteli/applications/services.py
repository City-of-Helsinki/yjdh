import enum
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, TYPE_CHECKING, TypedDict

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser

import jsonpath_ng
import sentry_sdk
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.template import Context, Template
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template
from django.utils import timezone
from requests import ReadTimeout
from requests.exceptions import RequestException

import applications.target_groups
from applications.api.integration_views import TALPA_INVOICEABLE_STATUSES
from applications.api.v1.exceptions import VTJServiceUnavailableError
from applications.enums import (
    ActionType,
    APPLICATION_LANGUAGE_CHOICES,
    EmailTemplateType,
    EmployerApplicationStatus,
    TimelineItemType,
    VtjTestCase,
)
from applications.mock_context_service import MockContextService
from applications.models import (
    EmailTemplate,
    EmployerApplication,
    EmployerSummerVoucher,
    School,
    SummerVoucherConfiguration,
    TimelineActivityLog,
    YouthApplication,
)
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_not_found_content,
    mock_vtj_person_id_query_restricted_content,
)
from common.utils import are_same_texts, html_to_text, send_mail_with_error_logging
from shared.vtj.vtj_client import VTJClient

LOGGER = logging.getLogger(__name__)

User = get_user_model()


class TargetGroupValidationService:
    @staticmethod
    def is_applicant_in_target_group(application: "YouthApplication") -> bool:
        """
        Check if the applicant belongs to the target group they specified,
        and that the target group is enabled for the application's year.
        Returns True if it's a valid match and can be automatically processed.
        """
        if not application.target_group:
            return False

        target_group_class = applications.target_groups.get_target_group_class(
            application.target_group
        )
        if not target_group_class:
            return False

        # Check if the target group is enabled for the year
        try:
            config = SummerVoucherConfiguration.objects.get(
                year=application.created_at.year
            )
            if application.target_group not in config.target_group:
                return False
        except SummerVoucherConfiguration.DoesNotExist:
            return False

        # Check if the applicant actually belongs to this target group
        return target_group_class().is_valid(application)


class EmailTemplateService:
    @staticmethod
    def get_template_lines_from_file(template: EmailTemplate) -> list[str] | None:
        """
        Get the lines of the template file corresponding to the given EmailTemplate.

        :return List of lines of the template file corresponding to the given
        EmailTemplate if the file is found and is valid, otherwise None.
        """
        template_path = f"email/{template.type}_email_{template.language}.html"

        try:
            django_template = get_template(template_path)
            content = django_template.template.source

        except (TemplateDoesNotExist, AttributeError):
            LOGGER.warning(
                f"Template source not found or inaccessible: {template_path}"
            )
            return None

        lines = content.splitlines()
        if len(lines) < 3:
            LOGGER.warning(
                f"Template file {template_path} is missing required lines "
                "(Subject + Body)"
            )
            return None

        return lines

    @staticmethod
    def is_template_up_to_date(template: EmailTemplate) -> bool:
        """
        Check if the EmailTemplate content matches the corresponding template file.

        :return: True if the content does match, False if it does not or the input file
        is missing or invalid.
        """
        lines = EmailTemplateService.get_template_lines_from_file(template)
        if lines is None:
            return False

        expected_subject = lines[0].strip()
        expected_html_body_lines = lines[2:]
        expected_text_body = html_to_text("\n".join(expected_html_body_lines))

        return (
            template.subject == expected_subject
            and template.html_body.splitlines() == expected_html_body_lines
            and template.text_body == expected_text_body
        )

    @staticmethod
    def reinitialize_from_file(template: EmailTemplate) -> bool:
        """
        Reinitialize the EmailTemplate using Django's template loading system.
        Avoids manual file IO by accessing the template source directly.

        :return True if successful, False if input file is missing or invalid.
        """
        lines = EmailTemplateService.get_template_lines_from_file(template)
        if lines is None:
            return False

        # Parse: Line 0 = Subject, Line 1 = Empty Separator, Line 2+ = Body
        template.subject = lines[0].strip()  # type: ignore
        template.html_body = "\n".join(lines[2:])  # type: ignore
        template.text_body = ""  # type: ignore

        template.save()
        return True

    @staticmethod
    def ensure_templates_exist() -> int:
        """
        Ensure that all EmailTemplate combinations exist.
        If a template is missing, create it and load content from file.
        Returns the number of created/updated templates.
        """
        count = 0
        for template_type in EmailTemplateType.values:
            for language, _ in APPLICATION_LANGUAGE_CHOICES:
                template, created = EmailTemplate.objects.get_or_create(
                    type=template_type,
                    language=language,
                    defaults={
                        "subject": "Placeholder",
                        "html_body": "",
                        "text_body": "",
                    },
                )

                if created:
                    if EmailTemplateService.reinitialize_from_file(template):
                        count += 1
                    else:
                        LOGGER.warning(
                            f"Created placeholder for {template_type}/{language} "
                            "but file not found."
                        )
        return count

    @staticmethod
    def render_template_with_mock_context(template: EmailTemplate) -> dict[str, str]:
        """
        Render the template with mock context.
        Returns a dictionary containing "subject", "body" (HTML) and "text_body".
        Raises exception if rendering fails.
        """
        mock_context = MockContextService.get_mock_context(
            template.type, template.language
        )
        subject = Template(template.subject).render(Context(mock_context))
        html_body = Template(template.html_body).render(Context(mock_context))
        text_body = Template(template.text_body).render(Context(mock_context))
        return {"subject": subject, "body": html_body, "text_body": text_body}

    @staticmethod
    def send_template_preview_to_email(
        template: EmailTemplate, email_address: str
    ) -> bool:
        """
        Render the template with mock context and send it to the specified
        email address.
        Returns True if sent successfully, False otherwise.
        Raises exception if rendering fails.
        """
        rendered = EmailTemplateService.render_template_with_mock_context(template)
        subject = rendered["subject"]
        html_body = rendered["body"]
        text_body = rendered["text_body"]

        return send_mail_with_error_logging(
            subject=subject,
            message=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_address],
            error_message=(
                f"Failed to send email template {template} to {email_address}"
            ),
            html_message=html_body,
        )

    @staticmethod
    def send_email_from_db_template(
        template_type: str,
        language: str,
        context: dict,
        recipient_list: list,
        error_message: str,
        bcc=None,
        images=None,
    ) -> bool:
        try:
            template = EmailTemplate.objects.get(type=template_type, language=language)
        except EmailTemplate.DoesNotExist:
            LOGGER.error(
                f"EmailTemplate not found for type {template_type} and "
                f"language {language}"
            )
            return False

        django_context = Context(context)
        subject = Template(template.subject).render(django_context)
        body = Template(template.text_body).render(django_context)
        html_body = Template(template.html_body).render(django_context)

        return send_mail_with_error_logging(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            error_message=error_message,
            bcc=bcc,
            html_message=html_body,
            images=images,
        )


class SchoolService:
    @staticmethod
    def import_schools(school_names: list[str]) -> tuple[int, int]:
        """
        Import schools from a list of names.
        Returns a tuple of (created_count, existing_count).
        """
        created_count = 0
        existing_count = 0

        for name in school_names:
            name = name.strip()
            if name:
                _school, created = School.objects.get_or_create(name=name)
                if created:
                    created_count += 1
                else:
                    existing_count += 1
        return created_count, existing_count


class AuditAccessLogService:
    """
    Service for creating ACCESS audit log entries with additional_data.
    """

    @staticmethod
    def create_access_log_entry_with_no_related_object_instance(
        *,
        actor: "AbstractBaseUser",
        actor_email: str,
        content_type: "ContentType",
        additional_data: dict,
    ) -> LogEntry:
        """
        Create an ACCESS audit log entry with no related object instance,
        but with additional data.
        """
        return LogEntry.objects.create(
            action=LogEntry.Action.ACCESS,
            actor=actor,
            actor_email=actor_email,
            content_type=content_type,
            additional_data=additional_data,
        )

    @staticmethod
    def create_access_log_entry_with_related_object_and_additional_data(
        *,
        accessed_instance,
        actor: "AbstractBaseUser",
        actor_email: str,
        additional_data: dict,
    ) -> LogEntry | None:
        """
        Create an ACCESS audit log entry with related object instance and
        additional data into which "is_sent" and "request_path" info
        can be set later.
        """
        return LogEntry.objects.log_create(
            accessed_instance,
            force_log=True,
            action=LogEntry.Action.ACCESS,
            actor=actor,
            actor_email=actor_email,
            additional_data=additional_data,
        )


class VTJService:
    """
    Service for interacting with the Finnish Population Information System (VTJ)
    and processing its responses.
    """

    @classmethod
    def get_vtj_test_case(cls, last_name: str) -> str:
        """Find the matching VTJ test case based on last name."""
        for test_case in VtjTestCase.values:
            if are_same_texts(last_name, test_case):
                return str(test_case)
        return ""

    @classmethod
    def is_vtj_test_case(cls, first_name: str, last_name: str) -> bool:
        """Check if first and last name match a VTJ test case."""
        return are_same_texts(first_name, VtjTestCase.first_name()) and bool(
            cls.get_vtj_test_case(last_name)
        )

    @classmethod
    def get_mocked_json_for_test_case(
        cls,
        vtj_test_case: str,
        first_name: str,
        last_name: str,
        social_security_number: str,
    ) -> Optional[str]:
        """Generate mocked VTJ JSON based on a specific test case."""
        if vtj_test_case == VtjTestCase.NOT_FOUND.value:
            return mock_vtj_person_id_query_not_found_content()
        elif vtj_test_case == VtjTestCase.NO_ANSWER.value:
            return None
        elif vtj_test_case == VtjTestCase.RESTRICTED.value:
            return mock_vtj_person_id_query_restricted_content(
                first_name=first_name,
                last_name=last_name,
                social_security_number=social_security_number,
            )

        return mock_vtj_person_id_query_found_content(
            first_name=first_name,
            last_name=(
                "VTJ-palvelun palauttama eri sukunimi"
                if vtj_test_case == VtjTestCase.WRONG_LAST_NAME.value
                else last_name
            ),
            social_security_number=social_security_number,
            is_alive=vtj_test_case != VtjTestCase.DEAD.value,
            is_home_municipality_helsinki=(
                vtj_test_case == VtjTestCase.HOME_MUNICIPALITY_HELSINKI.value
            ),
        )

    @classmethod
    def fetch_vtj_json(
        cls, application: "YouthApplication", end_user: str
    ) -> Optional[str]:
        """Retrieve VTJ JSON for an application, either from VTJ or via mocks."""
        if settings.NEXT_PUBLIC_DISABLE_VTJ:
            return None

        if settings.NEXT_PUBLIC_MOCK_FLAG:
            test_case = cls.get_vtj_test_case(application.last_name)
            if cls.is_vtj_test_case(application.first_name, application.last_name):
                if test_case == VtjTestCase.NO_ANSWER.value:
                    raise ReadTimeout()
                return cls.get_mocked_json_for_test_case(
                    vtj_test_case=test_case,
                    first_name=application.first_name,
                    last_name=application.last_name,
                    social_security_number=application.social_security_number,
                )
            return mock_vtj_person_id_query_not_found_content()

        try:
            vtj_data = VTJClient().get_personal_info(
                application.social_security_number, end_user
            )
        except (RequestException, ValueError) as e:
            sentry_sdk.capture_exception(e)
            raise VTJServiceUnavailableError() from e
        return json.dumps(vtj_data)

    @classmethod
    def is_response_restricted(cls, vtj_json_dict: dict) -> bool:
        """
        Detect if the VTJ response indicates a non-disclosure of personal data
        (turvakielto).
        """
        if not vtj_json_dict or not isinstance(vtj_json_dict, dict):
            return False

        return (
            cls._is_search_successful(vtj_json_dict)
            and cls._is_person_found(vtj_json_dict)
            and cls._has_restricted_residency_data(vtj_json_dict)
        )

    @classmethod
    def is_ssn_valid(cls, vtj_json_dict: dict, ssn: str) -> bool:
        """Check if the SSN is valid according to the VTJ response."""
        from common.utils import are_same_text_lists

        values = cls._vtj_values(
            vtj_json_dict, "$.Henkilo.Henkilotunnus.['@voimassaolokoodi', '#text']"
        )
        return are_same_text_lists(values, ["1", ssn])

    @classmethod
    def is_dead(cls, vtj_json_dict: dict) -> bool:
        """Check if the person is dead according to the VTJ response."""
        is_dead_flag = "1" in cls._vtj_values(
            vtj_json_dict, "$.Henkilo.Kuolintiedot.Kuollut"
        )
        death_date_values = cls._vtj_values(
            vtj_json_dict, "$.Henkilo.Kuolintiedot.Kuolinpvm"
        )
        has_death_date = len(death_date_values) > 0 and set(death_date_values) != {None}
        return is_dead_flag or has_death_date

    @classmethod
    def get_first_names(cls, vtj_json_dict: dict | None) -> str:
        """Extract the current first names from the VTJ response."""
        values = cls._vtj_values(vtj_json_dict, "$.Henkilo.NykyisetEtunimet.Etunimet")
        return (values[0] if values else "") or ""

    @classmethod
    def get_last_name(cls, vtj_json_dict: dict) -> str:
        """Extract the current last name from the VTJ response."""
        values = cls._vtj_values(vtj_json_dict, "$.Henkilo.NykyinenSukunimi.Sukunimi")
        return (values[0] if values else "") or ""

    @classmethod
    def get_home_municipality(cls, vtj_json_dict: dict) -> str:
        """Extract the home municipality name from the VTJ response."""
        values = cls._vtj_values(vtj_json_dict, "$.Henkilo.Kotikunta.KuntaS")
        return (values[0] if values else "") or ""

    @classmethod
    def _is_search_successful(cls, vtj_json_dict: dict) -> bool:
        """Check if the top-level VTJ query return code indicates success."""
        return vtj_json_dict.get("Paluukoodi", {}).get("@koodi") == "0000"

    @classmethod
    def _is_person_found(cls, vtj_json_dict: dict) -> bool:
        """
        Check if the specific search basis return code indicates the person was
        found
        ."""
        return (
            vtj_json_dict.get("Hakuperusteet", {})
            .get("Henkilotunnus", {})
            .get("@hakuperustePaluukoodi")
            == "1"
        )

    @classmethod
    def _has_restricted_residency_data(cls, vtj_json_dict: dict) -> bool:
        """Check if key residency fields are null (indicates turvakielto)."""
        hometown_values = cls._vtj_values(
            vtj_json_dict, "$.Henkilo.Kotikunta.Kuntanumero"
        )
        address_values = cls._vtj_values(
            vtj_json_dict, "$.Henkilo.VakinainenKotimainenLahiosoite.LahiosoiteS"
        )

        return hometown_values == [None] and address_values == [None]

    @classmethod
    def _vtj_values(cls, vtj_json_dict: dict | None, expression: str) -> list:
        """Internal helper to find values in VTJ JSON using JSONPath."""
        if not vtj_json_dict:
            return []
        matches = jsonpath_ng.parse(expression).find(vtj_json_dict)
        return [match.value for match in matches]


@dataclass(frozen=True)
class ActivityLogItem:
    """
    Data transfer object (DTO) representing a single parsed timeline activity.

    This dataclass maps a filtered subset of fields from TimelineActivityLog instance.
    It decouples the source model from the API serialization layer, allowing activity
    events to be easily sorted and combined with notes before delivery.

    Attributes:
        action_type (str): The mapped ActionType enum value
            (e.g. 'application_status_change').
        old_value (str): The previous value of the tracked field (coerced to a string).
        new_value (str): The updated value of the tracked field (coerced to a string).
        author_name (str): The full name of the user who performed the action,
            or an empty string.
        created_at (datetime): The timestamp when the change was recorded.
    """

    action_type: str
    old_value: str
    new_value: str
    author_name: str
    created_at: datetime
    target_id: str | None = None
    target_type: str | None = None


class TimelineService:
    """
    Service for aggregating and formatting the application timeline,
    combining TimelineActivityLog (i.e. application status changes) and handler notes.
    """

    ALLOWED_TIMELINE_FIELDS = {
        YouthApplication._meta.model_name: {
            "status": ActionType.APPLICATION_STATUS_CHANGE,
        },
        EmployerApplication._meta.model_name: {
            "status": ActionType.APPLICATION_STATUS_CHANGE,
        },
    }

    @classmethod
    def get_activity_logs_for_application(cls, application) -> list[ActivityLogItem]:
        """
        Fetch permanent timeline activity log entries for an application.
        """
        model_name = application._meta.model_name
        log_entries = (
            TimelineActivityLog.objects.filter(
                application_type=model_name,
                application_id=application.pk,
            )
            .select_related("target_content_type")
            .order_by("created_at")
        )

        return [
            ActivityLogItem(
                action_type=entry.action_type,
                old_value=entry.old_value,
                new_value=entry.new_value,
                author_name=entry.actor_name,
                created_at=entry.created_at,
                target_id=(
                    str(entry.target_object_id) if entry.target_object_id else None
                ),
                target_type=(
                    entry.target_content_type.model
                    if entry.target_content_type
                    else None
                ),
            )
            for entry in log_entries
        ]

    @classmethod
    def get_application_timeline_data(
        cls, application, requested_types: set[str]
    ) -> list[dict]:
        """
        Get combined, sorted notes and activity log data for an application timeline.
        """
        # Dynamic imports to avoid circular imports.
        from applications.api.v1.serializers import ActivityLogItemSerializer
        from handler_notes.api.v1.serializers import NoteSerializer
        from handler_notes.models import Note

        include_all = not requested_types

        notes_data = []
        if include_all or TimelineItemType.NOTE.value in requested_types:
            notes_qs = Note.objects.for_application_timeline(application)
            notes_data = list(NoteSerializer(notes_qs, many=True).data)

        activity_data = []
        if include_all or TimelineItemType.ACTIVITY.value in requested_types:
            activity_items = cls.get_activity_logs_for_application(application)
            activity_data = list(
                ActivityLogItemSerializer(activity_items, many=True).data
            )

        return sorted(
            notes_data + activity_data,
            key=lambda x: datetime.fromisoformat(x["created_at"]),
            reverse=True,
        )


class _VoucherClassification(enum.Enum):
    """Result of classifying a voucher in a Talpa webhook batch."""

    VALID = "valid"
    UNINVOICEABLE = "uninvoiceable"
    CONFLICT = "conflict"


class TalpaWebhookValidationError(TypedDict, total=False):
    unknown_ids: list[str]
    uninvoiceable_ids: list[str]
    conflict_ids: list[str]


class TalpaWebhookService:
    def __init__(self, successful_ids: set, failed_ids: set, request_id: str):
        self.successful_ids = successful_ids
        self.failed_ids = failed_ids
        self.request_id = request_id

    def has_overlapping_ids(self) -> bool:
        return bool(self.successful_ids & self.failed_ids)

    def get_overlapping_ids(self) -> set:
        return self.successful_ids & self.failed_ids

    def validate_and_lock_vouchers(self) -> TalpaWebhookValidationError:
        """
        Lock vouchers for update and validate they can transition to invoiced.

        Returns:
            TalpaWebhookValidationError with missing or conflicting IDs.
            If empty, the batch is valid and locked.
        """
        voucher_ids = self.successful_ids | self.failed_ids
        # Fetch with select_for_update to lock rows and prevent race conditions.
        # select_related application is needed to check status without extra queries.
        vouchers = (
            EmployerSummerVoucher.objects.select_for_update(of=("self", "application"))
            .select_related("application")
            .filter(pk__in=voucher_ids)
        )
        found_ids = {v.pk for v in vouchers}

        errors: TalpaWebhookValidationError = {}
        unknown_ids = voucher_ids - found_ids
        if unknown_ids:
            errors["unknown_ids"] = [str(i) for i in unknown_ids]

        uninvoiceable_ids = []
        conflict_ids = []

        for v in vouchers:
            classification = self._classify_voucher(
                v, self.request_id, is_failed=v.pk in self.failed_ids
            )
            if classification == _VoucherClassification.UNINVOICEABLE:
                uninvoiceable_ids.append(str(v.pk))
            elif classification == _VoucherClassification.CONFLICT:
                conflict_ids.append(str(v.pk))

        if uninvoiceable_ids:
            errors["uninvoiceable_ids"] = uninvoiceable_ids
        if conflict_ids:
            errors["conflict_ids"] = conflict_ids

        return errors

    def process_batch(self) -> int:
        """
        Execute the batch processing (mark successful, mark failed).
        Must be called within an atomic block after validation.
        """
        updated = self._mark_vouchers_as_invoiced(self.successful_ids, self.request_id)

        if self.failed_ids:
            self._handle_failed_vouchers(self.failed_ids, self.request_id)

        if self.successful_ids:
            self._handle_successful_vouchers(self.successful_ids)

        return updated

    def _classify_voucher(
        self,
        voucher: EmployerSummerVoucher,
        request_id: str,
        is_failed: bool = False,
    ) -> _VoucherClassification:
        """Classify a single voucher as uninvoiceable, conflict, or valid."""
        if voucher.invoiced_at is not None:
            # Already invoiced by a different request — conflict.
            # If it's the SAME request, it's an idempotent retry (no conflict).
            if voucher.talpa_request_id != request_id:
                return _VoucherClassification.CONFLICT
            if is_failed:
                return _VoucherClassification.CONFLICT
            return _VoucherClassification.VALID

        app_status = voucher.application.status
        if app_status not in TALPA_INVOICEABLE_STATUSES:
            # Idempotent retry: same request already failed this voucher.
            # Accept it so the caller is not forced to split the batch.
            if (
                app_status == EmployerApplicationStatus.ERROR_IN_PAYMENT
                and request_id
                and voucher.talpa_request_id == request_id
            ):
                # Same-request retry on ERROR_IN_PAYMENT — accept silently
                if not is_failed:
                    return _VoucherClassification.CONFLICT
                return _VoucherClassification.VALID
            return _VoucherClassification.UNINVOICEABLE

        return _VoucherClassification.VALID

    def _mark_vouchers_as_invoiced(self, voucher_ids: set, request_id: str) -> int:
        """
        Mark a set of vouchers as invoiced and exported.
        """
        return EmployerSummerVoucher.objects.filter(
            pk__in=voucher_ids,
            invoiced_at__isnull=True,
            application__status__in=TALPA_INVOICEABLE_STATUSES,
        ).update(
            invoiced_at=timezone.now(),
            talpa_request_id=request_id,
            is_exported=True,
        )

    def _handle_failed_vouchers(self, voucher_ids: set, request_id: str) -> None:
        """
        Persist request_id on failed vouchers and transition their applications
        to ERROR_IN_PAYMENT.

        State Changes:
        - Vouchers: talpa_request_id is updated to the provided request_id.
        - Applications: Status is transitioned to ERROR_IN_PAYMENT.
        - Audit/Timeline: A TimelineActivityLog entry is created for each
          application reflecting the status change to ERROR_IN_PAYMENT.
        """
        EmployerSummerVoucher.objects.filter(pk__in=voucher_ids).update(
            talpa_request_id=request_id
        )

        apps = (
            EmployerApplication.objects.filter(summer_vouchers__id__in=voucher_ids)
            .exclude(status=EmployerApplicationStatus.ERROR_IN_PAYMENT)
            .distinct()
        )
        records = list(apps.values_list("id", "status"))
        if not records:
            return

        TimelineActivityLog.objects.bulk_create(
            [
                TimelineActivityLog(
                    application_id=app_id,
                    application_type="employerapplication",
                    old_value=old_status,
                    new_value=EmployerApplicationStatus.ERROR_IN_PAYMENT,
                )
                for app_id, old_status in records
            ]
        )
        apps.update(status=EmployerApplicationStatus.ERROR_IN_PAYMENT)

    def _handle_successful_vouchers(self, voucher_ids: set) -> None:
        """
        Transition applications for successful vouchers to RECEIVED_BY_PAYMENT_SYSTEM.

        State Changes:
        - Applications: Status is transitioned to RECEIVED_BY_PAYMENT_SYSTEM (unless
          already in ERROR_IN_PAYMENT or RECEIVED_BY_PAYMENT_SYSTEM).
        - Audit/Timeline: A TimelineActivityLog entry is created for each
          application reflecting the status change to RECEIVED_BY_PAYMENT_SYSTEM.
        """
        apps = (
            EmployerApplication.objects.filter(summer_vouchers__id__in=voucher_ids)
            .exclude(
                status__in=[
                    EmployerApplicationStatus.ERROR_IN_PAYMENT,
                    EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
                ]
            )
            .distinct()
        )
        records = list(apps.values_list("id", "status"))
        if not records:
            return

        TimelineActivityLog.objects.bulk_create(
            [
                TimelineActivityLog(
                    application_id=app_id,
                    application_type="employerapplication",
                    old_value=old_status,
                    new_value=EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
                )
                for app_id, old_status in records
            ]
        )
        apps.update(status=EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM)
