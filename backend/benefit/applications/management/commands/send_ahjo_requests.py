import logging
import time

from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand
from django.db.models import QuerySet

from applications.enums import (
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationStatus,
)
from applications.models import Application
from applications.services.ahjo_authentication import (
    AhjoToken,
    AhjoTokenExpiredException,
)
from applications.services.ahjo_integration import (
    get_token,
    send_decision_proposal_to_ahjo,
    send_new_attachment_records_to_ahjo,
    send_open_case_request_to_ahjo,
    update_application_summary_record_in_ahjo,
)

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = f"Send the specified requests to Ahjo Rest API. Possible request types are: \
{AhjoRequestType.OPEN_CASE}, {AhjoRequestType.SEND_DECISION_PROPOSAL}, \
{AhjoRequestType.ADD_RECORDS}, {AhjoRequestType.UPDATE_APPLICATION}"

    def add_arguments(self, parser):
        parser.add_argument(
            "--number",
            type=int,
            default=50,
            help="Number of applications to requests for",
        )

        parser.add_argument(
            "--request-type",
            type=AhjoRequestType,
            help="The type of request to send to Ahjo",
        )

        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run the command without making actual changes",
        )

    def get_applications_for_request(
        self, request_type: AhjoRequestType
    ) -> QuerySet[Application]:
        if request_type == AhjoRequestType.OPEN_CASE:
            applications = Application.objects.get_by_statuses(
                [ApplicationStatus.HANDLING],
                AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
            )
        elif request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
            applications = Application.objects.get_for_ahjo_decision()

        elif request_type == AhjoRequestType.ADD_RECORDS:
            applications = Application.objects.with_non_downloaded_attachments()

        elif request_type == AhjoRequestType.UPDATE_APPLICATION:
            applications = Application.objects.get_by_statuses(
                [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
                AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
            )
        return applications

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
        request_type = options["request_type"]

        applications = self.get_applications_for_request(request_type)

        if not applications:
            self.stdout.write("No applications to process")
            return

        applications = applications[:number_to_process]

        if dry_run:
            self.stdout.write(
                f"Would send {request_type} requests for {len(applications)} applications to Ahjo"
            )

            for application in applications:
                self.stdout.write(
                    f"ID: {application.id}, number: {application.application_number}"
                )
            return

        self.run_requests(
            applications[:number_to_process], ahjo_auth_token, request_type
        )

    def run_requests(
        self,
        applications: QuerySet[Application],
        ahjo_auth_token: AhjoToken,
        ahjo_request_type: AhjoRequestType,
    ) -> None:
        start_time = time.time()
        successful_applications = []
        failed_applications = []

        self.stdout.write(
            f"Sending {ahjo_request_type} request to Ahjo \
for {len(applications)} applications"
        )

        request_handler = self._get_request_handler(ahjo_request_type)

        counter = 0
        for application in applications:
            sent_application, response_text = request_handler(
                application, ahjo_auth_token
            )
            counter += 1
            if sent_application:
                successful_applications.append(sent_application)
                self._handle_successful_request(
                    counter, sent_application, response_text, ahjo_request_type
                )
            else:
                failed_applications.append(application)
                self._handle_failed_request(counter, application, ahjo_request_type)

        end_time = time.time()
        elapsed_time = end_time - start_time

        if successful_applications:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Sent {ahjo_request_type} requests for {len(successful_applications)} applications to Ahjo"
                )
            )
            self.stdout.write(
                f"Submitting {len(successful_applications)} open case requests took {elapsed_time} seconds to run."
            )
        if failed_applications:
            self.stdout.write(
                self.style.ERROR(
                    f"Failed to submit {ahjo_request_type} {len(failed_applications)} applications to Ahjo"
                )
            )

    def _handle_successful_request(
        self,
        counter: int,
        application: Application,
        response_text: str,
        request_type: AhjoRequestType,
    ):
        # The guid is returned in the response text in text format {guid}, so remove brackets here
        response_text = response_text.replace("{", "").replace("}", "")
        application.ahjo_case_guid = response_text
        application.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"{counter}. Successfully submitted {request_type} request for application {application.id} to Ahjo, \
            received GUID: {response_text}"
            )
        )

    def _handle_failed_request(
        self, counter: int, application: Application, request_type: AhjoRequestType
    ):
        self.stdout.write(
            self.style.ERROR(
                f"{counter}. Failed to submit {request_type} for application {application.id} to Ahjo"
            )
        )

    def _get_request_handler(self, request_type: AhjoRequestType):
        request_handlers = {
            AhjoRequestType.OPEN_CASE: send_open_case_request_to_ahjo,
            AhjoRequestType.SEND_DECISION_PROPOSAL: send_decision_proposal_to_ahjo,
            AhjoRequestType.ADD_RECORDS: send_new_attachment_records_to_ahjo,
            AhjoRequestType.UPDATE_APPLICATION: update_application_summary_record_in_ahjo,
        }
        return request_handlers.get(request_type)
