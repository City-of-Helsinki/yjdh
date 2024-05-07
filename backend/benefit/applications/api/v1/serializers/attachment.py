import logging

import filetype
from django.conf import settings
from django.forms import ImageField, ValidationError as DjangoFormsValidationError
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.fields import FileField
from rest_framework.reverse import reverse

from applications.enums import ApplicationStatus
from applications.models import Attachment
from applications.services.clamav import (
    clamav_client,
    ClamAvServiceUnavailableException,
    FileInfectedException,
    FileScanException,
)
from helsinkibenefit.settings import MAX_UPLOAD_SIZE
from users.utils import get_request_user_from_context

log = logging.getLogger(__name__)


class AttachmentField(FileField):
    def to_representation(self, value):
        if not value:
            return None

        url_pattern_name = "v1:applicant-application-download-attachment"
        request = self.context.get("request")
        user = get_request_user_from_context(self)
        if settings.NEXT_PUBLIC_MOCK_FLAG or (
            user and user.is_authenticated and user.is_handler()
        ):
            url_pattern_name = "v1:handler-application-download-attachment"

        path = reverse(
            url_pattern_name,
            kwargs={
                "pk": value.instance.application.pk,
                "attachment_pk": value.instance.pk,
            },
        )
        if request is not None:
            return request.build_absolute_uri(path)
        return path


class AttachmentSerializer(serializers.ModelSerializer):
    # this limit is a security feature, not a business rule

    MAX_ATTACHMENTS_PER_APPLICATION = 20

    attachment_file = AttachmentField()

    class Meta:
        model = Attachment
        fields = [
            "id",
            "application",
            "attachment_type",
            "attachment_file",
            "attachment_file_name",
            "content_type",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    attachment_file_name = serializers.SerializerMethodField(
        "get_attachment_file_name",
        help_text="The name of the uploaded file",
    )

    def get_attachment_file_name(self, obj):
        return obj.attachment_file.name

    ATTACHMENT_MODIFICATION_ALLOWED_STATUSES = (
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        ApplicationStatus.DRAFT,
    )

    def validate(self, data):
        """
        Rudimentary validation of file content to guard against accidentally uploading
        invalid files.
        """

        if data["attachment_file"].size > MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                format_lazy(
                    _("Upload file size cannot be greater than {size} bytes"),
                    size=MAX_UPLOAD_SIZE,
                )
            )
        if settings.ENABLE_CLAMAV:
            self._scan_with_clamav(data["attachment_file"])

        if (
            len(data["application"].attachments.all())
            >= self.MAX_ATTACHMENTS_PER_APPLICATION
        ):
            raise serializers.ValidationError(_("Too many attachments"))
        if data["content_type"] == "application/pdf":
            if not self._is_valid_pdf(data["attachment_file"]):
                raise serializers.ValidationError(_("Not a valid pdf file"))
        elif not self._is_valid_image(data["attachment_file"]):
            # only pdf and image files are listed in ATTACHMENT_CONTENT_TYPE_CHOICES, so if we get here,
            # the content type is an image file
            raise serializers.ValidationError(_("Not a valid image file"))
        return data

    def _is_valid_image(self, uploaded_file):
        try:
            im = ImageField()
            # check if the file is a valid image
            im.to_python(uploaded_file)
        except DjangoFormsValidationError:
            return False
        else:
            return True

    def _is_valid_pdf(self, uploaded_file):
        file_pos = uploaded_file.tell()
        mime_type = None
        if file_type_guess := filetype.guess(uploaded_file):
            mime_type = file_type_guess.mime
        uploaded_file.seek(file_pos)  # restore position
        return mime_type == "application/pdf"

    def _scan_with_clamav(self, file):
        try:
            clamav_client.scan(file.name, file.file)
        except FileScanException as fse:
            log.error(f"File '{fse.file_name}' scanning failed")
            raise ClamAvServiceUnavailableException()
        except FileInfectedException as fie:
            log.error(f"File '{fie.file_name}' infected, viruses: {fie.viruses}")
            translation_text = _("File is infected with")
            raise serializers.ValidationError(
                {
                    "non_field_errors": f'{translation_text} {", ".join(fie.viruses)}',
                    "key": "malware",
                },
            )
