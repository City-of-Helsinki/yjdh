from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application


class Command(BaseCommand):
    help = "Delete cancelled applications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="The number of days to keep cancelled applications",
        )

    def handle(self, *args, **options):
        number_of_deleted_applications = delete_cancelled_applications(options["days"])
        self.stdout.write(
            f"Deleted {number_of_deleted_applications} cancelled applications"
        )


def delete_cancelled_applications(days_to_keep):
    """Delete cancelled applications older than the given number of days and their attachments"""

    cancelled_applications = Application.objects.filter(
        status=ApplicationStatus.CANCELLED,
        modified_at__lte=(timezone.now() - timedelta(days=days_to_keep)),
    )
    number_of_cancelled_applications = cancelled_applications.count()
    for application in cancelled_applications:
        for attachment in application.attachments.all():
            attachment.attachment_file.delete()
        application.delete()

    return number_of_cancelled_applications
