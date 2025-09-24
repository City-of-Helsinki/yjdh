import logging
from typing import List, Union

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.talpa_callback import TalpaCallbackSerializer
from applications.enums import ApplicationBatchStatus, ApplicationTalpaStatus
from applications.models import Application
from calculator.enums import InstalmentStatus
from common.authentications import RobotBasicAuthentication
from common.utils import get_request_ip_address
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

LOGGER = logging.getLogger(__name__)


class TalpaCallbackView(APIView):
    authentication_classes = [RobotBasicAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        if settings.TALPA_CALLBACK_ENABLED is False:
            LOGGER.warning("Talpa callback is disabled")
            return Response(
                {"message": "Talpa callback is disabled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TalpaCallbackSerializer(data=request.data)

        if serializer.is_valid():
            self.process_callback(serializer.validated_data, request)
            return Response({"message": "Callback received"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def process_callback(self, data, request):
        if data["status"] in ["Success", "Failure"]:
            ip_address = get_request_ip_address(request)
            self._handle_successful_applications(
                data["successful_applications"],
                ip_address,
            )
            self._handle_failed_applications(data["failed_applications"], ip_address)
        else:
            LOGGER.error(
                f"Received a talpa callback with unknown status: {data['status']}"
            )

    def _get_applications(self, application_numbers) -> Union[List[Application], None]:
        applications = Application.objects.filter(
            application_number__in=application_numbers
        )
        if not applications.exists() and application_numbers:
            LOGGER.error(
                f"No applications found with numbers: {application_numbers} for update"
                " after TALPA download"
            )
            return None
        return applications

    def _get_applications_and_instalments(
        self, application_numbers
    ) -> Union[List[Application], None]:
        applications = Application.objects.with_due_instalments(
            InstalmentStatus.ACCEPTED
        ).filter(application_number__in=application_numbers)

        if not applications.exists() and application_numbers:
            LOGGER.error(
                f"No applications found with numbers: {application_numbers} for update"
                " after TALPA download"
            )
            return []
        return applications

    @transaction.atomic
    def _handle_successful_applications(
        self, application_numbers: list, ip_address: str
    ):
        if settings.PAYMENT_INSTALMENTS_ENABLED:
            applications = self._get_applications_and_instalments(application_numbers)

            self.do_status_updates_based_on_instalments(
                applications=applications,
                instalment_status=InstalmentStatus.PAID,
                ip_address=ip_address,
                log_message="instalment was read by TALPA and marked as paid",
                is_success=True,
            )

        else:
            applications = self._get_applications(application_numbers)
            self.update_application_and_related_batch(
                applications,
                ip_address,
                ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA,
                ApplicationBatchStatus.SENT_TO_TALPA,
                "application was read succesfully by TALPA and archived",
                is_archived=True,
            )

    @transaction.atomic
    def _handle_failed_applications(self, application_numbers: list, ip_address: str):
        """Update applications and related batch which could not be processed with status REJECTED_BY_TALPA"""

        if settings.PAYMENT_INSTALMENTS_ENABLED:
            applications = self._get_applications_and_instalments(application_numbers)

            self.do_status_updates_based_on_instalments(
                applications=applications,
                instalment_status=InstalmentStatus.ERROR_IN_TALPA,
                ip_address=ip_address,
                log_message=(
                    "there was an error and the instalment was not read by TALPA"
                ),
                is_success=False,
            )
        else:
            applications = self._get_applications(application_numbers)

            self.update_application_and_related_batch(
                applications,
                ip_address,
                ApplicationTalpaStatus.REJECTED_BY_TALPA,
                ApplicationBatchStatus.REJECTED_BY_TALPA,
                "application was rejected by TALPA",
            )

    def update_application_and_related_batch(
        self,
        applications: List[Application],
        ip_address: str,
        application_talpa_status: ApplicationTalpaStatus,
        batch_status: ApplicationBatchStatus,
        log_message: str,
        is_archived: bool = False,
    ):
        """Update applications and related batch with given statuses and log the event.
        This will be deprecated after the instalments feature is enabled for all applications.
        """
        for application in applications:
            application.talpa_status = application_talpa_status
            application.archived = is_archived
            application.save()
            application.batch.status = batch_status
            application.batch.save()

        for application in applications:
            """Add audit log entries for applications which were processed by TALPA"""
            self.write_to_audit_log(application, ip_address, log_message)

    def do_status_updates_based_on_instalments(
        self,
        applications: List[Application],
        instalment_status: InstalmentStatus,
        ip_address: str,
        log_message: str,
        is_success: bool = False,
    ):
        """
        After receiving the callback from Talpa, query the currently due instalments of the
        successful applications and update the status of the instalments.
        If the instalments  1/1 or 2/2, e.g the final instalment,
        update the application status, batch status to SENT_TO_TALPA.
        Always set the application as archived after the first instalment is succesfully sent to talpa.
        """
        for application in applications:
            try:
                instalment = application.calculation.instalments.get(
                    status=InstalmentStatus.ACCEPTED,
                    due_date__lte=timezone.now().date(),
                )
                instalment.status = instalment_status
                if is_success:
                    instalment.amount_paid = instalment.amount_after_recoveries
                instalment.save()
            except ObjectDoesNotExist:
                LOGGER.error(
                    "Valid payable Instalment not found for application"
                    f" {application.application_number}"
                )
            except MultipleObjectsReturned:
                LOGGER.error(
                    "Multiple payable Instalments found for application"
                    f" {application.application_number}, there should be only one"
                )

            if is_success:
                # after 1st instalment is sent to talpa,
                # update the application status,
                # batch status and set the application as archived
                self.update_application_and_related_batch(
                    applications=[application],
                    ip_address=ip_address,
                    application_talpa_status=ApplicationTalpaStatus.PARTIALLY_SENT_TO_TALPA,
                    batch_status=ApplicationBatchStatus.PARTIALLY_SENT_TO_TALPA,
                    log_message=(
                        "instalment"
                        f" {instalment.instalment_number}/{application.number_of_instalments}"
                        " was read by TALPA and marked as paid"
                    ),
                    is_archived=True,
                )

                # check if this is the final instalment for the application
                if instalment.is_final:
                    self.update_after_all_instalments_are_sent(application)

            elif is_success is False and instalment.instalment_number == 1:
                # If Talpa reports a failure for the 1st instalment
                # update the application status, batch status to REJECTED_BY_TALPA

                self.update_application_and_related_batch(
                    applications=[application],
                    ip_address=ip_address,
                    application_talpa_status=ApplicationTalpaStatus.REJECTED_BY_TALPA,
                    batch_status=ApplicationBatchStatus.REJECTED_BY_TALPA,
                    log_message="application instalment was rejected by TALPA",
                )

            """Add audit log entries for applications which were processed by TALPA"""
            self.write_to_audit_log(application, ip_address, log_message)

    def update_after_all_instalments_are_sent(self, application: Application):
        application.talpa_status = ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA
        application.save()
        application.batch.status = ApplicationBatchStatus.SENT_TO_TALPA
        application.batch.save()

    def write_to_audit_log(self, application, ip_address, log_message):
        audit_logging.log(
            AnonymousUser,
            "",
            Operation.READ,
            application,
            ip_address=ip_address,
            additional_information=log_message,
        )
