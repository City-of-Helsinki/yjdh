from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application


class Command(BaseCommand):
    help = "Delete applications with the given status (draft or cancelled) and older than the given number of days"
    allowed_statuses = [ApplicationStatus.DRAFT, ApplicationStatus.CANCELLED]

    def add_arguments(self, parser):
        parser.add_argument(
            "--days_to_keep",
            type=int,
            default=30,
            help="The number of days to keep the applications",
        )

        parser.add_argument(
            "--status",
            type=str,
            default="cancelled",
            help="The status of the applications to delete",
        )

    def handle(self, *args, **options):
        if options["status"] not in self.allowed_statuses:
            self.stdout.write(f"Status {options['status']} is not allowed")
            return
        number_of_deleted_applications = _delete_applications(
            options["days_to_keep"], options["status"]
        )
        self.stdout.write(
            f"Deleted {number_of_deleted_applications} applications with status {options['status']}"
        )


def _delete_applications(days_to_keep: int, status: str) -> int:
    """Delete applications with the given status and older than the given number of days.
    Also delete their attachment files."""

    applications_to_delete = Application.objects.filter(
        status=status,
        modified_at__lte=(timezone.now() - timedelta(days=days_to_keep)),
    )
    number_of_applications_to_delete = applications_to_delete.count()

    for application in applications_to_delete:
        for attachment in application.attachments.all():
            attachment.attachment_file.delete()
        application.delete()

    return number_of_applications_to_delete
