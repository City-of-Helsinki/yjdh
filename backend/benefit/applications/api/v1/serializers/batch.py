from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from applications.api.v1.status_transition_validator import (
    ApplicationBatchStatusValidator,
)
from applications.enums import ApplicationBatchStatus, ApplicationStatus
from applications.models import Application, ApplicationBatch


class ApplicationBatchSerializer(serializers.ModelSerializer):
    """
    Grouping of applications for batch processing.
    One Application can belong to at most one ApplicationBatch at a time.
    """

    status = serializers.ChoiceField(
        choices=ApplicationBatchStatus.choices,
        validators=[ApplicationBatchStatusValidator()],
        help_text="Status of the application, visible to the applicant",
    )

    applications = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=False,
        queryset=Application.objects.all(),
        help_text="Applications in this batch (read-only)",
    )

    proposal_for_decision = serializers.ChoiceField(
        choices=[ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
        help_text="Proposed decision for Ahjo",
    )

    class Meta:
        model = ApplicationBatch
        fields = [
            "id",
            "status",
            "applications",
            "proposal_for_decision",
            "decision_maker_title",
            "decision_maker_name",
            "section_of_the_law",
            "decision_date",
            "expert_inspector_name",
            "expert_inspector_email",
            "created_at",
        ]
        read_only_fields = [
            "created_at",
        ]
        extra_kwargs = {
            "decision_maker_title": {
                "help_text": "Title of the decision maker in Ahjo",
            },
            "decision_maker_name": {
                "help_text": "Nameof the decision maker in Ahjo",
            },
            "section_of_the_law": {
                "help_text": "Section of the law that the Ahjo decision is based on",
            },
            "decision_date": {
                "help_text": "Date of decision in Ahjo",
            },
            "expert_inspector_name": {
                "help_text": (
                    "The name of application handler at the city of Helsinki (for"
                    " Talpa)"
                ),
            },
            "expert_inspector_email": {
                "help_text": (
                    "The email of application handler at the city of Helsinki (for"
                    " Talpa)"
                ),
            },
        }

    @transaction.atomic
    def update(self, instance, validated_data):
        applications = validated_data.pop("applications", None)
        application_batch = super().update(instance, validated_data)
        if applications is not None:
            self._update_applications(application_batch, applications)
        return application_batch

    @transaction.atomic
    def create(self, validated_data):
        applications = validated_data.pop("applications", None)
        application_batch = super().create(validated_data)
        if applications is not None:
            self._update_applications(application_batch, applications)
        return application_batch

    def _update_applications(self, application_batch, applications):
        if {application.pk for application in application_batch.applications.all()} != {
            application.pk for application in applications
        }:
            if not application_batch.applications_can_be_modified:
                raise serializers.ValidationError(
                    {
                        "applications": _(
                            "Applications in a batch can not be changed when batch is"
                            " in this status"
                        )
                    }
                )

            for application in applications:
                if str(application.status) != str(
                    application_batch.proposal_for_decision
                ):
                    raise serializers.ValidationError(
                        {
                            "applications": _(
                                "This application has invalid status and can not be"
                                " added to this batch"
                            )
                        }
                    )

        application_batch.applications.set(applications)
