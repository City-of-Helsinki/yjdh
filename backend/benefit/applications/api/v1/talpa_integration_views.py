import logging
from typing import List, Union

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.talpa_callback import TalpaCallbackSerializer
from applications.enums import ApplicationBatchStatus, ApplicationTalpaStatus
from applications.models import Application, ApplicationBatch
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
                f"No applications found with numbers: {application_numbers} for update after TALPA download"
            )
            return None
        return applications

    def _handle_successful_applications(
        self, application_numbers: list, ip_address: str
    ):
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
        applications = self._get_applications(application_numbers)
        self.update_application_and_related_batch(
            applications,
            ip_address,
            ApplicationTalpaStatus.REJECTED_BY_TALPA,
            ApplicationBatchStatus.REJECTED_BY_TALPA,
            "application was rejected by TALPA",
        )

    @staticmethod
    def update_application_and_related_batch(
        applications: List[Application],
        ip_address: str,
        application_talpa_status: ApplicationTalpaStatus,
        batch_status: ApplicationBatchStatus,
        log_message: str,
        is_archived: bool = False,
    ):
        """Update applications and related batch with given statuses and log the event"""
        applications.update(
            talpa_status=application_talpa_status,
            archived=is_archived,
        )

        batch_ids = applications.values_list("batch_id", flat=True).distinct()
        ApplicationBatch.objects.filter(id__in=batch_ids).update(status=batch_status)

        for application in applications:
            """Add audit log entries for applications which were processed by TALPA"""
            audit_logging.log(
                AnonymousUser,
                "",
                Operation.READ,
                application,
                ip_address=ip_address,
                additional_information=log_message,
            )
