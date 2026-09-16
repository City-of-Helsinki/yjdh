import logging

from django.core.management.base import BaseCommand

from applications.mock_context_service import TalpaExportMockService

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Ensure at least --count EmployerSummerVouchers are available for "
        "Talpa export. Creates clearly-labelled test applications for missing ones. "
        "Intended for dev/test environments only — schedule via CronJob manifest."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            required=True,
            help="Target number of unhandled Talpa-exportable vouchers.",
        )

    def handle(self, *args, **options):
        target = options["count"]
        created = TalpaExportMockService.ensure_talpa_export_test_applications(target)
        if created:
            self.stdout.write(
                self.style.SUCCESS(f"Created {created} test application(s).")
            )
        else:
            self.stdout.write("Already at target count. Nothing created.")
