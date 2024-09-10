import logging
from datetime import datetime, timezone
from typing import Dict

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

from applications.api.v1.serializers.ahjo_callback import (
    AhjoCallbackSerializer,
    AhjoDecisionCallbackSerializer,
)
from applications.enums import (
    AhjoCallBackStatus,
    AhjoDecisionUpdateType,
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationBatchStatus,
    ApplicationStatus,
)
from applications.models import AhjoStatus, Application, ApplicationBatch, Attachment
from common.permissions import BFIsHandler, SafeListPermission
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

LOGGER = logging.getLogger(__name__)


class AhjoCallbackError(Exception):
    pass


class AhjoApplicationView(APIView):
    permission_classes = [BFIsHandler]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uuid",
                description="UUID of the application",
                required=True,
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
            )
        ],
        description="Sends a delete / cancel case request to Ahjo for given application.",
    )
    def delete(self, request, *args, **kwargs):
        application_id = self.kwargs["uuid"]

        application = get_object_or_404(Application, pk=application_id)

        if (
            application.ahjo_status.latest().status
            == AhjoStatusEnum.DECISION_PROPOSAL_SENT
        ):
            return Response(
                {
                    "message": "Cannot delete because a decision proposal has been sent to Ahjo"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AhjoStatus.objects.create(
            application=application, status=AhjoStatusEnum.SCHEDULED_FOR_DELETION
        )

        return Response(
            {"message": "Application scheduled for cancellation in Ahjo"},
            status=status.HTTP_200_OK,
        )


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
        # TODO how to check the success of the callback if it has no message property?
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

    def cb_info_message(
        self,
        application: Application,
        callback_data: Dict,
        request_type: AhjoRequestType,
    ) -> str:
        """Return a string with information about the received callback."""
        return f"Application {application.application_number}: \
        received a callback for request_type {request_type} \
        with request id: {callback_data['requestId']}, full callback data: {callback_data}"

    @transaction.atomic
    def handle_success_callback(
        self,
        request,
        application: Application,
        callback_data: Dict,
        request_type: AhjoRequestType,
    ) -> Response:
        try:
            with transaction.atomic():
                # Clear any previous error messages before creating a new success status
                latest_status = application.ahjo_status.latest()
                if latest_status.error_from_ahjo is not None:
                    latest_status.error_from_ahjo = None
                    latest_status.save()
                info = self.cb_info_message(application, callback_data, request_type)
                if request_type == AhjoRequestType.OPEN_CASE:
                    self._handle_open_case_success(application, callback_data)
                    ahjo_status = AhjoStatusEnum.CASE_OPENED
                elif request_type == AhjoRequestType.DELETE_APPLICATION:
                    self._handle_delete_callback_success(application)
                    ahjo_status = AhjoStatusEnum.DELETE_REQUEST_RECEIVED

                elif request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
                    self.handle_decision_proposal_success(application)
                    ahjo_status = AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED
                    info = self.cb_info_message(
                        application, callback_data, request_type
                    )
                elif request_type == AhjoRequestType.UPDATE_APPLICATION:
                    self._handle_update_or_add_records_success(
                        application, callback_data
                    )
                    ahjo_status = AhjoStatusEnum.UPDATE_REQUEST_RECEIVED
                elif request_type == AhjoRequestType.ADD_RECORDS:
                    self._handle_update_or_add_records_success(
                        application, callback_data
                    )
                    ahjo_status = AhjoStatusEnum.NEW_RECORDS_RECEIVED
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
        latest_status = application.ahjo_status.latest()
        latest_status.error_from_ahjo = callback_data.get("failureDetails", None)
        latest_status.save()
        return Response(
            {"message": "Callback received but request was unsuccessful at AHJO"},
            status=status.HTTP_200_OK,
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

    def _handle_delete_callback_success(self, application):
        # do anything that needs to be done when Ahjo sends a delete callback
        application.status = ApplicationStatus.CANCELLED
        application.archived = True
        application.save()

        if application.batch and application.batch.auto_generated_by_ahjo:
            batch = application.batch
            batch.status = ApplicationBatchStatus.CANCELLED
            batch.save()

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
                with request_id {callback_data['requestId']}, callback data: {callback_data}"
        )
        for cb_record in callback_data.get("records", []):
            if cb_record.get("status") == AhjoCallBackStatus.FAILURE:
                LOGGER.error(
                    f"Ahjo reports failure with record, hash value {cb_record['hashValue']} \
                        and fileURI {cb_record['fileUri']}"
                )


class AhjoDecisionCallbackView(APIView):
    authentication_classes = [
        TokenAuthentication,
    ]
    permission_classes = [IsAuthenticated, SafeListPermission]

    def post(self, request, *args, **kwargs):
        serializer = AhjoDecisionCallbackSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        callback_data = serializer.validated_data
        ahjo_case_id = callback_data["caseId"]
        update_type = callback_data["updatetype"]

        application = get_object_or_404(Application, ahjo_case_id=ahjo_case_id)

        if update_type == AhjoDecisionUpdateType.ADDED:
            AhjoStatus.objects.create(
                application=application, status=AhjoStatusEnum.SIGNED_IN_AHJO
            )
        elif update_type == AhjoDecisionUpdateType.REMOVED:
            AhjoStatus.objects.create(
                application=application, status=AhjoStatusEnum.REMOVED_IN_AHJO
            )
        # TODO what to do if updatetype is "updated"
        audit_logging.log(
            request.user,
            "",
            Operation.UPDATE,
            application,
            additional_information=f"Decision proposal update type: {update_type} was received \
            from Ahjo for application {application.application_number}",
        )

        return Response({"message": "Callback received"}, status=status.HTTP_200_OK)
