from datetime import date

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from applications.api.v1.serializers.utils import DynamicFieldsModelSerializer
from applications.enums import ApplicationAlterationState, ApplicationAlterationType
from applications.models import ApplicationAlteration
from users.api.v1.serializers import UserSerializer
from users.utils import get_company_from_request, get_request_user_from_context


class BaseApplicationAlterationSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = ApplicationAlteration
        fields = [
            "id",
            "created_at",
            "application",
            "alteration_type",
            "state",
            "end_date",
            "resume_date",
            "reason",
            "handled_at",
            "handled_by",
            "cancelled_at",
            "cancelled_by",
            "recovery_start_date",
            "recovery_end_date",
            "recovery_amount",
            "recovery_justification",
            "is_recoverable",
            "use_einvoice",
            "einvoice_provider_name",
            "einvoice_provider_identifier",
            "einvoice_address",
            "contact_person_name",
            "application_company_name",
            "application_number",
            "application_employee_first_name",
            "application_employee_last_name",
        ]
        read_only_fields = [
            "application_company_name",
            "application_number",
            "application_employee_first_name",
            "application_employee_last_name",
            "handled_at",
            "handled_by",
            "cancelled_at",
            "cancelled_by",
        ]

    ALLOWED_APPLICANT_EDIT_STATES = [
        ApplicationAlterationState.RECEIVED,
    ]

    ALLOWED_HANDLER_EDIT_STATES = [
        ApplicationAlterationState.RECEIVED,
        ApplicationAlterationState.OPENED,
        ApplicationAlterationState.HANDLED,
    ]

    application_company_name = serializers.SerializerMethodField(
        "get_application_company_name"
    )

    application_number = serializers.SerializerMethodField("get_application_number")

    application_employee_first_name = serializers.SerializerMethodField(
        "get_application_employee_first_name"
    )
    application_employee_last_name = serializers.SerializerMethodField(
        "get_application_employee_last_name"
    )

    handled_by = UserSerializer(
        read_only=True, help_text="Handler of this alteration, if any"
    )
    cancelled_by = UserSerializer(
        read_only=True,
        help_text="The handler responsible for the cancellation of this alteration, if any",
    )

    def get_application_company_name(self, obj):
        return obj.application.company.name

    def get_application_number(self, obj):
        return obj.application.application_number

    def get_application_employee_first_name(self, obj):
        return obj.application.employee.first_name

    def get_application_employee_last_name(self, obj):
        return obj.application.employee.last_name

    def _get_merged_object_for_validation(self, new_data):
        def _get_field(field_name):
            if field_name in new_data:
                return new_data[field_name]
            elif self.instance is not None and hasattr(self.instance, field_name):
                return getattr(self.instance, field_name)
            else:
                return None

        return {field: _get_field(field) for field in self.fields}

    def _validate_conditional_required_fields(self, is_suspended, data):
        errors = []

        # Verify fields that are required based on if values in other fields are filled
        if is_suspended and data["resume_date"] is None:
            errors.append(
                ValidationError(
                    _("Resume date is required if the benefit period wasn't terminated")
                )
            )
        if data["use_einvoice"] is True:
            for field, field_label in [
                ("einvoice_provider_name", _("E-invoice provider name")),
                ("einvoice_provider_identifier", _("E-invoice provider identifier")),
                ("einvoice_address", _("E-invoice address")),
            ]:
                if data[field] == "" or data[field] is None:
                    errors.append(
                        ValidationError(
                            format_lazy(
                                _(
                                    "{field} must be filled if using an e-invoice address"
                                ),
                                field=field_label,
                            )
                        )
                    )

        return errors

    def _validate_date_range_within_application_date_range(
        self, application, start_date, end_date
    ):
        errors = []
        if start_date < application.start_date:
            errors.append(
                ValidationError(
                    _(
                        "The change to employment cannot start before the start date of the benefit period"
                    )
                )
            )
        if start_date > application.end_date:
            errors.append(
                ValidationError(
                    _(
                        "The change to employment cannot start after the end date of the benefit period"
                    )
                )
            )
        if end_date is not None:
            if end_date > application.end_date:
                errors.append(
                    ValidationError(
                        _(
                            "The end date of the change period cannot be after the end date of the benefit period"
                        )
                    )
                )
            if start_date > end_date:
                errors.append(
                    ValidationError(
                        _(
                            "The end date of the change period cannot be before the start date of the same period"
                        )
                    )
                )

        return errors

    def _validate_date_range_overlaps(self, self_id, application, start_date, end_date):
        errors = []

        for alteration in application.alteration_set.all():
            if self_id is not None and alteration.id == self_id:
                continue

            if (
                alteration.recovery_start_date is None
                or alteration.recovery_end_date is None
            ):
                continue

            if start_date > alteration.recovery_end_date:
                continue
            if end_date < alteration.recovery_start_date:
                continue

            errors.append(
                ValidationError(
                    _(
                        "Another change to employment has already been reported for the same period"
                    )
                )
            )

        return errors

    def validate(self, data):
        merged_data = self._get_merged_object_for_validation(data)
        self_id = "id" in merged_data and merged_data["id"] or None

        # Verify that the user is allowed to make the request
        user = get_request_user_from_context(self)
        request = self.context.get("request")

        application = merged_data["application"]

        if not settings.NEXT_PUBLIC_MOCK_FLAG and not user.is_handler():
            company = get_company_from_request(request)
            if company != application.company:
                raise PermissionDenied(_("You are not allowed to do this action"))

        # Verify that the alteration can be edited in its current state
        if self.instance is not None:
            current_state = self.instance.state
            allowed_states = (
                self.ALLOWED_HANDLER_EDIT_STATES
                if user.is_handler()
                else self.ALLOWED_APPLICANT_EDIT_STATES
            )

            if current_state not in allowed_states:
                raise PermissionDenied(
                    _("You cannot edit the change to employment in this state")
                )

        # Verify that any fields that are required based on another field are filled
        errors = []
        is_suspended = (
            merged_data["alteration_type"] == ApplicationAlterationType.SUSPENSION
        )
        errors += self._validate_conditional_required_fields(is_suspended, merged_data)

        # Verify that the date range is coherent
        alteration_start_date = merged_data["end_date"]
        alteration_end_date = (
            merged_data["resume_date"] if is_suspended else application.end_date
        )

        errors += self._validate_date_range_within_application_date_range(
            application, alteration_start_date, alteration_end_date
        )

        if alteration_end_date is not None:
            errors += self._validate_date_range_overlaps(
                self_id, application, alteration_start_date, alteration_end_date
            )

        if len(errors) > 0:
            raise ValidationError(errors)

        return data


class ApplicantApplicationAlterationSerializer(BaseApplicationAlterationSerializer):
    class Meta(BaseApplicationAlterationSerializer.Meta):
        fields = [
            "id",
            "created_at",
            "application",
            "alteration_type",
            "state",
            "end_date",
            "resume_date",
            "reason",
            "handled_at",
            "handled_by",
            "recovery_start_date",
            "recovery_end_date",
            "recovery_amount",
            "is_recoverable",
            "use_einvoice",
            "einvoice_provider_name",
            "einvoice_provider_identifier",
            "einvoice_address",
            "contact_person_name",
            "application_company_name",
            "application_number",
            "application_employee_first_name",
            "application_employee_last_name",
        ]
        read_only_fields = BaseApplicationAlterationSerializer.Meta.read_only_fields + [
            "recovery_amount",
            "state",
            "recovery_start_date",
            "recovery_end_date",
            "recovery_justification",
            "is_recoverable",
        ]


class HandlerApplicationAlterationSerializer(BaseApplicationAlterationSerializer):
    @transaction.atomic
    def update(self, instance, validated_data):
        # Add handler/canceller information on state update.
        # The transition itself is validated in the viewset and is one-way
        # (only received -> handled -> cancelled allowed), so we don't need to
        # care about the present values in those fields.

        new_state = (
            validated_data["state"] if "state" in validated_data else instance.state
        )
        if instance.state != new_state:
            user = get_request_user_from_context(self)

            if new_state == ApplicationAlterationState.HANDLED:
                instance.handled_at = date.today()
                instance.handled_by = user
            elif new_state == ApplicationAlterationState.CANCELLED:
                instance.cancelled_at = date.today()
                instance.cancelled_by = user

            instance.save()

        return super().update(instance, validated_data)
