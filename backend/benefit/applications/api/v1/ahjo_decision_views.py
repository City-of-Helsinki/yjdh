from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.decision_proposal_template import (
    DecisionProposalTemplateSectionSerializer,
)
from applications.api.v1.serializers.decision_text import DecisionTextSerializer
from applications.enums import ApplicationStatus
from applications.models import (
    AhjoDecisionText,
    Application,
    DecisionProposalTemplateSection,
)
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


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="application_id",
            description="UUID of the application",
            required=True,
            type=OpenApiTypes.UUID,
            location=OpenApiParameter.PATH,
        ),
    ],
    description=(
        "API for listing and creating decision texts. Only handlers are able to access this view."
    ),
    request=DecisionTextSerializer,
)
class DecisionTextList(APIView):
    permission_classes = [BFIsHandler]

    def get(self, request, application_id):
        decision_text = AhjoDecisionText.objects.get(application_id=application_id)
        serializer = DecisionTextSerializer(decision_text, many=False)
        return Response(serializer.data)

    def post(self, request, application_id):
        application = get_object_or_404(Application, pk=application_id)

        serializer = DecisionTextSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(application_id=application.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="application_id",
            description="UUID of the application",
            required=True,
            type=OpenApiTypes.UUID,
            location=OpenApiParameter.PATH,
        ),
    ],
    description=(
        "API for updating decision texts. Only handlers are able to access this view."
    ),
    request=DecisionTextSerializer,
)
class DecisionTextDetail(APIView):
    permission_classes = [BFIsHandler]

    def put(self, request, application_id, decision_id):
        decision_text = get_object_or_404(AhjoDecisionText, pk=decision_id)
        serializer = DecisionTextSerializer(decision_text, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
