from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from applications.enums import ApplicationOrigin, ApplicationStatus
from applications.models import Application
from messages.automatic_messages import (
    get_email_template_context,
    render_email_template,
    send_email_to_applicant,
)

APPLICATION_ABOUT_TO_BE_DELETED_MESSAGE = _(
    "Your application {id} will be deleted soon. If you want to continue the"
    " application process, please do so by {application_deletion_date}, otherwise the"
    " application will deleted permanently."
)


class Command(BaseCommand):
    help = (
        "Query draft applications that are close to the deletion date and send a"
        " notification to the applicant"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--notify",
            type=int,
            default=14,
            help=(
                "The number of days before the deletion date and when to notify the"
                " applicant"
            ),
        )

        parser.add_argument(
            "--keep",
            type=int,
            default=180,
            help="The number of days to keep the applications",
        )

    def handle(self, *args, **options):
        number_of_notified_applications = notify_applications(
            options["notify"], options["keep"]
        )
        self.stdout.write(
            f"Notified users of {number_of_notified_applications} applications about"
            " upcoming application deletion"
        )


def notify_applications(days_to_deletion: int, days_to_keep: int) -> int:
    """Query applications that are close to the deletion date and send a notification to the applicant.
    Returns the number of notified applications."""

    draft_scope_in_days = days_to_keep - days_to_deletion
    applications_to_notify = Application.objects.filter(
        application_origin=ApplicationOrigin.APPLICANT,
        status=ApplicationStatus.DRAFT,
        modified_at__lte=(timezone.now() - timedelta(days=(draft_scope_in_days))),
        modified_at__gte=(timezone.now() - timedelta(days=(draft_scope_in_days + 1))),
    )

    for application in applications_to_notify:
        _send_notification_mail(application, days_to_keep)

    return applications_to_notify.count()


def get_draft_notice_email_notification_subject():
    return str(_("Your Helsinki benefit draft application will expire"))


def _send_notification_mail(application: Application, days_to_keep: int) -> int:
    """Send a notification mail to the applicant about the upcoming application deletion"""
    application_deletion_date = (
        application.modified_at + timedelta(days=(days_to_keep))
    ).strftime("%d.%m.%Y")
    context = get_email_template_context(application)
    context["application_deletion_date"] = application_deletion_date

    subject = get_draft_notice_email_notification_subject()
    message = render_email_template(context, "draft-notice", "txt")
    html_message = render_email_template(context, "draft-notice", "html")

    return send_email_to_applicant(application, subject, message, html_message)
