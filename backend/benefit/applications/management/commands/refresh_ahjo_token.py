from django.core.management.base import BaseCommand

from applications.services.ahjo_authentication import AhjoConnector


class Command(BaseCommand):
    help = "Refresh the Ahjo token"

    def handle(self, *args, **options):
        ahjo_connector = AhjoConnector()
        try:
            token = ahjo_connector.refresh_token()
        except Exception as e:
            self.stdout.write(f"Failed to refresh Ahjo token: {e}")
        self.stdout.write(f"Ahjo token refreshed, token valid until {token.expires_in}")
