from datetime import datetime
from companies.models import Company
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from terms.api.v1.serializers import (
    ApproveTermsSerializer,
    TermsOfServiceApprovalSerializer,
)
from terms.models import TermsOfServiceApproval
from users.utils import get_company_from_user


class ApproveTermsOfServiceView(APIView):
    @extend_schema(
        description=(
            (
                "Approve the terms of service"
                "Separate approval is needed for each current user+current company combination"
                "The terms and consents being approved must be the terms and consents in effect (see UserSerializer)"
            )
        )
    )
    def post(self, request):
        approve_terms = ApproveTermsSerializer(data=request.data)
        approve_terms.is_valid(
            raise_exception=True
        )  # validate the terms and applicant consents
        user = request.user
        company = get_company_from_user(user)
        if TermsOfServiceApproval.terms_approval_needed(user, company):
            if not approve_terms:
                raise serializers.ValidationError(
                    {"approve_terms": _("Terms must be approved")}
                )
            approval = TermsOfServiceApproval.objects.create(
                user=user,
                terms=approve_terms.validated_data["terms"],
                company=company,
                approved_at=datetime.now(),
                approved_by=user,
            )
            approval.selected_applicant_consents.set(
                approve_terms.validated_data["selected_applicant_consents"]
            )
            return Response(TermsOfServiceApprovalSerializer(approval).data)
        else:
            raise ValidationError(
                _("The terms of service should only be approved once")
            )
