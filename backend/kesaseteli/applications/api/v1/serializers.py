import filetype
from django.conf import settings
from django.db import transaction
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from applications.enums import ApplicationStatus
from applications.models import Application, Attachment, SummerVoucher
from applications.services import update_summer_vouchers_using_api_data
from companies.api.v1.serializers import CompanySerializer
from companies.services import get_or_create_company_from_eauth_profile


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            "id",
            "summer_voucher",
            "attachment_file",
            "content_type",
            "attachment_type",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    MAX_ATTACHMENTS_PER_APPLICATION = 10

    ATTACHMENT_MODIFICATION_ALLOWED_STATUSES = (
        ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ApplicationStatus.DRAFT,
    )

    def validate(self, data):
        """
        Perform rudimentary validation of file content to guard against accidentally uploading
        invalid files.
        """

        if (
            data["summer_voucher"].application.status
            not in self.ATTACHMENT_MODIFICATION_ALLOWED_STATUSES
        ):
            raise serializers.ValidationError(
                _("Can not add attachment to an application in this state")
            )

        if data["attachment_file"].size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                format_lazy(
                    _("Upload file size cannot be greater than {size} bytes"),
                    size=settings.MAX_UPLOAD_SIZE,
                )
            )

        if (
            len(data["summer_voucher"].attachments.all())
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
            # check if the file is a valid image
            im = Image.open(uploaded_file)
            im.verify()
        except UnidentifiedImageError:
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


class SummerVoucherSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(
        read_only=True,
        many=True,
        help_text="Attachments of the application (read-only)",
    )

    class Meta:
        model = SummerVoucher
        fields = [
            "id",
            "summer_voucher_id",
            "contact_name",
            "contact_email",
            "work_postcode",
            "employee_name",
            "employee_school",
            "employee_ssn",
            "employee_phone_number",
            "is_unnumbered_summer_voucher",
            "unnumbered_summer_voucher_reason",
            "attachments",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    summer_vouchers = SummerVoucherSerializer(
        many=True, required=False, allow_null=True
    )
    status = serializers.CharField(required=False)

    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "street_address",
            "contact_person_name",
            "contact_person_email",
            "contact_person_phone_number",
            "is_separate_invoicer",
            "invoicer_name",
            "invoicer_email",
            "invoicer_phone_number",
            "company",
            "summer_vouchers",
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        summer_vouchers_data = validated_data.pop("summer_vouchers", []) or []
        if request and request.method == "PUT":
            update_summer_vouchers_using_api_data(summer_vouchers_data, instance)

        return super().update(instance, validated_data)

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        company = get_or_create_company_from_eauth_profile(
            user.oidc_profile.eauthorization_profile
        )
        validated_data["company"] = company

        return super().create(validated_data)
