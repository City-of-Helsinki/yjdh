import logging

from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.services.ahjo.request_handler import AhjoRequestHandler
from applications.services.ahjo_authentication import AhjoTokenExpiredException
from applications.services.ahjo_integration import get_token

LOGGER = logging.getLogger(__name__)


class AhjoRequestBaseClass(BaseCommand):
    help = "Base class for Ahjo-related commands"
    request_type = None  # To be set by subclasses

    def get_token(self):
        try:
            return get_token()
        except ImproperlyConfigured as e:
            LOGGER.error(f"Failed to get auth token for Ahjo: {e}")
            return None
        except AhjoTokenExpiredException as e:
            LOGGER.error(f"Ahjo Token expired: {e}")
            return None

    def handle(self, *args, **options):
        if self.request_type is None:
            raise NotImplementedError("request_type must be set in subclass")

        ahjo_auth_token = self.get_token()
        if not ahjo_auth_token:
            return
        try:
            handler = AhjoRequestHandler(ahjo_auth_token, self.request_type)
            handler.handle_request_without_application()
            self.style.SUCCESS(
                self.stdout.write(
                    f"{timezone.now()}: Request {self.request_type.value} made to Ahjo"
                )
            )
        except ValueError as e:
            self.style.ERROR(
                self.stdout.write(
                    f"{timezone.now()}: Failed to make request {self.request_type.value} to Ahjo: {e}"
                )
            )
            return
