import os

from django.http import FileResponse
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.response import Response


class AttachmentDownloadMixin:
    """
    Shared mixin for securely serving attachment files as downloads (FileResponse).
    """

    def get_attachment_download_response(self, attachment):
        """Return a FileResponse for the given attachment or a 404 response."""
        if attachment and attachment.attachment_file:
            try:
                file_handle = attachment.attachment_file.open()
                return FileResponse(
                    file_handle,
                    as_attachment=True,
                    filename=os.path.basename(attachment.attachment_file.name),
                )
            except FileNotFoundError:
                pass

        return Response(
            {"detail": _("File not found.")},
            status=status.HTTP_404_NOT_FOUND,
        )
