from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.decision_proposal import (
    AhjoDecisionProposalSerializer,
)
from applications.api.v1.serializers.decision_proposal_template import (
    DecisionProposalTemplateSectionSerializer,
)
from applications.api.v1.serializers.decision_text import DecisionTextSerializer
from applications.enums import ApplicationStatus, DecisionType
from applications.models import (
    AhjoDecisionProposalDraft,
    AhjoDecisionText,
    AhjoSetting,
    Application,
    ApplicationLogEntry,
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
                    pk=application_id,
                    status__in=[
                        ApplicationStatus.HANDLING,
                        ApplicationStatus.ACCEPTED,
                        ApplicationStatus.REJECTED,
                    ],
                )
                .prefetch_related("calculation", "company")
                .first()
            )
        except Application.DoesNotExist:
            return Response(
                {"message": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

        language = (
            application.applicant_language
            if application.applicant_language == "sv"
            else "fi"
        )
        decision_types = self.request.query_params.getlist("decision_type")

        template_sections = DecisionProposalTemplateSection.objects.filter(
            decision_type__in=decision_types, language=language
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


class DecisionProposalDraftUpdate(APIView):
    permission_classes = [BFIsHandler]

    @action(methods=["PATCH"], detail=False)
    def patch(self, request):
        app_id = request.data["application_id"]
        application = get_object_or_404(Application, id=app_id)

        (
            proposal_object,
            is_created,
        ) = AhjoDecisionProposalDraft.objects.get_or_create(  # noqa
            application=application
        )

        proposal = AhjoDecisionProposalSerializer(
            proposal_object, data=request.data, partial=True
        )

        if not proposal.is_valid():
            return Response(proposal.errors, status=status.HTTP_400_BAD_REQUEST)

        data = proposal.validated_data
        proposal.save()

        if data.get("decision_text") and data.get("justification_text"):
            decision_part = data.get("decision_text")
            justification_part = data.get("justification_text")
            ahjo_text = AhjoDecisionText.objects.filter(application=application)
            decision_text = f'<section id="paatos"><h1>{_("Päätös")}</h1>{decision_part}</section>\
<section id="paatoksenperustelut"><h1>{_("Päätöksen perustelut")}</h1>{justification_part}</section>'

            available_decision_makers = AhjoSetting.objects.get(
                name="ahjo_decision_maker"
            ).data

            decision_maker_id = request.data.get("decision_maker_id")
            decision_maker = next(
                (
                    item
                    for item in available_decision_makers
                    if item["ID"] == decision_maker_id
                ),
                None,
            )

            if decision_maker is None:
                decision_maker = {"ID": None, "Name": None}

            if ahjo_text:
                ahjo_text.update(
                    language=application.applicant_language,
                    decision_type=(
                        DecisionType.ACCEPTED
                        if data["status"] == ApplicationStatus.ACCEPTED
                        else DecisionType.DENIED
                    ),
                    decision_text=decision_text,
                    decision_maker_id=decision_maker["ID"],
                    decision_maker_name=decision_maker["Name"],
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
                    decision_text=decision_text,
                    decision_maker_id=decision_maker["ID"],
                    decision_maker_name=decision_maker["Name"],
                )

        if data["review_step"] >= 4:
            # Ensure frontend has a page that exists
            proposal.review_step = 3
            proposal.save()

            ApplicationLogEntry.objects.create(
                application=application,
                from_status=application.status,
                to_status=data["status"],
                comment=data.get("log_entry_comment") or "",
            )
            application.status = data.get("status")

            application.save()

            application.calculation.granted_as_de_minimis_aid = data[
                "granted_as_de_minimis_aid"
            ]
            application.calculation.save()

        return Response(proposal.data, status=status.HTTP_200_OK)
