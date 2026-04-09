import logging
from typing import TYPE_CHECKING

from auditlog.models import LogEntry
import jsonpath_ng
from django.conf import settings
from django.contrib.auth import get_user_model
from django.template import Context, Template
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template

import applications.target_groups
from applications.enums import APPLICATION_LANGUAGE_CHOICES, EmailTemplateType
from applications.mock_context_service import MockContextService
from applications.models import EmailTemplate, School, SummerVoucherConfiguration
from common.utils import send_mail_with_error_logging

if TYPE_CHECKING:
    from django.contrib.contenttypes.models import ContentType

    from applications.models import YouthApplication


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
    def reinitialize_from_file(template: EmailTemplate) -> bool:
        """
        Reinitialize the EmailTemplate using Django's template loading system.
        Avoids manual file IO by accessing the template source directly.
        """
        template_path = f"email/{template.type}_email_{template.language}.html"

        try:
            django_template = get_template(template_path)
            content = django_template.template.source

        except (TemplateDoesNotExist, AttributeError):
            LOGGER.warning(
                f"Template source not found or inaccessible: {template_path}"
            )
            return False

        lines = content.splitlines()
        if len(lines) < 3:
            LOGGER.warning(
                f"Template file {template_path} is missing required lines "
                "(Subject + Body)"
            )
            return False

        # Parse: Line 0 = Subject, Line 1 = Empty Separator, Line 2+ = Body
        template.subject = lines[0].strip()
        template.html_body = "\n".join(lines[2:])
        template.text_body = ""

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
        actor: User,
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
        actor: User,
        actor_email: str,
        additional_data: dict,
    ) -> LogEntry:
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
class VTJService:
    @staticmethod
    def _is_search_successful(vtj_json_dict: dict) -> bool:
        """Check if the VTJ query return code indicates success."""
        return vtj_json_dict.get("Paluukoodi", {}).get("@koodi") == "0000"

    @staticmethod
    def _is_person_found(vtj_json_dict: dict) -> bool:
        """Check if the search basis return code indicates the person was found."""
        return (
            vtj_json_dict.get("Hakuperusteet", {})
            .get("Henkilotunnus", {})
            .get("@hakuperustePaluukoodi")
            == "1"
        )

    @staticmethod
    def _has_restricted_residency_data(vtj_json_dict: dict) -> bool:
        """
        Check if key residency fields are null, which indicates restricted data
        for a found person.
        """

        # Using jsonpath_ng for consistency with models.py logic
        def get_value(expression):
            matches = jsonpath_ng.parse(expression).find(vtj_json_dict)
            return matches[0].value if matches else None

        kuntanumero = get_value("$.Henkilo.Kotikunta.Kuntanumero")
        lahiosoite_s = get_value("$.Henkilo.VakinainenKotimainenLahiosoite.LahiosoiteS")

        return kuntanumero is None and lahiosoite_s is None

    @staticmethod
    def is_response_restricted(vtj_json_dict: dict) -> bool:
        """
        Detect if the VTJ response indicates that the personal data is restricted
        due to a non-disclosure of personal data (turvakielto).

        Example of a restricted response structure::

            {
                "Paluukoodi": {"@koodi": "0000"},
                "Hakuperusteet": {
                    "Henkilotunnus": {"@hakuperustePaluukoodi": "1", ...}
                },
                "Henkilo": {
                    "Kotikunta": {"Kuntanumero": None, "KuntaS": None, ...},
                    "VakinainenKotimainenLahiosoite": {"LahiosoiteS": None, ...}
                }
            }
        """
        if not vtj_json_dict or not isinstance(vtj_json_dict, dict):
            return False

        return (
            VTJService._is_search_successful(vtj_json_dict)
            and VTJService._is_person_found(vtj_json_dict)
            and VTJService._has_restricted_residency_data(vtj_json_dict)
        )
