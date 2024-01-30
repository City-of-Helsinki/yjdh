from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand

from applications.models import AhjoSetting
from applications.services.ahjo_authentication import AhjoConnector


class Command(BaseCommand):
    help = "Refresh the Ahjo token using the refresh_token stored in the database"

    def handle(self, *args, **options):
        try:
            ahjo_auth_code = AhjoSetting.objects.get(name="ahjo_code").data
            self.stdout.write(f"Retrieved auth code: {ahjo_auth_code}")
        except ObjectDoesNotExist:
            self.stdout.write(
                "Error: Ahjo auth code not found in database. Please set the 'ahjo_code' setting."
            )
            return

        ahjo_connector = AhjoConnector()
        if not ahjo_connector.is_configured():
            self.stdout.write(
                "Error: Ahjo connector is not properly configured. Please check your settings."
            )
            return
        try:
            token = ahjo_connector.refresh_token()
            self.stdout.write(
                f"Ahjo token refreshed, token valid until {token.expires_in}"
            )
        except Exception as e:
            self.stdout.write(f"Failed to refresh Ahjo token: {e}")
            return
