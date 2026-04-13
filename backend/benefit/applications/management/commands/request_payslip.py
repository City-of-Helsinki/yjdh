from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from applications.enums import ApplicationOrigin, ApplicationStatus
from applications.models import Application
from calculator.enums import InstalmentStatus
from calculator.models import Instalment
from messages.automatic_messages import (
    get_email_template_context,
    render_email_template,
    send_email_to_applicant,
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
        (number_of_notified_applications, application_numbers) = notify_applications(
            options["notify"]
        )
        application_number_strings = ", ".join(str(x) for x in application_numbers)
        self.stdout.write(
            f"Notified users of {number_of_notified_applications} applications about"
            + f" benefit checkpoint: {application_number_strings}"
        )


def notify_applications(days_to_notify: int) -> tuple[int, list[int]]:
    """Query applications that are close to the benefit checkpoint date
    and not have any alterations. Send a notification to the applicant.
    Returns the number of notified applications."""

    target_date = timezone.now().date() - timedelta(days=days_to_notify)
    applications_to_notify = Application.objects.filter(
        application_origin=ApplicationOrigin.APPLICANT,
        status=ApplicationStatus.ACCEPTED,
        start_date=target_date,
        alteration_set__isnull=True,
    )

    sent_mail_count = 0
    application_numbers = []
    for application in applications_to_notify:
        # Change the instalment status to REQUESTED
        instalment_2_qs = Instalment.objects.filter(
            calculation=application.calculation,
            instalment_number=2,
            status=InstalmentStatus.WAITING,
        )
        if instalment_2_qs:
            mail_sent = _send_notification_mail(application)
            sent_mail_count += mail_sent
            if mail_sent > 0:
                instalment_2 = instalment_2_qs[0]
                instalment_2.status = InstalmentStatus.REQUESTED
                instalment_2.save()
                application_numbers.append(application.application_number)

    return sent_mail_count, application_numbers


def get_benefit_notice_email_notification_subject():
    return str(
        _("Payment of the second installment of the Helsinki benefit requires measures")
    )


def _send_notification_mail(application: Application) -> int:
    """Send a notification mail to the applicant about the upcoming checkpoint"""

    context = get_email_template_context(application)
    subject = get_benefit_notice_email_notification_subject()
    message = render_email_template(context, "payslip-required", "txt")
    html_message = render_email_template(context, "payslip-required", "html")

    return send_email_to_applicant(application, subject, message, html_message)
