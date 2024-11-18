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

BENEFIT_PERIOD_IS_ABOUT_TO_END_MESSAGE = _(
    "Your application's {application_number} benefit period will end soon, at {benefit_end_date}."
)


class Command(BaseCommand):
    help = "Query applications that are close to the end of the benefit period and send a notification to the applicant"

    def add_arguments(self, parser):
        parser.add_argument(
            "--notify",
            type=int,
            default=30,
            help="The number of days before benefit end date and when to notify the applicant",
        )

    def handle(self, *args, **options):
        number_of_notified_applications = notify_applications(options["notify"])
        self.stdout.write(
            f"Notified users of {number_of_notified_applications} applications about ending benefit period"
        )


def notify_applications(days_to_period_end: int) -> int:
    """Query applications that are close to the benefit end date and not have any alterations.
    Send a notification to the applicant.
    Returns the number of notified applications."""

    target_date = timezone.now() + timedelta(days=days_to_period_end)
    applications_to_notify = Application.objects.filter(
        application_origin=ApplicationOrigin.APPLICANT,
        status=ApplicationStatus.ACCEPTED,
        end_date=(target_date),
        alteration_set__isnull=True,
    )

    for application in applications_to_notify:
        _send_notification_mail(application, target_date)

    return applications_to_notify.count()


def get_benefit_notice_email_notification_subject():
    return str(_("Your Helsinki benefit application benefit period is about to end"))


def _send_notification_mail(application: Application, target_date: date) -> int:
    """Send a notification mail to the applicant about the upcoming end of the benefit period"""

    context = get_email_template_context(application)
    context["upcoming_benefit_end_date"] = target_date.strftime("%d.%m.%Y")
    context["benefit_company_name"] = application.company_name
    context["benefit_start_date"] = application.start_date.strftime("%d.%m.%Y")
    context["benefit_end_date"] = application.end_date.strftime("%d.%m.%Y")

    subject = get_benefit_notice_email_notification_subject()
    message = render_email_template(context, "benefit-period-end-notice", "txt")
    html_message = render_email_template(context, "benefit-period-end-notice", "html")

    return send_email_to_applicant(application, subject, message, html_message)
