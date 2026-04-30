import json
import logging
from datetime import date, datetime
from typing import Optional, Union

import filetype
from django.conf import settings
from django.db import transaction
from django.utils import timezone, translation
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from applications.api.v1.validators import validate_additional_info_user_reasons
from applications.enums import (
    AttachmentType,
    EmployerApplicationStatus,
    get_supported_languages,
    YouthApplicationStatus,
)
from applications.models import (
    Attachment,
    EmployerApplication,
    EmployerSummerVoucher,
    School,
    SummerVoucherConfiguration,
    YouthApplication,
    YouthSummerVoucher,
)
from applications.target_groups import (
    get_target_group_choices,
    get_target_group_data,
)
from common.fuzzy_matching import is_last_name_fuzzy_match_in_full_name
from common.permissions import HandlerPermission
from companies.api.v1.serializers import CompanySerializer
from companies.services import get_or_create_company_using_organization_roles

LOGGER = logging.getLogger(__name__)


class EmployerApplicationStatusValidator:
    requires_context = True

    APPLICATION_STATUS_TRANSITIONS = {
        EmployerApplicationStatus.DRAFT: (
            EmployerApplicationStatus.DELETED_BY_CUSTOMER,
            EmployerApplicationStatus.SUBMITTED,
        ),
        EmployerApplicationStatus.SUBMITTED: (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.ACCEPTED,
        ),
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED: (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.ACCEPTED,
            EmployerApplicationStatus.REJECTED,
        ),
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED: (
            EmployerApplicationStatus.ACCEPTED,
            EmployerApplicationStatus.REJECTED,
        ),
        EmployerApplicationStatus.ACCEPTED: (),
        EmployerApplicationStatus.REJECTED: (),
        EmployerApplicationStatus.DELETED_BY_CUSTOMER: (),
    }

    def __call__(self, value, serializer_field):
        if application := serializer_field.parent.instance:
            # In case it's an update operation, validate with the current status in
            # database
            if (
                value != application.status
                and value not in self.APPLICATION_STATUS_TRANSITIONS[application.status]
            ):
                raise serializers.ValidationError(
                    format_lazy(
                        _(
                            "EmployerApplication state transition not allowed: {status}"
                            " to {value}"
                        ),
                        status=application.status,
                        value=value,
                    )
                )
        else:
            if value != EmployerApplicationStatus.DRAFT:
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
            "attachment_type",
            "attachment_file_name",
            "content_type",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    MAX_ATTACHMENTS_PER_TYPE = 5

    ATTACHMENT_MODIFICATION_ALLOWED_STATUSES = (
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.DRAFT,
    )

    attachment_file_name = serializers.SerializerMethodField(
        "get_attachment_file_name",
        help_text="Name of the uploaded file",
    )

    def get_attachment_file_name(self, obj):
        return getattr(obj.attachment_file, "name", "")

    def validate(self, data):
        """
        Perform rudimentary validation of file content to guard against
        accidentally uploading invalid files.
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
            data["summer_voucher"]
            .attachments.filter(attachment_type=data["attachment_type"])
            .count()
            >= self.MAX_ATTACHMENTS_PER_TYPE
        ):
            raise serializers.ValidationError(_("At most five attachments per type"))

        if data["content_type"] == "application/pdf":
            if not self._is_valid_pdf(data["attachment_file"]):
                raise serializers.ValidationError(_("Not a valid pdf file"))
        elif not self._is_valid_image(data["attachment_file"]):
            # only pdf and image files are listed in ATTACHMENT_CONTENT_TYPE_CHOICES, so
            # if we get here,
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


class TargetGroupSerializer(serializers.Serializer):
    """
    Serializer for TargetGroup. Decoupled from any model.
    """

    id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()


class EmployerSummerVoucherListSerializer(serializers.ListSerializer):
    """
    https://www.django-rest-framework.org/api-guide/serializers/#customizing-multiple-update
    """

    def update(self, instance, validated_data):
        # Maps for id->instance.
        voucher_mapping = {voucher.id: voucher for voucher in instance}
        # A list of ids of the validated data items. IDs do not exist for new instances.
        existing_ids = [item["id"] for item in validated_data if item.get("id")]

        # Perform creations and updates.
        ret = []
        for data in validated_data:
            voucher = voucher_mapping.get(data.get("id"), None)
            if voucher is None:
                ret.append(self.child.create(data))
            else:
                ret.append(self.child.update(voucher, data))

        # Perform deletions.
        for voucher_id, voucher in voucher_mapping.items():
            if voucher_id not in existing_ids:
                voucher.delete()

        return ret


class EmployerSummerVoucherSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    attachments = AttachmentSerializer(
        read_only=True,
        many=True,
        help_text="Attachments of the application (read-only)",
    )
    # Backward compatibility field for frontend using
    # EmployerSummerVoucher summer_voucher_serial_number property and its setter:
    summer_voucher_serial_number = serializers.CharField(
        max_length=256,
        allow_blank=True,
        required=False,
    )
    employee_name = serializers.CharField(
        max_length=256,
        allow_blank=True,
        required=False,
    )

    class Meta:
        model = EmployerSummerVoucher
        fields = [
            "id",
            "summer_voucher_serial_number",
            "employee_name",
            "employee_school",
            "employee_birthdate",
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
            "employee_school",
            "employee_birthdate",
            "employee_home_city",
            "employee_postcode",
        ]
        list_serializer_class = EmployerSummerVoucherListSerializer

    def _validate_non_draft_required_fields(self, data):
        parent = self.parent
        status = (
            parent.parent.initial_data.get("status") if parent and parent.parent else ""
        )

        if not status or status == EmployerApplicationStatus.DRAFT:
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

    def validate(self, data):
        data = super().validate(data)
        self._validate_non_draft_required_fields(data)
        self._validate_summer_voucher_serial_number(data)

        return data

    def _validate_summer_voucher_serial_number(self, data):
        """
        Validate the summer voucher serial number and its usage.

        Orchestrates fetching the voucher, validating the employee name match,
        checking usage across applications, and verifying the youth application
        status.

        :raises ValidationError: if any validation step fails.
        """
        serial_number = data.get("summer_voucher_serial_number")
        if not serial_number:
            return

        voucher = self._get_youth_summer_voucher(serial_number)
        if not voucher:
            return

        user_provided_name = data.get("employee_name")
        self._validate_voucher_employee_name(voucher, user_provided_name)
        self._validate_voucher_status(voucher.youth_application)
        self._validate_voucher_usage(
            voucher, application=self._get_application_context()
        )

    def _get_youth_summer_voucher(
        self, serial_number: str
    ) -> Optional[YouthSummerVoucher]:
        """
        Safely fetch the YouthSummerVoucher by serial number.
        """
        try:
            return YouthSummerVoucher.objects.get(
                summer_voucher_serial_number=int(serial_number)
            )
        except (ValueError, TypeError, YouthSummerVoucher.DoesNotExist):
            return None

    def _validate_voucher_employee_name(
        self, voucher: YouthSummerVoucher, user_provided_name: str
    ) -> None:
        """
        Validate that the provided employee name matches the voucher owner.

        :raises ValidationError: if employee_name is missing or does not match
            voucher owner.
        """
        if not user_provided_name:
            raise serializers.ValidationError(
                {
                    "employee_name": _(
                        "Employee name is required when providing a serial number"
                    )
                }
            )

        youth_application = voucher.youth_application
        if not is_last_name_fuzzy_match_in_full_name(
            last_name=youth_application.last_name, full_name=user_provided_name
        ):
            raise serializers.ValidationError(
                {
                    "employee_name": _(
                        "Provided employee name does not match the voucher owner"
                    )
                }
            )

    def _validate_voucher_status(self, youth_application: YouthApplication) -> None:
        """
        Ensure the youth application is in the ACCEPTED status.

        :raises ValidationError: if the youth application is not in ACCEPTED status.
        """
        if youth_application.status != YouthApplicationStatus.ACCEPTED:
            raise serializers.ValidationError(
                {
                    "summer_voucher_serial_number": _(
                        f"This voucher is not yet valid for attachment "
                        f"(Youth application status: {youth_application.status}). "
                        "Status must be 'accepted'."
                    )
                }
            )

    def _get_application_context(self) -> Optional[EmployerApplication]:
        """
        Attempt to find the EmployerApplication instance from the serializer
        context or hierarchy.
        """
        application = None
        if self.instance:
            application = getattr(self.instance, "application", None)

        if not application:
            application = self.context.get("application")

        if not application:
            # Try to get it from the root serializer (EmployerApplicationSerializer)
            root = getattr(self, "root", None)
            if root and hasattr(root, "instance") and root.instance:
                application = root.instance

        return application

    def _validate_voucher_usage(
        self, voucher: YouthSummerVoucher, application: Optional[EmployerApplication]
    ) -> None:
        """
        Ensure the voucher is not already used in another application.

        :raises ValidationError: if the voucher is already linked to another
            application.
        """
        # Check if this voucher is already linked to ANY other application in the DB.
        # We exclude the current application to allow idempotent updates.
        used_in_other = EmployerSummerVoucher.objects.filter(
            youth_summer_voucher=voucher,
        )

        if application and hasattr(application, "id"):
            # Match by ID to be safe across different object instances
            used_in_other = used_in_other.exclude(application_id=application.id)

        if used_in_other.exists():
            conflicting_app_id = used_in_other.first().application_id
            request = self.context.get("request")
            user = getattr(request, "user", "Unknown") if request else "Unknown"
            LOGGER.warning(
                "[SECURITY ISSUE] Suspicious voucher usage detected. Voucher serial "
                f"{voucher.summer_voucher_serial_number} "
                f"is already linked to application {conflicting_app_id}. "
                f"Attempted by user {user} (ID: {getattr(user, 'id', 'N/A')}) "
                f"for application {getattr(application, 'id', 'new draft')}."
            )
            raise serializers.ValidationError(
                {
                    "summer_voucher_serial_number": _(
                        "This voucher has already been used in another application"
                    )
                }
            )

    REQUIRED_FIELDS_FOR_SUBMITTED_SUMMER_VOUCHERS = [
        "summer_voucher_serial_number",
        "employee_phone_number",
        "employment_postcode",
        "employment_start_date",
        "employment_end_date",
        "employment_work_hours",
        "employment_salary_paid",
        "hired_without_voucher_assessment",
    ]


class EmployerApplicationSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    summer_vouchers = EmployerSummerVoucherSerializer(
        many=True, required=False, allow_null=True
    )
    status = serializers.ChoiceField(
        choices=EmployerApplicationStatus.choices,
        validators=[EmployerApplicationStatusValidator()],
        help_text=_("Status of the application, visible to the applicant"),
        required=False,
    )
    is_mine = serializers.SerializerMethodField("get_is_mine")

    class Meta:
        model = EmployerApplication
        fields = [
            "id",
            "created_at",
            "modified_at",
            "status",
            "street_address",
            "bank_account_number",
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
            "submitted_at",
            "is_mine",
        ]
        read_only_fields = ["created_at", "modified_at", "submitted_at", "user"]

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        summer_vouchers_data = validated_data.pop("summer_vouchers", []) or []
        if request and request.method == "PUT":
            self._update_summer_vouchers(summer_vouchers_data, instance)

        new_status = validated_data.get("status")
        if (
            new_status == EmployerApplicationStatus.SUBMITTED
            and instance.status == EmployerApplicationStatus.DRAFT
        ):
            validated_data["submitted_at"] = timezone.now()

        return super().update(instance, validated_data)

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        company = get_or_create_company_using_organization_roles(request)
        validated_data["company"] = company
        validated_data["user"] = user

        return super().create(validated_data)

    def get_is_mine(self, obj):
        request = self.context.get("request")
        if request:
            return obj.user == request.user
        return False

    def _update_summer_vouchers(
        self, summer_vouchers_data: list, application: EmployerApplication
    ) -> None:
        serializer = EmployerSummerVoucherSerializer(
            application.summer_vouchers.all(),
            data=summer_vouchers_data,
            many=True,
            context={**self.context, "application": application},
        )

        if not serializer.is_valid():
            raise serializers.ValidationError(
                format_lazy(
                    _("Reading summer voucher data failed: {errors}"),
                    errors=serializer.errors,
                )
            )

        for idx, summer_voucher_item in enumerate(serializer.validated_data):
            summer_voucher_item.pop("employee_name", None)
            summer_voucher_item["application_id"] = application.pk
            summer_voucher_item["ordering"] = (
                idx  # use the ordering defined in the JSON sent by the client
            )
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
        "bank_account_number",
        "contact_person_name",
        "contact_person_email",
        "contact_person_phone_number",
        "is_separate_invoicer",
        "summer_vouchers",
    ]

    def _validate_non_draft_required_fields(self, data):
        if not data.get("status") or data["status"] == EmployerApplicationStatus.DRAFT:
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
        * Sometimes, a multi-page document might be uploaded as a set of jpg files, and
          the backend would not know that it's meant to be a single document.
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


class SchoolSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        return instance.name

    class Meta:
        model = School
        fields = ["name"]
        read_only_fields = ["name"]


class SummerVoucherConfigurationSerializer(serializers.ModelSerializer):
    target_groups = serializers.SerializerMethodField()

    class Meta:
        model = SummerVoucherConfiguration
        fields = [
            "year",
            "voucher_value_in_euros",
            "min_work_compensation_in_euros",
            "min_work_hours",
            "target_groups",
        ]

    def get_target_groups(self, obj):
        return get_target_group_data(obj.target_group)


class YouthApplicationSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        self.hide_vtj_data = kwargs.pop("hide_vtj_data", False)
        super().__init__(*args, **kwargs)

    def validate_social_security_number(self, value):
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError(
                {"social_security_number": _("Must be set")}
            )
        return value

    def validate(self, data):
        """
        Validate data.

        NOTE:
            - Checks that a SummerVoucherConfiguration exists for the current year.
            - This check is only performed during creation (self.instance is None).
        """
        data = super().validate(data)
        self.validate_social_security_number(data.get("social_security_number", None))

        if self.instance is None:  # Creation only
            if not SummerVoucherConfiguration.objects.filter(
                year=timezone.now().year
            ).exists():
                raise serializers.ValidationError(
                    _("Summer voucher configuration for current year does not exist")
                )

        return data

    def to_internal_value(self, data):
        """
        Dict of native values <- Dict of primitive datatypes.

        NOTE: Overridden to remove non-conforming read-only field handler from result.
        """
        result = super().to_internal_value(data)
        if "handler" in result and "handler" in self.Meta.read_only_fields:
            # FIXME: Why is handler field in result? It shouldn't be as it's read-only.
            #        Maybe something to do with it using PrimaryKeyRelatedField?
            del result["handler"]  # Remove non-conforming read-only field from result
        return result

    def to_representation(self, instance):
        """
        Object instance -> Dict of primitive datatypes.
        """
        result = super().to_representation(instance)
        if self.hide_vtj_data:
            for vtj_data_field in self.Meta.vtj_data_fields:
                if vtj_data_field in result:
                    del result[vtj_data_field]
        return result

    class Meta:
        model = YouthApplication
        vtj_data_fields = [
            "encrypted_original_vtj_json",
            "encrypted_handler_vtj_json",
        ]
        read_only_fields = [
            "id",
            "creator",
            "created_at",
            "modified_at",
            "receipt_confirmed_at",
            "status",
            "handler",
            "handled_at",
            "additional_info_user_reasons",
            "additional_info_description",
            "additional_info_provided_at",
            "non_vtj_birthdate",
            "non_vtj_home_municipality",
            "is_vtj_data_restricted",
        ] + vtj_data_fields
        fields = read_only_fields + [
            "first_name",
            "last_name",
            "social_security_number",
            "school",
            "is_unlisted_school",
            "email",
            "phone_number",
            "postcode",
            "language",
            "request_additional_information",
            "target_group",
        ]

    request_additional_information = serializers.BooleanField(
        required=False, default=False, write_only=True
    )
    target_group = serializers.ChoiceField(
        choices=get_target_group_choices(),
        required=True,
    )

    encrypted_original_vtj_json = serializers.SerializerMethodField(
        "get_encrypted_original_vtj_json"
    )
    encrypted_handler_vtj_json = serializers.SerializerMethodField(
        "get_encrypted_handler_vtj_json"
    )
    creator = serializers.PrimaryKeyRelatedField(
        required=False,
        allow_null=True,
        queryset=HandlerPermission.get_handler_users_queryset(),
    )
    handler = serializers.PrimaryKeyRelatedField(
        required=False,
        allow_null=True,
        queryset=HandlerPermission.get_handler_users_queryset(),
    )

    def create(self, validated_data):
        if "request_additional_information" in validated_data:
            del validated_data["request_additional_information"]
        return super().create(validated_data)

    def get_encrypted_char_field_as_json(self, obj, field_name):
        """
        Return EncryptedCharField as JSON object, converting None & empty
        string to {}.
        """
        if not hasattr(obj, field_name):
            raise ValueError(f"Invalid field name {field_name}")

        field_value = getattr(obj, field_name)
        if field_value in [None, ""]:
            return {}
        else:
            return json.loads(field_value)

    def get_encrypted_original_vtj_json(self, obj):
        return self.get_encrypted_char_field_as_json(obj, "encrypted_original_vtj_json")

    def get_encrypted_handler_vtj_json(self, obj):
        return self.get_encrypted_char_field_as_json(obj, "encrypted_handler_vtj_json")


class YouthApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = YouthApplication
        fields = read_only_fields = [
            "status",
        ]


class NonVtjYouthApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating youth applications without VTJ data.

    NOTE:
        Use ONLY when applicant has no permanent Finnish personal identity code.
    """

    class Meta:
        model = YouthApplication
        fields = [
            "first_name",
            "last_name",
            "non_vtj_birthdate",
            "non_vtj_home_municipality",
            "school",
            "is_unlisted_school",
            "email",
            "phone_number",
            "postcode",
            "language",
            "target_group",
            "receipt_confirmed_at",
            "status",
            "creator",
            "handler",
            "additional_info_provided_at",
            "additional_info_user_reasons",
            "additional_info_description",
        ]

    target_group = serializers.ChoiceField(
        choices=get_target_group_choices(),
        required=True,
    )

    def validate_additional_info_description(self, value):
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError(
                {"additional_info_description": _("Must be set")}
            )
        return value

    def validate_language(self, value):
        if value not in get_supported_languages():
            raise serializers.ValidationError({"language": _("Invalid language")})
        return value

    def validate_non_vtj_birthdate(self, value):
        if not isinstance(value, date):
            try:
                date.fromisoformat(value)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    {"non_vtj_birthdate": _("Invalid date")}
                )
        return value

    def validate(self, data):
        """
        Validate data.

        NOTE:
            - Checks that a SummerVoucherConfiguration exists for the current year.
            - This check is only performed during creation (self.instance is None).
        """
        data = super().validate(data)
        self.validate_additional_info_description(
            data.get("additional_info_description", None)
        )
        self.validate_language(data.get("language", None))
        self.validate_non_vtj_birthdate(data.get("non_vtj_birthdate", None))

        if self.instance is None:  # Creation only
            if not SummerVoucherConfiguration.objects.filter(
                year=timezone.now().year
            ).exists():
                raise serializers.ValidationError(
                    _("Summer voucher configuration for current year does not exist")
                )

        return data

    def to_internal_value(self, data):
        # Convert optional fields' input values from None to ""
        if data.get("additional_info_description", None) is None:
            data["additional_info_description"] = ""
        if data.get("non_vtj_home_municipality", None) is None:
            data["non_vtj_home_municipality"] = ""
        return super().to_internal_value(data)

    creator = serializers.PrimaryKeyRelatedField(
        required=not HandlerPermission.allow_empty_handler(),
        allow_null=HandlerPermission.allow_empty_handler(),
        queryset=HandlerPermission.get_handler_users_queryset(),
    )


class YouthApplicationAdditionalInfoSerializer(serializers.ModelSerializer):
    def validate_additional_info_user_reasons(self, value):
        validate_additional_info_user_reasons(value, allow_empty_list=False)
        return value

    def validate_additional_info_description(self, value):
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError(
                {"additional_info_description": _("Must be set")}
            )
        return value

    def validate(self, data):
        data = super().validate(data)
        self.validate_additional_info_user_reasons(
            data.get("additional_info_user_reasons", None)
        )
        self.validate_additional_info_description(
            data.get("additional_info_description", None)
        )
        return data

    class Meta:
        model = YouthApplication
        fields = [
            "additional_info_user_reasons",
            "additional_info_description",
        ]


class YouthApplicationHandlingSerializer(serializers.ModelSerializer):
    encrypted_handler_vtj_json = serializers.JSONField(write_only=True)

    def to_internal_value(self, data):
        """
        Dict of native values <- Dict of primitive datatypes.
        """
        result = super().to_internal_value(data)
        result["encrypted_handler_vtj_json"] = json.dumps(
            result["encrypted_handler_vtj_json"]
        )
        return result

    class Meta:
        model = YouthApplication
        fields = [
            "encrypted_handler_vtj_json",
        ]


class YouthApplicationExcelExportSerializer(serializers.ModelSerializer):
    application_year = serializers.SerializerMethodField()
    application_date = serializers.SerializerMethodField()
    birth_year = serializers.SerializerMethodField()
    birthdate = serializers.SerializerMethodField()
    confirmation_date = serializers.SerializerMethodField()
    handling_date = serializers.SerializerMethodField()
    additional_info_providing_date = serializers.SerializerMethodField()
    additional_info_user_reasons = serializers.SerializerMethodField()
    summer_voucher_serial_number = serializers.SerializerMethodField()
    is_unlisted_school = serializers.SerializerMethodField()

    @staticmethod
    def to_isoformat_localdate(value: datetime) -> str:
        return timezone.localdate(value).isoformat() if value else ""

    @staticmethod
    def to_local_year(value: datetime) -> int:
        return timezone.localdate(value).year

    def get_summer_voucher_serial_number(self, obj: YouthApplication) -> Optional[int]:
        if not obj.has_youth_summer_voucher:
            return None
        return obj.youth_summer_voucher.summer_voucher_serial_number

    def get_birth_year(self, obj: YouthApplication) -> int:
        try:
            return obj.birthdate.year
        except AttributeError:  # Handle invalid data gracefully
            return -1  # Show a clearly invalid value

    def get_birthdate(self, obj: YouthApplication) -> str:
        try:
            return obj.birthdate.isoformat()
        except AttributeError:  # Handle invalid data gracefully
            return "N/A"

    def get_application_year(self, obj: YouthApplication) -> int:
        return self.to_local_year(obj.created_at)

    def get_application_date(self, obj: YouthApplication) -> str:
        return self.to_isoformat_localdate(obj.created_at)

    def get_confirmation_date(self, obj: YouthApplication) -> str:
        return self.to_isoformat_localdate(obj.receipt_confirmed_at)

    def get_additional_info_providing_date(self, obj: YouthApplication) -> str:
        return self.to_isoformat_localdate(obj.additional_info_provided_at)

    def get_handling_date(self, obj: YouthApplication) -> str:
        return self.to_isoformat_localdate(obj.handled_at)

    def get_additional_info_user_reasons(self, obj: YouthApplication) -> str:
        return ", ".join(sorted(obj.additional_info_user_reasons))

    def get_is_unlisted_school(self, obj: YouthApplication) -> str:
        with translation.override("fi"):
            return str(_("Kyllä") if obj.is_unlisted_school else _("Ei"))

    @staticmethod
    def get_placeholder_value(field: str) -> Union[int, str]:
        if field in ["application_year", "birth_year"]:
            return 1  # Placeholder integer value
        else:
            return "placeholder_value"

    class Meta:
        model = YouthApplication
        fields = read_only_fields = [
            "additional_info_description",
            "additional_info_providing_date",
            "additional_info_user_reasons",
            "application_date",
            "application_year",
            "birth_year",
            "birthdate",
            "confirmation_date",
            "email",
            "first_name",
            "handling_date",
            "id",
            "is_unlisted_school",
            "language",
            "last_name",
            "phone_number",
            "postcode",
            "school",
            "status",
            "summer_voucher_serial_number",
            "vtj_home_municipality",
            "vtj_last_name",
        ]
