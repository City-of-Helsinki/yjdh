import logging
import time

from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand

from applications.services.ahjo_authentication import AhjoToken
from applications.services.ahjo_integration import (
    get_token,
    send_new_attachment_records_to_ahjo,
)

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send new records to Ahjo"

    def handle(self, *args, **options):
        try:
            ahjo_auth_token = get_token()
        except ImproperlyConfigured as e:
            LOGGER.error(f"Failed to get auth token from Ahjo: {e}")
            return

        self.run_requests(ahjo_auth_token)

    def run_requests(self, ahjo_auth_token: AhjoToken):
        start_time = time.time()

        self.stdout.write("Sending new records to Ahjo")

        responses = send_new_attachment_records_to_ahjo(ahjo_auth_token)
        self.stdout.write(f"Sent records for {len(responses)} applications to Ahjo")
        end_time = time.time()
        elapsed_time = end_time - start_time
        self.stdout.write(
            f"Done! Sending new records for {len(responses)} applications {elapsed_time} seconds to run."
        )
