from django.http import FileResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Attachment
from common.permissions import SafeListPermission
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation


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

        try:
            attachment = Attachment.objects.get(id=attachment_id)
            audit_logging.log(
                request.user,
                "",  # Optional user backend
                Operation.READ,
                attachment,
                additional_information="attachment was sent to AHJO!",
            )
            return self._prepare_file_response(attachment)
        except Attachment.DoesNotExist:
            return Response(
                {"message": f"Attachment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @staticmethod
    def _prepare_file_response(attachment: Attachment) -> FileResponse:
        file_handle = attachment.attachment_file.open()
        response = FileResponse(file_handle, content_type=f"{attachment.content_type}")
        response["Content-Length"] = attachment.attachment_file.size
        response[
            "Content-Disposition"
        ] = f"attachment; filename={attachment.attachment_file.name}"
        return response
