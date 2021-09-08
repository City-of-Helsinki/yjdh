import filetype
from django.conf import settings
from django.db import transaction
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from applications.enums import ApplicationStatus, AttachmentType
from applications.models import Application, Attachment, SummerVoucher
from companies.api.v1.serializers import CompanySerializer
from companies.services import get_or_create_company_from_eauth_profile


class ApplicationStatusValidator:
    requires_context = True

    APPLICATION_STATUS_TRANSITIONS = {
        ApplicationStatus.DRAFT: (
            ApplicationStatus.DELETED_BY_CUSTOMER,
            ApplicationStatus.SUBMITTED,
        ),
        ApplicationStatus.SUBMITTED: (
            ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.ACCEPTED,
        ),
        ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED: (
            ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
        ),
        ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED: (
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
        ),
        ApplicationStatus.ACCEPTED: (),
        ApplicationStatus.REJECTED: (),
        ApplicationStatus.DELETED_BY_CUSTOMER: (),
    }

    def __call__(self, value, serializer_field):
        if application := serializer_field.parent.instance:
            # In case it's an update operation, validate with the current status in database
            if (
                value != application.status
                and value not in self.APPLICATION_STATUS_TRANSITIONS[application.status]
            ):
                raise serializers.ValidationError(
                    format_lazy(
                        _(
                            "Application state transition not allowed: {status} to {value}"
                        ),
                        status=application.status,
                        value=value,
                    )
                )
        else:
            if value != ApplicationStatus.DRAFT:
                raise serializers.ValidationError(
                    _("Initial status of application must be draft")
                )

        return value


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
            "summer_voucher_serial_number",
            "summer_voucher_exception_reason",
            "employee_name",
            "employee_school",
            "employee_ssn",
            "employee_phone_number",
            "employee_home_city",
            "employee_postcode",
            "employment_postcode",
            "employment_start_date",
            "employment_end_date",
            "employment_work_hours",
            "employment_salary_paid",
            "employment_description",
            "hired_without_voucher_assessment",
            "attachments",
            "ordering",
        ]
        read_only_fields = [
            "ordering",
        ]

    def validate(self, data):
        data = super().validate(data)
        self._validate_non_draft_required_fields(data)
        return data

    REQUIRED_FIELDS_FOR_SUBMITTED_SUMMER_VOUCHERS = [
        "summer_voucher_serial_number",
        "employee_name",
        "employee_school",
        "employee_ssn",
        "employee_phone_number",
        "employee_home_city",
        "employee_postcode",
        "employment_postcode",
        "employment_start_date",
        "employment_end_date",
        "employment_work_hours",
        "employment_salary_paid",
        "employment_description",
        "hired_without_voucher_assessment",
    ]

    def _validate_non_draft_required_fields(self, data):
        status = (
            self.parent.parent.initial_data.get("status") if self.parent.parent else ""
        )

        if not status or status == ApplicationStatus.DRAFT:
            # newly created applications are always DRAFT
            return

        required_fields = self.REQUIRED_FIELDS_FOR_SUBMITTED_SUMMER_VOUCHERS[:]

        for field_name in required_fields:
            if data.get(field_name) in [None, "", []]:
                raise serializers.ValidationError(
                    {
                        field_name: _(
                            "This field is required before submitting the application"
                        )
                    }
                )


class ApplicationSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    summer_vouchers = SummerVoucherSerializer(
        many=True, required=False, allow_null=True
    )
    status = serializers.ChoiceField(
        choices=ApplicationStatus.choices,
        validators=[ApplicationStatusValidator()],
        help_text=_("Status of the application, visible to the applicant"),
        required=False,
    )

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
            "user",
            "summer_vouchers",
            "language",
        ]
        read_only_fields = ["user"]

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        summer_vouchers_data = validated_data.pop("summer_vouchers", []) or []
        if request and request.method == "PUT":
            self._update_summer_vouchers(summer_vouchers_data, instance)

        return super().update(instance, validated_data)

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        company = get_or_create_company_from_eauth_profile(
            user.oidc_profile.eauthorization_profile, request
        )
        validated_data["company"] = company
        validated_data["user"] = user

        return super().create(validated_data)

    def _update_summer_vouchers(
        self, summer_vouchers_data: list, application: Application
    ) -> None:
        serializer = SummerVoucherSerializer(data=summer_vouchers_data, many=True)

        if not serializer.is_valid():
            raise serializers.ValidationError(
                format_lazy(
                    _("Reading summer voucher data failed: {errors}"),
                    errors=serializer.errors,
                )
            )

        # Clear the previous SummerVoucher objects from the database.
        # The request must always contain all the SummerVoucher objects for this application.
        application.summer_vouchers.all().delete()
        for idx, summer_voucher_item in enumerate(serializer.validated_data):
            summer_voucher_item["application_id"] = application.pk
            summer_voucher_item[
                "ordering"
            ] = idx  # use the ordering defined in the JSON sent by the client
        serializer.save()

    def validate(self, data):
        data = super().validate(data)

        request = self.context.get("request")
        if request.method != "PATCH":
            self._validate_non_draft_required_fields(data)

        return data

    # Fields that may be null/blank while the application is draft, but
    # must be filled before submitting the application for processing
    REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS = [
        "street_address",
        "contact_person_name",
        "contact_person_email",
        "contact_person_phone_number",
        "is_separate_invoicer",
        "summer_vouchers",
    ]

    def _validate_non_draft_required_fields(self, data):
        if not data.get("status") or data["status"] == ApplicationStatus.DRAFT:
            # newly created applications are always DRAFT
            return

        required_fields = self.REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS[:]
        if data.get("is_separate_invoicer"):
            required_fields.extend(
                ["invoicer_name", "invoicer_email", "invoicer_phone_number"]
            )

        for field_name in required_fields:
            if data.get(field_name) in [None, "", []]:
                raise serializers.ValidationError(
                    {
                        field_name: _(
                            "This field is required before submitting the application"
                        )
                    }
                )

        self._validate_attachments()

    def _validate_attachments(self):
        """
        The requirements for attachments are the minimum requirements.
        * Sometimes, a multi-page document might be uploaded as a set of jpg files, and the backend
          would not know that it's meant to be a single document.
        * This validator makes sure that there is at least one of each attachment type.
        """
        for summer_voucher in self.instance.summer_vouchers.all():
            if not summer_voucher.attachments.exists():
                raise serializers.ValidationError(
                    _("Attachments missing from summer voucher")
                )

            required_attachment_types = AttachmentType.values
            for attachment in summer_voucher.attachments.all():
                if attachment.attachment_type in required_attachment_types:
                    required_attachment_types.remove(attachment.attachment_type)

            if required_attachment_types:
                raise serializers.ValidationError(
                    format_lazy(
                        _("Attachments missing with types: {attachment_types}"),
                        attachment_types=", ".join(required_attachment_types),
                    )
                )
