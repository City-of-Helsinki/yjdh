import logging

from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

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
        parser.add_argument(
            "--ignore-5-years-restriction",
            action="store_true",
            help="Bypass the 5-year retention restriction. By default, "
            "all the applications must be stored for 5 years by information "
            "management plan.",
        )

    def handle(self, *args, **options):
        """Handle cleanup operations."""
        employer_drafts = options["employer_drafts"]
        youth_expired = options["youth_expired"]
        dry_run = options["dry_run"]
        ignore_5_years_restriction = options["ignore_5_years_restriction"]

        if not employer_drafts and not youth_expired:
            self.stdout.write(
                "No cleanup options specified. Use --help for available options."
            )
            return

        if employer_drafts:
            self.cleanup_employer_drafts(dry_run, ignore_5_years_restriction)

        if youth_expired:
            self.cleanup_youth_expired(dry_run, ignore_5_years_restriction)

    def cleanup_employer_drafts(self, dry_run, ignore_5_years_restriction):
        """Clean up employer applications in draft mode."""
        qs = EmployerApplication.objects.filter(status=EmployerApplicationStatus.DRAFT)
        if not ignore_5_years_restriction:
            five_years_ago = timezone.now() - relativedelta(years=5)
            qs = qs.filter(created_at__lte=five_years_ago)
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

    def cleanup_youth_expired(self, dry_run, ignore_5_years_restriction):
        """Clean up youth applications that have expired."""
        # YouthApplication.expired() returns those where created_at older than
        # expiration according to YouthApplication.expiration_duration()
        qs = YouthApplication.objects.filter(
            receipt_confirmed_at__isnull=True
        ).expired()
        if not ignore_5_years_restriction:
            five_years_ago = timezone.now() - relativedelta(years=5)
            qs = qs.filter(created_at__lte=five_years_ago)
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
