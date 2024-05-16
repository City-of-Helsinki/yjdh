import logging

from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand

from applications.services.ahjo_integration import (
    get_token,
    send_subscription_request_to_ahjo,
)

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Subscribe to decisions API for decision status updates"

    def handle(self, *args, **options):
        try:
            ahjo_auth_token = get_token()
        except ImproperlyConfigured as e:
            LOGGER.error(f"Failed to get auth token from Ahjo: {e}")
            return
        send_subscription_request_to_ahjo(ahjo_auth_token)
        self.stdout.write("Subscribed to decisions API")
        return
