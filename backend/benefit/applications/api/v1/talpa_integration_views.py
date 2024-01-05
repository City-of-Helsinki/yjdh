import logging

from django.contrib.auth.models import AnonymousUser
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.talpa_callback import TalpaCallbackSerializer
from applications.enums import ApplicationStatus
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
            if request.data["status"] == "Success":
                ip_address = get_request_ip_address(request)

                self._handle_successful_applications(
                    request.data["successful_applications"], ip_address
                )
                self._handle_failed_applications(request.data["failed_applications"])

            else:
                LOGGER.error(
                    f"Received a talpa callback with status: {request.data['status']}"
                )

            return Response(
                {"message": "Callback received"},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _handle_successful_applications(
        self, application_numbers: list, ip_address: str
    ):
        """Add audit log entries for applications which were processed successfully by TALPA"""
        if application_numbers:
            successful_applications = Application.objects.filter(
                application_number__in=application_numbers
            )
            for application in successful_applications:
                audit_logging.log(
                    AnonymousUser,
                    "",
                    Operation.READ,
                    application,
                    ip_address=ip_address,
                    additional_information="application was read succesfully by TALPA",
                )

    def _handle_failed_applications(self, application_numbers: list):
        """Update applications which could not be processed with status REJECTED_BY_TALPA"""
        if application_numbers:
            applications = Application.objects.filter(
                application_number__in=application_numbers
            )
            applications.update(status=ApplicationStatus.REJECTED_BY_TALPA)
