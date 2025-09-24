from datetime import timedelta
from typing import List

from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application


class Command(BaseCommand):
    help = (
        "Delete applications with the given status (draft or cancelled) and older than"
        " the given number of days"
    )
    allowed_statuses = [
        ApplicationStatus.DRAFT,
        ApplicationStatus.CANCELLED,
        ApplicationStatus.ARCHIVAL,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
    ]

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--keep",
            type=int,
            default=30,
            help="The number of days to keep the applications",
        )

        parser.add_argument(
            "--status",
            type=str,
            nargs="+",  # Allow multiple statuses
            help=(
                "The statuses of the applications to delete. pass multiple statuses"
                " separated by spaces."
            ),
        )

    def handle(self, *args, **options) -> None:
        keep_days = options["keep"]
        statuses = options["status"]
        if statuses:
            invalid_statuses = [
                status for status in statuses if status not in self.allowed_statuses
            ]
            if invalid_statuses:
                self.stderr.write(
                    f"Invalid statuses provided: {', '.join(invalid_statuses)}. Allowed"
                    f" statuses are: {', '.join(self.allowed_statuses)}."
                )
                return

        number_of_deleted_applications = _delete_applications(keep_days, statuses)
        self.stdout.write(
            f"Deleted {number_of_deleted_applications} applications with status"
            f" {options['status']}"
        )


def _delete_applications(days_to_keep: int, statuses: List[str]) -> int:
    """Delete applications with the given status and older than the given number of days.
    Also delete their attachment files."""  # noqa: E501

    applications_to_delete = Application.objects.filter(
        status__in=statuses,
        modified_at__lte=(timezone.now() - timedelta(days=days_to_keep)),
    )
    number_of_applications_to_delete = applications_to_delete.count()

    for application in applications_to_delete:
        for attachment in application.attachments.all():
            attachment.attachment_file.delete()
        application.delete()

    return number_of_applications_to_delete
