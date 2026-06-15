import logging
from itertools import batched

from django.core.management.base import BaseCommand
from django.db import transaction

from applications.models import YouthApplication

LOGGER = logging.getLogger(__name__)

DEFAULT_BATCH_SIZE = 500


class Command(BaseCommand):
    help = (
        "Rebuild the YouthApplication.social_security_number search hash for every "
        "row using the current SOCIAL_SECURITY_NUMBER_HASH_KEY. Run this in the same "
        "deploy that changes the hash key value, so exact-match searches keep working "
        "after the value of the hash key has been changed."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=DEFAULT_BATCH_SIZE,
            help=(
                "Number of rows per bulk_update statement "
                f"(default: {DEFAULT_BATCH_SIZE})."
            ),
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Count the rows that would be rehashed without writing anything.",
        )

    def handle(self, *args, **options):
        batch_size = options["batch_size"]
        dry_run = options["dry_run"]

        if dry_run:
            total = YouthApplication.objects.count()
            self.stdout.write(
                f"Dry run: {total} youth application search hashes would be rebuilt."
            )
            return

        # Using bulk_update on the social_security_number values rehashes them.
        # See the related tests for verification that this works.
        rehashed = 0
        pks = list(YouthApplication.objects.values_list("pk", flat=True))
        for pk_chunk in batched(pks, batch_size):
            with transaction.atomic():
                youth_application_chunk = (
                    YouthApplication.objects.select_for_update().filter(pk__in=pk_chunk)
                )
                rehashed += YouthApplication.objects.bulk_update(
                    youth_application_chunk, ["social_security_number"]
                )
                LOGGER.info(
                    f"Rehashed {rehashed} youth application search hashes so far..."
                )

        self.stdout.write(
            f"Successfully rebuilt {rehashed} youth application search hashes."
        )
