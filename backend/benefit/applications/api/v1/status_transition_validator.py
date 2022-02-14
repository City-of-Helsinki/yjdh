from applications.enums import ApplicationBatchStatus, ApplicationStatus
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers


class StatusTransitionValidator:
    requires_context = True
    initial_status = None

    def get_current_status(self, serializer_field):
        if obj := serializer_field.parent.instance:
            return obj.status
        else:
            return None

    def __call__(self, value, serializer_field):
        if status := self.get_current_status(serializer_field):
            # In case it's an update operation, validate with the current status in database
            if value != status and value not in self.STATUS_TRANSITIONS[status]:
                raise serializers.ValidationError(
                    format_lazy(
                        _("State transition not allowed: {status} to {value}"),
                        status=status,
                        value=value,
                    )
                )
        else:
            if value != self.initial_status:
                raise serializers.ValidationError(
                    format_lazy(
                        _("Initial status must be {initial_status}"),
                        initial_status=self.initial_status,
                    )
                )

        return value


class BaseApplicationStatusValidator(StatusTransitionValidator):
    initial_status = ApplicationStatus.DRAFT
    SUBMIT_APPLICATION_STATE_TRANSITIONS = [
        (
            ApplicationStatus.DRAFT,
            ApplicationStatus.RECEIVED,
        ),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, ApplicationStatus.HANDLING),
    ]


class ApplicantApplicationStatusValidator(BaseApplicationStatusValidator):
    STATUS_TRANSITIONS = {
        ApplicationStatus.DRAFT: (ApplicationStatus.RECEIVED,),
        ApplicationStatus.RECEIVED: (),
        ApplicationStatus.HANDLING: (),
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED: (ApplicationStatus.HANDLING,),
        ApplicationStatus.CANCELLED: (),
        ApplicationStatus.ACCEPTED: (),
        ApplicationStatus.REJECTED: (),
    }


class HandlerApplicationStatusValidator(BaseApplicationStatusValidator):
    STATUS_TRANSITIONS = {
        ApplicationStatus.DRAFT: (ApplicationStatus.RECEIVED,),
        ApplicationStatus.RECEIVED: (
            ApplicationStatus.HANDLING,
            ApplicationStatus.CANCELLED,
        ),
        ApplicationStatus.HANDLING: (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.CANCELLED,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
        ),
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED: (
            ApplicationStatus.HANDLING,
            ApplicationStatus.CANCELLED,
        ),
        ApplicationStatus.CANCELLED: (),
        ApplicationStatus.ACCEPTED: (ApplicationStatus.HANDLING,),
        ApplicationStatus.REJECTED: (ApplicationStatus.HANDLING,),
    }

    ASSIGN_HANDLER_STATUSES = [
        ApplicationStatus.HANDLING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.CANCELLED,
    ]


class ApplicationBatchStatusValidator(StatusTransitionValidator):
    initial_status = ApplicationBatchStatus.DRAFT

    STATUS_TRANSITIONS = {
        ApplicationBatchStatus.DRAFT: (ApplicationBatchStatus.AHJO_REPORT_CREATED,),
        ApplicationBatchStatus.AHJO_REPORT_CREATED: (
            ApplicationBatchStatus.AWAITING_AHJO_DECISION
        ),
        ApplicationBatchStatus.AWAITING_AHJO_DECISION: (
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
            ApplicationBatchStatus.RETURNED,
        ),
        ApplicationBatchStatus.DECIDED_ACCEPTED: (
            ApplicationBatchStatus.SENT_TO_TALPA,
        ),
        ApplicationBatchStatus.RETURNED: (ApplicationBatchStatus.DRAFT,),
        ApplicationBatchStatus.DECIDED_REJECTED: (),
        ApplicationBatchStatus.SENT_TO_TALPA: (ApplicationBatchStatus.COMPLETED,),
        ApplicationBatchStatus.COMPLETED: (),
    }
