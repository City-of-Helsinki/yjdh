import logging
import time
from datetime import datetime
from typing import Dict, List, Union

from django.core.exceptions import ImproperlyConfigured, ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.db.models import QuerySet

from applications.enums import (
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationBatchStatus,
    ApplicationStatus,
)
from applications.models import AhjoStatus, Application
from applications.services.ahjo.exceptions import DecisionProposalAlreadyAcceptedError
from applications.services.ahjo_application_service import AhjoApplicationsService
from applications.services.ahjo_authentication import (
    AhjoToken,
    AhjoTokenExpiredException,
)
from applications.services.ahjo_decision_service import (
    parse_details_from_decision_response,
)
from applications.services.ahjo_integration import (
    delete_application_in_ahjo,
    get_decision_details_from_ahjo,
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
{AhjoRequestType.ADD_RECORDS}, {AhjoRequestType.UPDATE_APPLICATION}, \
{AhjoRequestType.GET_DECISION_DETAILS}, {AhjoRequestType.DELETE_APPLICATION}"
    is_retry = False

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

        parser.add_argument(
            "--retry-failed-older-than",
            type=int,
            default=0,
            help="Retry sending requests for applications that have \
not moved to the next status in the last x hours",
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
        request_type = options["request_type"]
        retry_failed_older_than_hours = options["retry_failed_older_than"]

        if retry_failed_older_than_hours > 0:
            self.is_retry = True

        applications = AhjoApplicationsService.get_applications_for_request(
            request_type, retry_failed_older_than_hours
        )

        if not applications:
            self.stdout.write(self._print_with_timestamp("No applications to process"))
            return

        applications = applications[:number_to_process]

        if dry_run:
            message_start = "retry" if self.is_retry else "send"

            self.stdout.write(
                f"Would {message_start} sending {request_type} \
requests for {len(applications)} applications to Ahjo"
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

        application_numbers = ", ".join(
            str(app.application_number) for app in applications
        )
        message_start = "Retrying" if self.is_retry else "Sending"

        message = f"{message_start} {ahjo_request_type} request to Ahjo \
for {len(applications)} applications: {application_numbers}"

        self.stdout.write(self._print_with_timestamp(message))

        request_handler = self._get_request_handler(ahjo_request_type)

        counter = 0
        exception_messages = {
            ValueError: "Value error for application",
            ObjectDoesNotExist: "Object not found error for application",
            ImproperlyConfigured: "Improperly configured error for application",
            DecisionProposalAlreadyAcceptedError: "Decision proposal error for application",
        }

        for application in applications:
            counter += 1

            try:
                sent_application, response_text = request_handler(
                    application, ahjo_auth_token
                )
            except tuple(exception_messages.keys()) as e:
                error_text = f"{exception_messages[type(e)]} {application.application_number}: {e}"
                LOGGER.error(error_text)
                failed_applications.append(application)
                self._handle_failed_request(
                    counter, application, ahjo_request_type, error_text
                )
                continue

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

        self._print_results(
            successful_applications,
            failed_applications,
            ahjo_request_type,
            elapsed_time,
        )

    def _print_results(
        self,
        successful_applications,
        failed_applications,
        ahjo_request_type,
        elapsed_time,
    ):
        if successful_applications:
            self.stdout.write(
                self.style.SUCCESS(
                    self._print_with_timestamp(
                        f"Sent {ahjo_request_type} requests for {len(successful_applications)} applications to Ahjo"
                    )
                )
            )
            self.stdout.write(
                f"Submitting {len(successful_applications)} {ahjo_request_type} \
requests took {elapsed_time} seconds to run."
            )
        if failed_applications:
            self.stdout.write(
                self.style.ERROR(
                    self._print_with_timestamp(
                        f"Failed to submit {ahjo_request_type} {len(failed_applications)} applications to Ahjo"
                    )
                )
            )

    def _handle_details_request_success(
        self, application: Application, response_dict: Dict
    ) -> str:
        """Extract the details from the dict and update the application batch with them and also
        with the p2p settings from ahjo_settings table"""

        details = parse_details_from_decision_response(response_dict)

        batch_status_to_update = ApplicationBatchStatus.DECIDED_ACCEPTED
        if application.status == ApplicationStatus.REJECTED:
            batch_status_to_update = ApplicationBatchStatus.DECIDED_REJECTED

        batch = application.batch
        batch.update_batch_after_details_request(batch_status_to_update, details)

        AhjoStatus.objects.create(
            application=application, status=AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO
        )

        return f"Successfully received and updated decision details \
for application {application.id} and batch {batch.id} from Ahjo"

    def _handle_application_request_success(
        self,
        application: Application,
        counter: int,
        response_text: str,
        request_type: AhjoRequestType,
    ) -> str:
        # The request id  is returned in the response text in text format {request_id}, so remove brackets here
        response_text = response_text.replace("{", "").replace("}", "")
        ahjo_status = application.ahjo_status.latest()
        ahjo_status.ahjo_request_id = response_text
        ahjo_status.save()

        return f"{counter}. Successfully submitted {request_type} request for application {application.id}, \
            number: {application.application_number}, to Ahjo, \
            received Ahjo requestId: {response_text}"

    def _handle_successful_request(
        self,
        counter: int,
        application: Application,
        response_content: Union[str, List],
        request_type: AhjoRequestType,
    ) -> None:
        if request_type == AhjoRequestType.GET_DECISION_DETAILS:
            success_text = self._handle_details_request_success(
                application, response_content[0]
            )
        else:
            success_text = self._handle_application_request_success(
                application, counter, response_content, request_type
            )

        self.stdout.write(self.style.SUCCESS(self._print_with_timestamp(success_text)))

    def _handle_failed_request(
        self,
        counter: int,
        application: Application,
        request_type: AhjoRequestType,
        error_text: str = None,
    ):
        additional_error_text = ""
        if error_text:
            additional_error_text = f"Error: {error_text}"

        self.stdout.write(
            self.style.ERROR(
                self._print_with_timestamp(
                    f"{counter}. Failed to submit {request_type} for application {application.id} \
                number: {application.application_number}, to Ahjo. {additional_error_text}"
                )
            )
        )

    def _get_request_handler(self, request_type: AhjoRequestType):
        request_handlers = {
            AhjoRequestType.OPEN_CASE: send_open_case_request_to_ahjo,
            AhjoRequestType.SEND_DECISION_PROPOSAL: send_decision_proposal_to_ahjo,
            AhjoRequestType.ADD_RECORDS: send_new_attachment_records_to_ahjo,
            AhjoRequestType.UPDATE_APPLICATION: update_application_summary_record_in_ahjo,
            AhjoRequestType.GET_DECISION_DETAILS: get_decision_details_from_ahjo,
            AhjoRequestType.DELETE_APPLICATION: delete_application_in_ahjo,
        }
        return request_handlers.get(request_type)

    def _print_with_timestamp(self, text: str) -> str:
        return f"{datetime.now()}: {text}"
