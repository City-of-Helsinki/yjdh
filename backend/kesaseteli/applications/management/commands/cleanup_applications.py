import logging

from django.core.management.base import BaseCommand

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication, YouthApplication

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Cleanup draft employer applications and expired youth applications."

    def add_arguments(self, parser):
        parser.add_argument(
            "--employer-drafts",
            action="store_true",
            help="Purge all employer applications in draft mode.",
        )
        parser.add_argument(
            "--youth-expired",
            action="store_true",
            help="Purge all youth applications that have not been activated and whose"
            "activation link has expired.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Dry run mode, don't actually delete anything.",
        )

    def handle(self, *args, **options):
        employer_drafts = options["employer_drafts"]
        youth_expired = options["youth_expired"]
        dry_run = options["dry_run"]

        if not employer_drafts and not youth_expired:
            self.stdout.write(
                "No cleanup options specified. Use --help for available options."
            )
            return

        if employer_drafts:
            self.cleanup_employer_drafts(dry_run)

        if youth_expired:
            self.cleanup_youth_expired(dry_run)

    def cleanup_employer_drafts(self, dry_run):
        qs = EmployerApplication.objects.filter(status=EmployerApplicationStatus.DRAFT)
        count = qs.count()
        if dry_run:
            self.stdout.write(
                f"Dry run: {count} employer applications in draft mode would be deleted."  # noqa: E501
            )
        else:
            qs.delete()
            self.stdout.write(
                f"Successfully deleted {count} employer applications in draft mode."
            )

    def cleanup_youth_expired(self, dry_run):
        # YouthApplication.expired() returns those where created_at older than
        # expiration according to YouthApplication.expiration_duration()
        qs = YouthApplication.objects.filter(
            receipt_confirmed_at__isnull=True
        ).expired()
        count = qs.count()
        if dry_run:
            self.stdout.write(
                f"Dry run: {count} expired youth applications would be deleted."
            )
        else:
            qs.delete()
            self.stdout.write(
                f"Successfully deleted {count} expired youth applications."
            )
