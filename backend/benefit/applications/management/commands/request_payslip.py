from datetime import date, timedelta

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

BENEFIT_CHECKPOINT_IS_UPCOMING_MESSAGE = _(
    "Your application's {application_number} checkpoint is upcoming, at"
    " {benefit_checkpoint_date}."
)


class Command(BaseCommand):
    help = (
        "Query applications that are close to the checkpoint date and"
        " notification to the applicant"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--notify",
            type=int,
            default=150,
            help=(
                "The number of days before which to notify about sending payslip"
                " of the applicant"
            ),
        )

    def handle(self, *args, **options):
        number_of_notified_applications = notify_applications(options["notify"])
        self.stdout.write(
            f"Notified users of {number_of_notified_applications} applications about"
            " benefit checkpoint"
        )


def notify_applications(days_to_notify: int) -> int:
    """Query applications that are close to the benefit checkpoint date
    and not have any alterations. Send a notification to the applicant.
    Returns the number of notified applications."""  # noqa: E501

    target_date = timezone.now() - timedelta(days=days_to_notify)
    applications_to_notify = Application.objects.filter(
        application_origin=ApplicationOrigin.APPLICANT,
        status=ApplicationStatus.ACCEPTED,
        start_date=target_date,
        alteration_set__isnull=True,
    )

    for application in applications_to_notify:
        _send_notification_mail(application, days_to_notify)

    return applications_to_notify.count()


def get_benefit_notice_email_notification_subject():
    return str(_("You need to send the employee's payslip"))


def _send_notification_mail(application: Application, days_to_notify: int) -> int:
    """Send a notification mail to the applicant about the upcoming checkpoint"""  # noqa: E501

    context = get_email_template_context(application)
    notification_date = (application.start_date + timedelta(days=days_to_notify))
    context["benefit_company_name"] = application.company_name
    context["benefit_start_date"] = application.start_date.strftime("%d.%m.%Y")
    context["benefit_checkpoint_date"] = notification_date.strftime("%d.%m.%Y")
    context["benefit_end_date"] = application.end_date.strftime("%d.%m.%Y")

    subject = get_benefit_notice_email_notification_subject()
    message = render_email_template(context, "benefit-request-payslip", "txt")
    html_message = render_email_template(context, "benefit-request-payslip", "html")

    return send_email_to_applicant(application, subject, message, html_message)
