from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand

from applications.services.ahjo_authentication import (
    AhjoConnector,
    AhjoTokenRetrievalError,
)


class Command(BaseCommand):
    help = "Refresh the Ahjo token using the refresh_token stored in the database"

    def handle(self, *args, **options):
        ahjo_connector = AhjoConnector()
        if not ahjo_connector.is_configured():
            raise ImproperlyConfigured(
                "Ahjo connector is not properly configured. Please check your settings."
            )
        try:
            token = ahjo_connector.refresh_token()
            self.stdout.write(f"Ahjo token refreshed, new access token: {token}")
        except Exception as e:
            raise AhjoTokenRetrievalError(f"Failed to refresh Ahjo token: {e}")
