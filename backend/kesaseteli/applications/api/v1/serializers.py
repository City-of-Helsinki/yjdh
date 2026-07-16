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
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers
from rest_framework.exceptions import APIException

from applications.api.v1.validators import validate_additional_info_user_reasons
from applications.enums import (
    ActionType,
    AdditionalInfoUserReason,
    AttachmentType,
    EmployerApplicationStatus,
    get_supported_languages,
    TimelineItemType,
    YouthApplicationStatus,
)
from applications.exporters.excel_exporter import resolve_target_group_and_status
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
from common.utils import get_age, mask_social_security_number
from companies.api.v1.serializers import CompanySerializer
from companies.services import (
    get_or_create_company_using_organization_roles,
    update_company_from_ytj,
)

LOGGER = logging.getLogger(__name__)

VALID_TIMELINE_ITEM_TYPES = {choice[0] for choice in TimelineItemType.choices}


def validate_timeline_item_types(requested_types: set) -> set:
    """
    Validate requested item_types against the documented enum.
    Returns the validated set (empty means all types).
    Raises ValidationError for unsupported values.
    """
    if not requested_types:
        return requested_types
    invalid = requested_types - VALID_TIMELINE_ITEM_TYPES
    if invalid:
        raise serializers.ValidationError(
            f"Unsupported item_types: {', '.join(sorted(invalid))}. "
            f"Valid values: {', '.join(sorted(VALID_TIMELINE_ITEM_TYPES))}"
        )
    return requested_types


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

    # Use write_only to allow validation of incoming files, but
    # not allowing their URLs (e.g. to Azure blob storage) to be
    # outputted to the user, see FileField's asymmetric behavior on input/output:
    # https://github.com/encode/django-rest-framework/blob/main/rest_framework/fields.py
    # https://www.django-rest-framework.org/api-guide/fields/#filefield
    attachment_file = serializers.FileField(write_only=True)

    attachment_file_name = serializers.SerializerMethodField(
        "get_attachment_file_name",
        help_text="Name of the uploaded file",
    )

    def get_attachment_file_name(self, obj) -> str:
        return getattr(obj.attachment_file, "name", "")

    def get_is_handler(self) -> bool:
        return self.context.get("is_handler", False)

    def validate(self, data):
        """
        Perform rudimentary validation of file content to guard against
        accidentally uploading invalid files.
        """

        is_handler = self.get_is_handler()
        if not is_handler and (
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

    def _is_valid_image(self, uploaded_file) -> bool:
        try:
            # check if the file is a valid image
            im = Image.open(uploaded_file)
            im.verify()
        except UnidentifiedImageError:
            return False
        else:
            return True

    def _is_valid_pdf(self, uploaded_file) -> bool:
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
    youth_application_id = serializers.SerializerMethodField()

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
            "youth_application_id",
        ]
        read_only_fields = [
            "ordering",
            "employee_school",
            "employee_birthdate",
            "employee_home_city",
            "employee_postcode",
            "youth_application_id",
        ]
        list_serializer_class = EmployerSummerVoucherListSerializer

    @extend_schema_field(OpenApiTypes.UUID)
    def get_youth_application_id(self, obj) -> Optional[str]:
        if obj.youth_summer_voucher and obj.youth_summer_voucher.youth_application:
            return str(obj.youth_summer_voucher.youth_application.id)
        return None

    def _validate_non_draft_required_fields(self, data):
        parent = self.parent
        status = (
            parent.parent.initial_data.get("status") if parent and parent.parent else ""
        )

        if not status or status == EmployerApplicationStatus.DRAFT:
            # newly created applications are always DRAFT
            LOGGER.debug(
                "Application is in DRAFT state, skipping validation",
                extra={
                    "data": data,
                    "status": status,
                },
            )
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
            LOGGER.debug(
                "No summer voucher serial number provided.",
                extra={
                    "data": data,
                },
            )
            return

        voucher = YouthSummerVoucher.objects.get_by_serial_number(serial_number)
        if not voucher:
            LOGGER.debug(
                "No summer voucher found for serial number.",
                extra={
                    "serial_number": serial_number,
                },
            )
            return

        user_provided_name = data.get("employee_name")
        self._validate_voucher_employee_name(voucher, user_provided_name)
        self._validate_voucher_status(voucher.youth_application)
        self._validate_voucher_usage(
            voucher, application=self._get_application_context()
        )

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
            "payee_name",
            "payee_address",
            "bank_swift_bic_code",
            "bank_name",
            "bank_address",
            "company",
            "user",
            "summer_vouchers",
            "language",
            "submitted_at",
            "is_mine",
        ]
        read_only_fields = ["created_at", "modified_at", "submitted_at", "user"]

    def _schedule_ytj_update(self, company):
        """
        Schedule a refresh of the company data from the YTJ API.

        The YTJ refresh fetches data via a blocking HTTP call. We wrap
        this in on_commit to run it outside the atomic transaction block,
        which prevents holding database locks during the external request.

        The company object is refreshed from the database within the callback
        to ensure we are working with the latest committed database state.
        """

        def _refresh_and_update_company():
            company.refresh_from_db()
            update_company_from_ytj(company)

        transaction.on_commit(_refresh_and_update_company)

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Update company data from YTJ on application submission.

        If the application status is changed to SUBMITTED and the
        UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT feature flag is enabled, the company
        data is refreshed from the YTJ API. The refresh happens asynchronously
        after the database transaction commits to avoid holding database locks during
        the external HTTP request.

        Args:
            instance: The EmployerApplication instance to update.
            validated_data: The validated data for the update.

        Returns:
            The updated EmployerApplication instance.
        """
        request = self.context.get("request")
        summer_vouchers_data = validated_data.pop("summer_vouchers", []) or []
        if request and request.method == "PUT":
            LOGGER.debug(
                "Updating employer application with PUT.",
                extra={
                    "application_id": instance.pk,
                    "summer_vouchers_data": summer_vouchers_data,
                },
            )
            self._update_summer_vouchers(summer_vouchers_data, instance)

        new_status = validated_data.get("status")
        if (
            new_status == EmployerApplicationStatus.SUBMITTED
            and instance.status == EmployerApplicationStatus.DRAFT
        ):
            LOGGER.debug(
                "Changing application status from DRAFT to SUBMITTED. "
                "Setting submitted_at.",
                extra={
                    "application_id": instance.pk,
                },
            )
            validated_data["submitted_at"] = timezone.now()

            # Refresh company data from YTJ service upon application submission.
            # This is best-effort: errors are logged but do NOT block submission.
            if settings.UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT:
                self._schedule_ytj_update(instance.company)

        return super().update(instance, validated_data)

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        company = get_or_create_company_using_organization_roles(request)
        validated_data["company"] = company
        validated_data["user"] = user

        application = super().create(validated_data)

        LOGGER.debug(
            "Created a new application.", extra={"application_id": application.pk}
        )

        # Create an empty summer voucher for the application.
        # This ensures that the application always has at least one summer voucher.
        # NOTE: This means simpler attachments handling in frontend.
        if not application.summer_vouchers.exists():
            LOGGER.debug(
                "Creating an empty summer voucher for the application.",
                extra={"application_id": application.pk},
            )
            EmployerSummerVoucher.objects.create(application=application)

        return application

    def get_is_mine(self, obj) -> bool:
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
            LOGGER.debug(
                "Summer voucher serializer validation failed.",
                extra={
                    "summer_vouchers_data": summer_vouchers_data,
                    "errors": serializer.errors,
                },
            )
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

        LOGGER.debug(
            "Saving employer application summer vouchers - validated.",
            extra={
                "application_id": application.pk,
                "summer_vouchers": serializer.validated_data,
            },
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

        LOGGER.debug(
            "Validating required fields for submitted application.",
            extra={
                "application": data,
            },
        )

        required_fields = self.REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS[:]
        if data.get("is_separate_invoicer"):
            required_fields.extend(
                ["invoicer_name", "invoicer_email", "invoicer_phone_number"]
            )

        # Foreign IBAN fields are required if IBAN is not Finnish
        bank_account_number = data.get("bank_account_number", "")
        if bank_account_number and not str(bank_account_number).startswith("FI"):
            required_fields.extend(
                [
                    "payee_name",
                    "payee_address",
                    "bank_swift_bic_code",
                    "bank_name",
                    "bank_address",
                ]
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
        LOGGER.debug(
            "Validating attachments for application.",
            extra={
                "application": self.instance,
            },
        )
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
            LOGGER.debug(
                "Attachments validated successfully for summer voucher.",
                extra={
                    "summer_voucher": summer_voucher,
                },
            )
        LOGGER.debug(
            "All attachments validated successfully for application.",
            extra={
                "application": self.instance,
            },
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

    def get_target_groups(self, obj) -> list[dict]:
        return get_target_group_data(obj.target_group)


class YouthApplicationEmployerApplicationSerializer(serializers.Serializer):
    id = serializers.UUIDField(help_text="Employer application UUID")
    company_name = serializers.CharField(help_text="Company name")
    company_business_id = serializers.CharField(
        help_text="Company business ID (Y-tunnus)"
    )
    summer_voucher_serial_number = serializers.CharField(
        help_text="Serial number of the summer voucher"
    )
    submitted_at = serializers.DateTimeField(
        help_text="Date and time when the employer application was submitted",
        read_only=True,
    )


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
            "employer_applications",
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
    employer_applications = serializers.SerializerMethodField(
        help_text=(
            "List of linked employer applications. "
            "Strictly restricted to handler users. "
            "Returns an empty list for unauthorized or public users."
        )
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

    def get_encrypted_char_field_as_json(self, obj, field_name: str) -> dict:
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

    def get_encrypted_original_vtj_json(self, obj) -> dict:
        return self.get_encrypted_char_field_as_json(obj, "encrypted_original_vtj_json")

    def get_encrypted_handler_vtj_json(self, obj) -> dict:
        return self.get_encrypted_char_field_as_json(obj, "encrypted_handler_vtj_json")

    @extend_schema_field(YouthApplicationEmployerApplicationSerializer(many=True))
    def get_employer_applications(self, obj: YouthApplication) -> list:
        request = self.context.get("request")
        if (
            not request
            or not request.user
            or not HandlerPermission.has_user_permission(request.user)
        ):
            return []

        if not obj.has_youth_summer_voucher:
            return []

        youth_voucher = obj.youth_summer_voucher
        employer_vouchers = youth_voucher.employer_summer_vouchers.select_related(
            "application", "application__company"
        ).all()

        results = []
        for ev in employer_vouchers:
            app = ev.application
            if app:
                results.append(
                    {
                        "id": app.id,
                        "company_name": app.company.name if app.company else "",
                        "company_business_id": app.company.business_id
                        if app.company
                        else "",
                        "summer_voucher_serial_number": ev.summer_voucher_serial_number,
                        "submitted_at": (
                            app.submitted_at.isoformat()
                            if app.submitted_at
                            else app.created_at.isoformat()
                        ),
                    }
                )
        return results


class YouthApplicationListSerializer(serializers.ModelSerializer):
    social_security_number = serializers.SerializerMethodField()
    summer_voucher_serial_number = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    birth_year = serializers.SerializerMethodField()
    target_group_name = serializers.CharField(
        source="get_target_group_display", read_only=True
    )

    class Meta:
        model = YouthApplication
        fields = [
            "id",
            "first_name",
            "last_name",
            "social_security_number",
            "status",
            "created_at",
            "target_group",
            "target_group_name",
            "summer_voucher_serial_number",
            "age",
            "birth_year",
        ]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_social_security_number(self, obj: YouthApplication) -> Optional[str]:
        return mask_social_security_number(obj.social_security_number) or None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_summer_voucher_serial_number(self, obj: YouthApplication) -> Optional[str]:
        if not obj.has_youth_summer_voucher:
            return None
        return obj.youth_summer_voucher.user_showable_serial_number

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_age(self, obj: YouthApplication) -> Optional[int]:
        birthdate = obj.birthdate
        if not birthdate:
            return None
        year = obj.created_at.year if obj.created_at else timezone.now().year
        return get_age(birthdate, year)

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_birth_year(self, obj: YouthApplication) -> Optional[int]:
        birthdate = obj.birthdate
        if not birthdate:
            return None
        return birthdate.year


class YouthApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = YouthApplication
        fields = read_only_fields = [
            "status",
        ]


class NonVtjYouthApplicationSerializer(serializers.ModelSerializer):
    """Serializer for handler create-without-ssn youth applications (no Finnish SSN).

    The client sends applicant fields only. Server-managed workflow fields are
    read-only on input and set in ``create()``.
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
        read_only_fields = [
            "is_unlisted_school",
            "receipt_confirmed_at",
            "additional_info_provided_at",
            "additional_info_user_reasons",
            "status",
            "creator",
            "handler",
        ]

    target_group = serializers.ChoiceField(
        choices=get_target_group_choices(),
        required=True,
    )
    additional_info_description = serializers.CharField(
        required=True,
        max_length=4096,
    )
    language = serializers.ChoiceField(
        choices=get_supported_languages(),
        required=True,
    )
    non_vtj_birthdate = serializers.DateField(required=True)

    def validate_additional_info_description(self, value):
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError(_("Must be set"))
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

    def create(self, validated_data):
        """Create a handler-entered application for an applicant without a Finnish SSN.

        Handlers must not set workflow fields, so assignment, receipt timestamps, and
        ``status`` are applied here.

        ``is_unlisted_school`` is always True because the handler types the school name
        manually. ``additional_info_user_reasons`` is always ``OTHER``. That is the
        only reason that applies when there is no Finnish SSN or VTJ lookup.

        ``status`` is set to ``YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED``.
        The application is ready for manual handler review because the handler has
        already entered the extra details that, in the public apply flow, the youth
        would submit later.
        """
        request = self.context["request"]
        validated_data["is_unlisted_school"] = True
        validated_data["receipt_confirmed_at"] = timezone.now()
        validated_data["additional_info_provided_at"] = timezone.now()
        validated_data["additional_info_user_reasons"] = [
            AdditionalInfoUserReason.OTHER.value
        ]
        validated_data["status"] = (
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
        )
        validated_data["creator"] = request.user
        validated_data["handler"] = None
        return super().create(validated_data)


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


# --- Public API wire shapes (OpenAPI + contract tests) ---
# Input/Output suffixes mark HTTP request vs response contracts (not model CRUD).


class YouthApplicationFetchEmployeeDataInputSerializer(serializers.Serializer):
    """Request body (input) for fetching employee data for a summer voucher."""

    employer_summer_voucher_id = serializers.UUIDField()
    employee_name = serializers.CharField()
    summer_voucher_serial_number = serializers.CharField()


class YouthApplicationFetchEmployeeDataOutputSerializer(serializers.Serializer):
    """Response body (output) for employee data lookup."""

    employer_summer_voucher_id = serializers.UUIDField()
    employee_name = serializers.CharField()
    employee_birthdate = serializers.DateField()
    employee_phone_number = serializers.CharField(allow_blank=True)
    employee_home_city = serializers.CharField(allow_blank=True, allow_null=True)
    employee_postcode = serializers.CharField(allow_blank=True)
    employee_school = serializers.CharField(allow_blank=True)

    @classmethod
    def from_youth_application(
        cls,
        employer_summer_voucher_id,
        youth_application: YouthApplication,
    ):
        """Build serialized employee lookup response from a matched application.

        Maps model fields to employer-facing API names.

        NOTE: ``is_valid(raise_exception=True)`` validates the mapped response
        against the public contract (catches mapping bugs), not client input.
        Failures on this path indicate programming errors after a successful
        lookup, not invalid request data.

        Args:
            employer_summer_voucher_id: Employer summer voucher identifier.
            youth_application: Matched youth application.

        Returns:
            Serializer instance with employee lookup fields populated.
        """
        serializer = cls(
            data={
                "employer_summer_voucher_id": str(employer_summer_voucher_id),
                "employee_name": youth_application.name,
                "employee_birthdate": youth_application.birthdate,
                "employee_phone_number": youth_application.phone_number,
                "employee_home_city": youth_application.home_municipality,
                "employee_postcode": youth_application.postcode,
                "employee_school": youth_application.school,
            }
        )
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as exc:
            LOGGER.exception(
                "Invalid fetch_employee_data response for YouthApplication %s: %s",
                youth_application.pk,
                exc.detail,
            )
            raise APIException("Invalid employee lookup response data") from exc
        return serializer


class YouthApplicationOutputSerializer(serializers.Serializer):
    """Response body (output) with the youth application ``id`` (HTTP 201)."""

    id = serializers.UUIDField()


@extend_schema_field(OpenApiTypes.BINARY)
class BinaryFileField(serializers.FileField):
    pass


class EmployerSummerVoucherAttachmentUploadInputSerializer(serializers.Serializer):
    """Request body (input) for uploading an attachment to an employer voucher."""

    attachment_file = BinaryFileField()
    attachment_type = serializers.ChoiceField(choices=AttachmentType.choices)


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
    target_group = serializers.SerializerMethodField()
    target_group_calculation_status = serializers.SerializerMethodField()

    @staticmethod
    def to_isoformat_localdate(value: datetime) -> str:
        return timezone.localdate(value).isoformat() if value else ""

    @staticmethod
    def to_local_year(value: datetime) -> int:
        return timezone.localdate(value).year

    def get_summer_voucher_serial_number(self, obj: YouthApplication) -> str | None:
        if not obj.has_youth_summer_voucher:
            return None
        return obj.youth_summer_voucher.user_showable_serial_number

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

    def get_target_group(self, obj: YouthApplication) -> str:
        val, _ = resolve_target_group_and_status(obj)
        return val

    def get_target_group_calculation_status(self, obj: YouthApplication) -> str:
        _, status_val = resolve_target_group_and_status(obj)
        return status_val

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
            "target_group",
            "target_group_calculation_status",
            "vtj_home_municipality",
            "vtj_last_name",
        ]


class ActivityLogItemSerializer(serializers.Serializer):
    """
    Serializer for a single parsed timeline activity item (ActivityLogItem DTO).
    Represents actions like status changes recorded by the application's audit log.
    """

    item_type = serializers.SerializerMethodField()
    action_type = serializers.ChoiceField(choices=ActionType.choices)
    old_value = serializers.CharField(allow_blank=True)
    new_value = serializers.CharField(allow_blank=True)
    author_name = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()

    def get_item_type(self, obj) -> str:
        return TimelineItemType.ACTIVITY
