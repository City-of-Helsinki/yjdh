import logging
import time
from typing import List

from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand

from applications.enums import AhjoStatus as AhjoStatusEnum, ApplicationStatus
from applications.models import Application
from applications.services.ahjo_authentication import (
    AhjoToken,
    AhjoTokenExpiredException,
)
from applications.services.ahjo_integration import (
    create_status_for_application,
    get_token,
    send_open_case_request_to_ahjo,
)

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send a request to Ahjo to open cases for applications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--number",
            type=int,
            default=50,
            help="Number of applications to send open case requests for",
        )

        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run the command without making actual changes",
        )

    def handle(self, *args, **options):
        try:
            ahjo_auth_token = get_token()
        except AhjoTokenExpiredException as e:
            LOGGER.error(f"Failed to get auth token from Ahjo: {e}")
            return
        except ImproperlyConfigured as e:
            LOGGER.error(f"Failed to get auth token from Ahjo: {e}")
            return

        number_to_process = options["number"]
        dry_run = options["dry_run"]

        applications = Application.objects.get_by_statuses(
            [ApplicationStatus.HANDLING], AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO
        )

        if not applications:
            self.stdout.write("No applications to process")
            return

        applications = applications[:number_to_process]

        if dry_run:
            self.stdout.write(
                f"Would send open case requests for {len(applications)} applications to Ahjo"
            )
            if len(applications):
                self.stdout.write("Would send open case requests for applications:")
                for application in applications:
                    if not application.calculation.handler.ad_username:
                        raise ImproperlyConfigured(
                            f"No ad_username set for the handler of application {application.id}."
                        )
                    self.stdout.write(
                        f"ID: {application.id}, number: {application.application_number}"
                    )
            return

        self.run_requests(applications[:number_to_process], ahjo_auth_token)

    def run_requests(self, applications: List[Application], ahjo_auth_token: AhjoToken):
        start_time = time.time()
        successful_applications = []

        self.stdout.write(
            f"Sending request to Ahjo to open cases for {len(applications)} applications"
        )

        for application in applications:
            sent_application, response_text = send_open_case_request_to_ahjo(
                application, ahjo_auth_token
            )
            if sent_application:
                successful_applications.append(sent_application)
                self._handle_succesfully_opened_application(
                    sent_application, response_text
                )

        self.stdout.write(
            f"Sent open case requests for {len(successful_applications)} applications to Ahjo"
        )
        end_time = time.time()
        elapsed_time = end_time - start_time
        self.stdout.write(
            f"Submitting {len(successful_applications)} open case requests took {elapsed_time} seconds to run."
        )

    def _handle_succesfully_opened_application(
        self, application: Application, response_text: str
    ):
        """Create Ahjo status for application and set Ahjo case guid"""
        create_status_for_application(
            application, AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT
        )
        # The guid is returned in the response text in text format {guid}, so remove brackets here
        response_text = response_text.replace("{", "").replace("}", "")
        application.ahjo_case_guid = response_text
        application.save()

        self.stdout.write(
            f"Successfully submitted open case request for application {application.id} to Ahjo, \
            received GUID: {response_text}"
        )
