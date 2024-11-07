from django.core.exceptions import ValidationError
from rest_framework import serializers

from applications.enums import ApplicationStatus
from applications.models import AhjoDecisionProposalDraft


class AhjoDecisionProposalReadOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoDecisionProposalDraft
        fields = [
            "granted_as_de_minimis_aid",
            "status",
            "decision_text",
            "justification_text",
            "review_step",
            "log_entry_comment",
            "decision_maker_id",
            "decision_maker_name",
        ]


class AhjoDecisionProposalSerializer(serializers.ModelSerializer):
    """
    # TODO: Add description

    """

    class Meta:
        model = AhjoDecisionProposalDraft
        fields = [
            "granted_as_de_minimis_aid",
            "status",
            "decision_text",
            "justification_text",
            "review_step",
            "log_entry_comment",
            "decision_maker_id",
            "decision_maker_name",
        ]

    def validate(self, data):
        errors = []
        if data["review_step"] >= 2:
            if data.get("status", None) not in [
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
            ]:
                errors.append(
                    ValidationError("Pending for status must ACCEPTED or REJECTED")
                )
            if (
                data.get("status", None)
                in [
                    ApplicationStatus.ACCEPTED,
                ]
                and data.get("granted_as_de_minimis_aid", None) is None
            ):
                errors.append(
                    ValidationError("Granted as de minimis aid must be true or false")
                )
            if (
                data.get("status", None)
                in [
                    ApplicationStatus.REJECTED,
                ]
                and len(data.get("log_entry_comment") or "") == 0
            ):
                errors.append(ValidationError("Log entry comment cannot be empty"))

        if data["review_step"] >= 3:
            if (
                len(data.get("decision_text") or "") < 8
                or len(data.get("justification_text") or "") < 8
            ):
                errors.append(
                    ValidationError("Decision or justification texts cannot be empty")
                )
            if len(data.get("decision_maker_id", "None")) <= 0:
                errors.append(ValidationError("Decision maker id must be specified"))
        if len(errors) > 0:
            raise ValidationError(errors)

        return data
