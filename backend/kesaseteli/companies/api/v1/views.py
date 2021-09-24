from django.db import transaction
from django.http import HttpRequest
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.api.v1.serializers import CompanySerializer
from companies.services import get_or_create_company_from_eauth_profile


class GetCompanyView(APIView):
    """
    API View to retrieve company info using the YTJ API integration.
    """

    @transaction.atomic
    def get(self, request: HttpRequest, format: str = None) -> Response:
        company = get_or_create_company_from_eauth_profile(
            request.user.oidc_profile.eauthorization_profile, request
        )

        company_data = CompanySerializer(company).data

        return Response(company_data)
