from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _

from applications.enums import ApplicationStatus
from applications.models import Application
from messages.automatic_messages import (
    get_email_template_context,
    render_email_template,
    send_email_to_applicant,
)

APPLICATION_ABOUT_TO_BE_DELETED_MESSAGE = _(
    "Your application {id} will be deleted soon. If you want to continue the application process, please do so by "
    "{application_deletion_date}, otherwise the application will deleted permanently."
)


class Command(BaseCommand):
    help = "Query draft applications that are close to the deletion date and send a notification to the applicant"

    def add_arguments(self, parser):
        parser.add_argument(
            "--notify",
            type=int,
            default=14,
            help="The number of days before the deletion date and when to notify the applicant",
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
            f"Notified users of {number_of_notified_applications} applications about upcoming application deletion"
        )


def notify_applications(days_to_deletion: int, days_to_keep: int) -> int:
    """Query applications that are close to the deletion date and send a notification to the applicant.
    Returns the number of notified applications."""

    applications_to_notify = Application.objects.filter(
        status=ApplicationStatus.DRAFT,
        modified_at__lte=(timezone.now()),
    )

    for application in applications_to_notify:
        _send_notification_mail(application, days_to_deletion)

    return applications_to_notify.count()


def _send_notification_mail(application: Application, days_to_deletion: int) -> int:
    """Send a notification mail to the applicant about the upcoming application deletion"""

    application_deletion_date = (
        application.modified_at + timedelta(days=days_to_deletion)
    ).strftime("%d.%m.%Y")

    format_lazy(
        APPLICATION_ABOUT_TO_BE_DELETED_MESSAGE,
        id=application.application_number,
        application_deletion_date=application_deletion_date,
    )

    subject = _("Your application is about to be deleted")
    context = get_email_template_context(application)
    context["application_deletion_date"] = application_deletion_date
    message = render_email_template(context, "draft-notice", "txt")
    html_message = render_email_template(context, "draft-notice", "html")

    return send_email_to_applicant(application, subject, message, html_message)
