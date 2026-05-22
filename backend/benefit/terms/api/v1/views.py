from azure.core.exceptions import ResourceNotFoundError
from django.conf import settings
from django.core.exceptions import SuspiciousFileOperation
from django.http import FileResponse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsApplicant, BFIsAuthenticated
from terms.api.v1.serializers import (
    ApproveTermsSerializer,
    TermsOfServiceApprovalSerializer,
)
from terms.models import Terms, TermsOfServiceApproval
from users.utils import get_company_from_request


class ApproveTermsOfServiceView(APIView):
    permission_classes = [BFIsApplicant]

    @extend_schema(
        description=(
            "Approve the terms of serviceSeparate approval is needed for each current"
            " user+current company combinationThe terms and consents being approved"
            " must be the terms and consents in effect (see UserSerializer)"
        )
    )
    def post(self, request):
        approve_terms = ApproveTermsSerializer(data=request.data)
        approve_terms.is_valid(
            raise_exception=True
        )  # validate the terms and applicant consents
        user = request.user

        company = get_company_from_request(request)
        if not company:
            raise PermissionDenied(
                detail=_(
                    "The user has no company, terms of service can not be accepted"
                )
            )
        if TermsOfServiceApproval.terms_approval_needed(user, company):
            if not approve_terms:
                raise serializers.ValidationError(
                    {"approve_terms": _("Terms must be approved")}
                )
            approval = TermsOfServiceApproval.objects.create(
                user=user,
                terms=approve_terms.validated_data["terms"],
                company=company,
                approved_at=timezone.now(),
                approved_by=user,
            )
            approval.selected_applicant_consents.set(
                approve_terms.validated_data["selected_applicant_consents"]
            )
            # Set the TOS approval flag to session
            request.session[settings.TERMS_OF_SERVICE_SESSION_KEY] = True
            request.session.save()
            return Response(
                TermsOfServiceApprovalSerializer(
                    approval, context={"request": request}
                ).data
            )
        else:
            raise ValidationError(
                _("The terms of service should only be approved once")
            )


class TermsPdfDownloadView(APIView):
    permission_classes = [BFIsAuthenticated]

    LANGUAGE_FIELD_MAP = {
        "fi": "terms_pdf_fi",
        "en": "terms_pdf_en",
        "sv": "terms_pdf_sv",
    }

    def get(self, request, terms_id, language):
        if language not in self.LANGUAGE_FIELD_MAP:
            return Response(
                {"detail": "Invalid language. Use fi, en or sv."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            terms = Terms.objects.get(pk=terms_id)
        except Terms.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        pdf_file = getattr(terms, self.LANGUAGE_FIELD_MAP[language])
        if not pdf_file:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            file_handle = pdf_file.open()
        except (SuspiciousFileOperation, OSError, ResourceNotFoundError):
            return Response(status=status.HTTP_404_NOT_FOUND)

        return FileResponse(file_handle, content_type="application/pdf")
