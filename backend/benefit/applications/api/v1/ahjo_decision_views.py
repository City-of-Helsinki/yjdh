from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.decision_proposal_template import (
    DecisionProposalTemplateSectionSerializer,
)
from applications.enums import ApplicationStatus
from applications.models import Application, DecisionProposalTemplateSection
from applications.services.ahjo_decision_service import process_template_sections
from common.permissions import BFIsHandler


class DecisionProposalTemplateSectionList(APIView):
    """
    View to list the decision proposal templates with placeholders replaced by actual application data.
    * Only handlers are able to access this view.
    """

    permission_classes = [BFIsHandler]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uuid",
                description="UUID of the application",
                required=True,
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
            ),
        ],
        description=("API for querying decision proposal templates"),
        request=DecisionProposalTemplateSectionSerializer,
    )
    def get(self, request, format=None) -> Response:
        application_id = self.request.query_params.get("application_id")
        try:
            application = (
                Application.objects.filter(
                    pk=application_id, status=ApplicationStatus.ACCEPTED
                )
                .prefetch_related("calculation", "company")
                .first()
            )
        except Application.DoesNotExist:
            return Response(
                {"message": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

        decision_types = self.request.query_params.getlist("decision_type")

        section_types = self.request.query_params.getlist("section_type")
        template_sections = DecisionProposalTemplateSection.objects.filter(
            section_type__in=section_types, decision_type__in=decision_types
        )

        replaced_template_sections = process_template_sections(
            template_sections, application
        )

        serializer = DecisionProposalTemplateSectionSerializer(
            replaced_template_sections, many=True
        )

        return Response(serializer.data)
