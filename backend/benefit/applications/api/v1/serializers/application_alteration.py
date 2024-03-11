from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import PermissionDenied

from applications.api.v1.serializers.utils import DynamicFieldsModelSerializer
from applications.enums import ApplicationAlterationState, ApplicationAlterationType
from applications.models import ApplicationAlteration
from users.utils import get_company_from_request, get_request_user_from_context


class ApplicationAlterationSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = ApplicationAlteration
        fields = "__all__"

    ALLOWED_APPLICANT_EDIT_STATES = [
        ApplicationAlterationState.RECEIVED,
    ]

    ALLOWED_HANDLER_EDIT_STATES = [
        ApplicationAlterationState.RECEIVED,
        ApplicationAlterationState.OPENED,
    ]

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
        if data["use_alternate_einvoice_provider"] is True:
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
                                    "{field} must be filled if using an alternative e-invoice address"
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
                ValidationError(_("Alteration cannot start before first benefit day"))
            )
        if start_date > application.end_date:
            errors.append(
                ValidationError(_("Alteration cannot start after last benefit day"))
            )
        if end_date is not None:
            if end_date > application.end_date:
                errors.append(
                    ValidationError(_("Alteration cannot end after last benefit day"))
                )
            if start_date > end_date:
                errors.append(
                    ValidationError(
                        _("Alteration end date cannot be before start date")
                    )
                )

        return errors

    def _validate_date_range_overlaps(self, application, start_date, end_date):
        errors = []

        for alteration in application.alteration_set.all():
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
                    _("Another alteration already overlaps the alteration period")
                )
            )

        return errors

    def validate(self, data):
        merged_data = self._get_merged_object_for_validation(data)

        # Verify that the user is allowed to make the request
        user = get_request_user_from_context(self)
        request = self.context.get("request")

        application = merged_data["application"]

        if settings.NEXT_PUBLIC_MOCK_FLAG:
            if not (user and user.is_authenticated):
                user = get_user_model().objects.all().order_by("username").first()

        if not user.is_handler():
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
                    _("The alteration cannot be edited in this state")
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
                application, alteration_start_date, alteration_end_date
            )

        if len(errors) > 0:
            raise ValidationError(errors)

        return data
