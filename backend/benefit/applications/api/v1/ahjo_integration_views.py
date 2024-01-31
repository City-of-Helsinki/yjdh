import logging
from typing import List

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.ahjo_callback import AhjoCallbackSerializer
from applications.enums import (
    AhjoCallBackStatus,
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
)
from applications.models import AhjoStatus, Application, Attachment
from common.permissions import SafeListPermission
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

LOGGER = logging.getLogger(__name__)


class AhjoAttachmentView(APIView):
    authentication_classes = [
        TokenAuthentication,
    ]
    permission_classes = [IsAuthenticated, SafeListPermission]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uuid",
                description="UUID of the attachment",
                required=True,
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
            )
        ],
        description="Returns the specified attachment file if it exists.",
    )
    def get(self, request, *args, **kwargs):
        attachment_id = self.kwargs["uuid"]

        attachment = get_object_or_404(Attachment, pk=attachment_id)
        audit_logging.log(
            request.user,
            "",  # Optional user backend
            Operation.READ,
            attachment,
            additional_information="attachment was sent to AHJO!",
        )
        return self._prepare_file_response(attachment)

    @staticmethod
    def _prepare_file_response(attachment: Attachment) -> FileResponse:
        file_handle = attachment.attachment_file.open()
        response = FileResponse(file_handle, content_type=attachment.content_type)
        response["Content-Length"] = attachment.attachment_file.size
        response[
            "Content-Disposition"
        ] = f"attachment; filename={attachment.attachment_file.name}"
        return response


class AhjoCallbackView(APIView):
    authentication_classes = [
        TokenAuthentication,
    ]
    permission_classes = [IsAuthenticated, SafeListPermission]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uuid",
                description="UUID of the application",
                required=True,
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
            ),
            OpenApiParameter(
                name="request_id",
                description="The type of request that Ahjo responded to",
                required=True,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
            ),
        ],
        description="Callback endpoint for Ahjo to send updates to the application.",
        request=AhjoCallbackSerializer,
        responses={
            (status.HTTP_200_OK, "text/json"): OpenApiTypes.OBJECT,
            (status.HTTP_404_NOT_FOUND, "text/json"): OpenApiTypes.OBJECT,
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = AhjoCallbackSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        callback_data = serializer.validated_data
        application_id = self.kwargs["uuid"]

        if callback_data["message"] == AhjoCallBackStatus.SUCCESS:
            ahjo_request_id = callback_data["requestId"]
            application = (
                Application.objects.filter(pk=application_id)
                .prefetch_related("attachments")
                .first()
            )
            request_type = self.kwargs["request_type"]

            if request_type == AhjoRequestType.OPEN_CASE:
                application = self._handle_open_case_callback(
                    application, callback_data
                )
                ahjo_status = AhjoStatusEnum.CASE_OPENED
                info = f"""Application ahjo_case_guid and ahjo_case_id
                were updated by Ahjo request id: {ahjo_request_id}"""
            elif request_type == AhjoRequestType.DELETE_APPLICATION:
                self._handle_delete_callback()
                ahjo_status = AhjoStatusEnum.DELETE_REQUEST_RECEIVED
                info = f"""Application was marked for cancellation in Ahjo with request id: {ahjo_request_id}"""

            AhjoStatus.objects.create(application=application, status=ahjo_status)

            audit_logging.log(
                request.user,
                "",
                Operation.UPDATE,
                application,
                additional_information=info,
            )

            return Response(
                {"message": "Callback received"},
                status=status.HTTP_200_OK,
            )

        elif callback_data["message"] == AhjoCallBackStatus.FAILURE:
            LOGGER.error(
                f"""Error: Received unsuccessful callback from Ahjo
                for application {application_id} with request_id {callback_data['requestId']}"""
            )
            return Response(
                {"message": "Callback received but unsuccessful"},
                status=status.HTTP_200_OK,
            )

    def _handle_open_case_callback(self, application: Application, callback_data: dict):
        application.ahjo_case_guid = callback_data["caseGuid"]
        application.ahjo_case_id = callback_data["caseId"]
        cb_records = callback_data["records"]

        self._save_version_series_id(application.attachments.all(), cb_records)

        application.save()
        return application

    def _save_version_series_id(self, attachments: List[Attachment], cb_records: list):
        """Save the version series id for each attachment in the callback data \
            if the calculated sha256 hashes match."""
        for attachment in attachments:
            for cb_record in cb_records:
                if attachment.ahjo_hash_value == cb_record["hashValue"]:
                    attachment.ahjo_version_series_id = cb_record["versionSeriesId"]
                    attachment.save()

    def _handle_delete_callback(self):
        # do anything that needs to be done when Ahjo sends a delete callback
        pass
