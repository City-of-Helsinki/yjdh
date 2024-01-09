import logging
from typing import List, Union

from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.talpa_callback import TalpaCallbackSerializer
from applications.enums import ApplicationBatchStatus, ApplicationStatus
from applications.models import Application
from common.authentications import RobotBasicAuthentication
from common.utils import get_request_ip_address
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

LOGGER = logging.getLogger(__name__)


class TalpaCallbackView(APIView):
    authentication_classes = [RobotBasicAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TalpaCallbackSerializer(data=request.data)

        if serializer.is_valid():
            self.process_callback(serializer.validated_data, request)
            return Response({"message": "Callback received"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def process_callback(self, data, request):
        if data["status"] == "Success":
            self._handle_successful_applications(
                data["successful_applications"], get_request_ip_address(request)
            )
            self._handle_failed_applications(data["failed_applications"])
        else:
            LOGGER.error(f"Received a talpa callback with status: {data['status']}")

    def _get_applications(self, application_numbers) -> Union[List[Application], None]:
        applications = Application.objects.filter(
            application_number__in=application_numbers
        )
        if not applications.exists() and application_numbers:
            LOGGER.error(f"No applications found with numbers: {application_numbers}")
            return None
        return applications

    def _handle_successful_applications(
        self, application_numbers: list, ip_address: str
    ):
        """Add audit log entries for applications which were processed successfully by TALPA"""
        successful_applications = self._get_applications(application_numbers)
        if successful_applications:
            for application in successful_applications:
                audit_logging.log(
                    AnonymousUser,
                    "",
                    Operation.READ,
                    application,
                    ip_address=ip_address,
                    additional_information="application was read succesfully by TALPA",
                )

    @transaction.atomic
    def _handle_failed_applications(self, application_numbers: list):
        """Update applications and related batch which could not be processed with status REJECTED_BY_TALPA"""
        applications = self._get_applications(application_numbers)
        if applications:
            try:
                batch = applications.first().batch
                if batch:
                    batch.status = ApplicationBatchStatus.REJECTED_BY_TALPA
                    batch.save()
                    applications.update(status=ApplicationStatus.REJECTED_BY_TALPA)
                else:
                    LOGGER.error(
                        f"No batch associated with applications: {applications.values_list('id', flat=True)}"
                    )
            except Exception as e:
                LOGGER.error(f"Error updating batch and applications: {str(e)}")
