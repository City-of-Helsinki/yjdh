import logging
from datetime import datetime, timezone

from django.db import transaction
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
    ApplicationBatchStatus,
)
from applications.models import AhjoStatus, Application, ApplicationBatch, Attachment
from common.permissions import SafeListPermission
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

LOGGER = logging.getLogger(__name__)


class AhjoCallbackError(Exception):
    pass


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
            additional_information=f"attachment {attachment.attachment_file} \
of type {attachment.attachment_type} was sent to AHJO!",
        )
        attachment.downloaded_by_ahjo = datetime.now(timezone.utc)
        attachment.save()
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
        request_type = self.kwargs["request_type"]

        try:
            application = Application.objects.get(pk=application_id)
        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
            return self.handle_success_callback(
                request, application, callback_data, request_type
            )

        if callback_data["message"] == AhjoCallBackStatus.SUCCESS:
            return self.handle_success_callback(
                request, application, callback_data, request_type
            )
        elif callback_data["message"] == AhjoCallBackStatus.FAILURE:
            return self.handle_failure_callback(application, callback_data)

    @transaction.atomic
    def handle_success_callback(
        self,
        request,
        application: Application,
        callback_data: dict,
        request_type: AhjoRequestType,
    ) -> Response:
        try:
            with transaction.atomic():
                if request_type == AhjoRequestType.OPEN_CASE:
                    self._handle_open_case_success(application, callback_data)
                    ahjo_status = AhjoStatusEnum.CASE_OPENED
                    info = f"Application ahjo_case_guid and ahjo_case_id were updated by Ahjo \
                        with request id: {callback_data['requestId']}"
                elif request_type == AhjoRequestType.DELETE_APPLICATION:
                    self._handle_delete_callback()
                    ahjo_status = AhjoStatusEnum.DELETE_REQUEST_RECEIVED
                    info = f"Application was marked for cancellation \
in Ahjo with request id: {callback_data['requestId']}"
                elif request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
                    self.handle_decision_proposal_success(application)
                    ahjo_status = AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED
                    info = "Decision proposal was sent to Ahjo"
                elif request_type == AhjoRequestType.UPDATE_APPLICATION:
                    self._handle_update_or_add_records_success(
                        application, callback_data
                    )
                    ahjo_status = AhjoStatusEnum.UPDATE_REQUEST_RECEIVED
                    info = f"Updated application records were sent to Ahjo \
with request id: {callback_data['requestId']}"
                elif request_type == AhjoRequestType.ADD_RECORDS:
                    self._handle_update_or_add_records_success(
                        application, callback_data
                    )
                    ahjo_status = AhjoStatusEnum.NEW_RECORDS_RECEIVED
                    info = f"A attachments were sent as records to Ahjo \
with request id: {callback_data['requestId']}"
                else:
                    raise AhjoCallbackError(
                        f"Unknown request type {request_type} in the Ahjo callback"
                    )
                AhjoStatus.objects.create(application=application, status=ahjo_status)

                audit_logging.log(
                    request.user,
                    "",
                    Operation.UPDATE,
                    application,
                    additional_information=info,
                )

                return Response(
                    {"message": "Callback received"}, status=status.HTTP_200_OK
                )
        except AhjoCallbackError as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def handle_failure_callback(
        self, application: Application, callback_data: dict
    ) -> Response:
        self._log_failure_details(application, callback_data)
        return Response(
            {"message": "Callback received but request was unsuccessful at AHJO"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def _handle_update_or_add_records_success(
        self, application: Application, callback_data: dict
    ):
        cb_records = callback_data.get("records", [])
        self._save_version_series_id(application, cb_records)

    @transaction.atomic
    def _handle_open_case_success(self, application: Application, callback_data: dict):
        """Update the application with the case id (diaarinumero) and case guid from the Ahjo callback data.
        If the application has attachments with a matching hash value, save the version series id for each attachment.
        Create a new single-application ApplicationBatch for the application and set the batch_id for the application.
        """
        if callback_data["caseGuid"]:
            application.ahjo_case_guid = callback_data["caseGuid"]
        if callback_data["caseId"]:
            application.ahjo_case_id = callback_data["caseId"]
        cb_records = callback_data.get("records", [])

        self._save_version_series_id(application, cb_records)

        handler = application.calculation.handler

        batch = ApplicationBatch.objects.create(
            handler=handler, auto_generated_by_ahjo=True
        )
        application.batch_id = batch.id

        application.save()
        return application

    def _handle_delete_callback(self):
        # do anything that needs to be done when Ahjo sends a delete callback
        pass

    def _save_version_series_id(
        self, application: Application, cb_records: list
    ) -> None:
        """Save the version series id for each attachment in the callback data \
            if the calculated sha256 hashes match."""
        attachment_map = {
            attachment.ahjo_hash_value: attachment
            for attachment in application.attachments.filter(
                ahjo_hash_value__isnull=False
            )
        }
        for cb_record in cb_records:
            attachment = attachment_map.get(cb_record.get("hashValue"))
            if attachment:
                attachment.ahjo_version_series_id = cb_record.get("versionSeriesId")
                attachment.save()

    def handle_decision_proposal_success(self, application: Application):
        # do anything that needs to be done when Ahjo has received a decision proposal request
        batch = application.batch
        batch.status = ApplicationBatchStatus.AWAITING_AHJO_DECISION
        batch.save()

    def _log_failure_details(self, application, callback_data):
        LOGGER.error(
            f"Received unsuccessful callback for application {application.id} \
                with request_id {callback_data['requestId']}"
        )
        for cb_record in callback_data.get("records", []):
            if cb_record.get("status") == AhjoCallBackStatus.FAILURE:
                LOGGER.error(
                    f"Ahjo reports failure with record, hash value {cb_record['hashValue']} \
                        and fileURI {cb_record['fileUri']}"
                )
