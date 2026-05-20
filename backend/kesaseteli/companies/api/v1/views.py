from django.conf import settings
from django.db import transaction
from django.http import HttpRequest
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.services import get_or_create_company_using_organization_roles
from companies.tests.data.company_data import DUMMY_COMPANY_DATA


class GetCompanyView(APIView):
    """
    Return the current company's YTJ-backed profile for the frontend.

    The view serves the public `/v1/company/` endpoint and can also return a
    deterministic mocked response in local and frontend test setups.
    """

    @transaction.atomic
    def get_mock(self, request: HttpRequest, format: str | None = None) -> Response:
        """Return the frontend test fixture instead of calling the YTJ API."""
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
    @extend_schema(responses=CompanySerializer)
    def get(self, request: HttpRequest, format: str | None = None) -> Response:
        """Return the company profile for the authenticated user."""
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return self.get_mock(request, format)

        company = get_or_create_company_using_organization_roles(request)

        company_data = CompanySerializer(company).data

        return Response(company_data)
