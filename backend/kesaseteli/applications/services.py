import logging
from typing import TYPE_CHECKING

from django.conf import settings
from django.template import Context, Template
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template

import applications.target_groups
from applications.enums import APPLICATION_LANGUAGE_CHOICES, EmailTemplateType
from applications.mock_context_service import MockContextService
from applications.models import EmailTemplate, SummerVoucherConfiguration
from common.utils import send_mail_with_error_logging

if TYPE_CHECKING:
    from applications.models import YouthApplication


LOGGER = logging.getLogger(__name__)


class TargetGroupValidationService:
    @staticmethod
    def get_associated_target_group(application: "YouthApplication") -> str | None:
        """
        Return the identifier of the first matching target group if the applicant
        belongs to any of the enabled target groups for the application's year.
        Returns None if no match found.

        NOTE: API view raises an error if configuration is missing while creating
        youth application.
        """

        try:
            config = SummerVoucherConfiguration.objects.get(
                year=application.created_at.year
            )
        except SummerVoucherConfiguration.DoesNotExist:
            LOGGER.warning(
                "No SummerVoucherConfiguration found for year %s",
                application.created_at.year,
            )
            return None

        for identifier in config.target_group:
            target_group_class = applications.target_groups.get_target_group_class(
                identifier
            )
            if target_group_class and target_group_class().is_valid(application):
                return identifier

        return None

    @staticmethod
    def is_applicant_in_target_group(application: "YouthApplication") -> bool:
        """
        Check if the applicant belongs to any of the enabled target groups for the
        application's year.
        """
        return (
            TargetGroupValidationService.get_associated_target_group(application)
            is not None
        )


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
