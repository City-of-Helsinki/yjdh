import logging
from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.utils import translation
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from messages.models import Message, MessageType
from sentry_sdk import capture_message

LOGGER = logging.getLogger(__name__)

APPLICATION_REOPENED_MESSAGE = _(
    "Your application has been opened for editing. Please make the corrections by "
    "{additional_information_needed_by}, otherwise the application cannot be processed."
)


def send_application_reopened_message(
    user, application, additional_information_needed_by
):
    """
    :param user: The handler who is setting the application to ADDITIONAL_INFORMATION_REQUESTED status
    :param application: The application being reopened
    :param application: The last response date
    """
    with translation.override(application.applicant_language):
        Message.objects.create(
            sender=user,
            application=application,
            message_type=MessageType.HANDLER_MESSAGE,
            content=format_lazy(
                APPLICATION_REOPENED_MESSAGE,
                additional_information_needed_by=additional_information_needed_by.strftime(
                    "%d.%m.%Y"
                ),
            ),
        )
    notify_applicant_by_email_about_new_message(application)


def _message_notification_email_subject():
    # force evaluation of lazy string so that the messages in local memory queue remain translated
    # correctly during unit tests
    return str(_("You have received a new message from Helsinki benefit"))


def _message_notification_email_body(application):
    if submitted_at := application.submitted_at:
        submitted_at_fmt = submitted_at.strftime("%d.%m.%Y")
    else:
        # this should never happen in practice, as the applicants are not allowed to send messages
        # while application remains draft, and the handlers don't see non-submitted applications
        # at all.
        submitted_at_fmt = "n/a"
    return str(
        _(
            "A new message has been added to the Helsinki-benefit application "
            "%(application_number)s (%(submitted_at_fmt)s). "
            "Open that application to see the message."
        )
        % {
            "application_number": application.application_number,
            "submitted_at_fmt": submitted_at_fmt,
        }
    )


def notify_applicant_by_email_about_new_message(application):
    """
    :param user: The handler who is setting the application to ADDITIONAL_INFORMATION_REQUESTED status
    :param application: The application being reopened
    :param application: The last response date
    """
    if not application.company_contact_person_email:
        # company_contact_person_email is a required field for submitted applications
        LOGGER.warning(
            f"Application {application} does not have company_contact_person_email - unexpected"
        )
        return 0

    with translation.override(application.applicant_language):
        try:
            return send_mail(
                subject=_message_notification_email_subject(),
                message=_message_notification_email_body(application),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.company_contact_person_email],
                fail_silently=False,
            )
        except SMTPException:
            email_domain = "n/a"
            if "@" in application.company_contact_person_email:
                email_domain = application.company_contact_person_email.split("@")[1]
            capture_message(
                (
                    f"SMTPException while sending email to xxx@{email_domain}, "
                    f"application number {application.application_number}"
                ),
                "error",
            )
            return 0
