from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from applications.api.v1.serializers.decision_proposal import (
    AhjoDecisionProposalReadOnlySerializer,
    AhjoDecisionProposalSerializer,
)
from applications.enums import ApplicationStatus, DecisionType
from applications.models import AhjoDecisionProposalDraft, AhjoDecisionText, Application
from common.permissions import BFIsHandler


class AhjoDecisionProposalDraftFilter(filters.FilterSet):
    class Meta:
        model = AhjoDecisionProposalDraft
        fields = {
            "status": ["exact"],
        }


@extend_schema(
    description=(
        "API for create/read/update/delete/export operations on Helsinki benefit"
        " application batches"
    )
)
class AhjoDecisionProposalDraftViewSet(viewsets.ViewSet):
    queryset = AhjoDecisionProposalDraft.objects.all()
    serializer_class = AhjoDecisionProposalSerializer
    permission_classes = [BFIsHandler]
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    filterset_class = AhjoDecisionProposalDraftFilter

    def get_queryset(self):
        order_by = self.request.query_params.get("order_by") or None

        if order_by:
            self.queryset = self.queryset.order_by(order_by)

        return self.queryset

    def get_serializer_class(self):
        """
        ApplicationBatchSerializer for default behaviour on mutation functions,
        ApplicationBatchListSerializer for listing applications on a batch
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return AhjoDecisionProposalReadOnlySerializer

        return AhjoDecisionProposalSerializer

    @action(methods=["PATCH"], detail=False)
    @transaction.atomic
    def modify(self, request, pk=None):
        """
        Override default destroy(), batch can only be deleted if it's status is "draft"
        """
        app_id = request.data["application_id"]
        application = get_object_or_404(Application, id=app_id)

        proposal_object = AhjoDecisionProposalDraft.objects.filter(
            application=application
        ).first()

        proposal = AhjoDecisionProposalSerializer(
            proposal_object, data=request.data, partial=True
        )

        if not proposal.is_valid():
            return Response(proposal.errors, status=status.HTTP_400_BAD_REQUEST)

        data = proposal.validated_data
        proposal.save()

        if data.get("decision_text") and data.get("justification_text"):
            ahjo_text = AhjoDecisionText.objects.filter(application=application)
            if ahjo_text:
                ahjo_text.update(
                    language=application.applicant_language,
                    decision_type=(
                        DecisionType.ACCEPTED
                        if data["status"] == ApplicationStatus.ACCEPTED
                        else DecisionType.DENIED
                    ),
                    decision_text=data["decision_text"]
                    + "\n\n"
                    + data["justification_text"],
                    decision_maker_id=data["decision_maker_id"],
                    decision_maker_name=data["decision_maker_name"],
                )
            else:
                AhjoDecisionText.objects.create(
                    application=application,
                    language=application.applicant_language,
                    decision_type=(
                        DecisionType.ACCEPTED
                        if data["status"] == ApplicationStatus.ACCEPTED
                        else DecisionType.DENIED
                    ),
                    decision_text=data["decision_text"]
                    + "\n\n"
                    + data["justification_text"],
                    decision_maker_id=data["decision_maker_id"],
                    decision_maker_name=data["decision_maker_name"],
                )

        if data["review_step"] >= 4:
            # Ensure GUI has a page that exists
            proposal.review_step = 3
            proposal.save()

            application.status = data["status"]
            application.save()

            application.calculation.granted_as_de_minimis_aid = data[
                "granted_as_de_minimis_aid"
            ]
            application.calculation.save()

        return Response(proposal.data, status=status.HTTP_200_OK)
