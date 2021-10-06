from django.conf import settings
from django.db import transaction
from django.http import HttpRequest
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.services import get_or_create_company_from_eauth_profile
from companies.tests.data.company_data import DUMMY_COMPANY_DATA


class GetCompanyView(APIView):
    """
    API View to retrieve company info using the YTJ API integration.
    """

    @transaction.atomic
    def get_mock(self, request: HttpRequest, format: str = None) -> Response:
        # This mocked get method will be used for testing purposes for the frontend.
        session_id = request.META.get("HTTP_SESSION_ID")
        if session_id == "-1":
            company = Company(
                name=DUMMY_COMPANY_DATA["name"],
                business_id=DUMMY_COMPANY_DATA["business_id"],
            )
            company_data = CompanySerializer(company).data
        else:
            company = Company(**DUMMY_COMPANY_DATA)
            company_data = CompanySerializer(company).data

        return Response(company_data)

    @transaction.atomic
    def get(self, request: HttpRequest, format: str = None) -> Response:
        if settings.MOCK_FLAG:
            return self.get_mock(request, format)

        company = get_or_create_company_from_eauth_profile(
            request.user.oidc_profile.eauthorization_profile, request
        )

        company_data = CompanySerializer(company).data

        return Response(company_data)
