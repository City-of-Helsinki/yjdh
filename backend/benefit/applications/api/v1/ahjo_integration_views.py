from django.http import FileResponse
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Attachment
from common.permissions import SafeListPermission


class AhjoAttachmentView(APIView):
    authentication_classes = [
        TokenAuthentication,
    ]
    permission_classes = [IsAuthenticated, SafeListPermission]

    def get(self, request, *args, **kwargs):
        attachment_id = self.kwargs["uuid"]
        content = {
            "user": str(request.user),  # `django.contrib.auth.User` instance.
            "auth": str(request.auth),  # None
        }
        print(content)
        try:
            attachment = Attachment.objects.get(id=attachment_id)
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
