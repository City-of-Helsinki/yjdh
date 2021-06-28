from django.conf import settings
from django.db import transaction
from requests.exceptions import HTTPError
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from shared.oidc.utils import get_organization_roles

from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.services import (
    get_or_create_company_from_ytj_api,
    get_or_create_company_with_name_and_business_id,
)
from companies.tests.data.company_data import DUMMY_COMPANY_DATA


class GetCompanyView(APIView):
    """
    API View to retrieve company info using the YTJ API integration.
    """

    @property
    def organization_roles_error(self):
        return Response(
            "Unable to fetch organization roles from eauthorizations API",
            status.HTTP_401_UNAUTHORIZED,
        )

    @property
    def ytj_response_error(self):
        return Response(
            "Could not handle the response from YTJ API",
            status.HTTP_404_NOT_FOUND,
        )

    @transaction.atomic
    def get_mock(self, request: Request, format: str = None) -> Response:
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
    def get(self, request: Request, format: str = None) -> Response:
        if settings.MOCK_FLAG:
            return self.get_mock(request, format)

        eauth_profile = request.user.oidc_profile.eauthorization_profile

        try:
            organization_roles = get_organization_roles(eauth_profile)
        except HTTPError:
            return self.organization_roles_error

        business_id = organization_roles.get("identifier")

        try:
            company = get_or_create_company_from_ytj_api(business_id)
        except ValueError:
            return self.ytj_response_error
        except HTTPError:
            name = organization_roles.get("name")
            company = get_or_create_company_with_name_and_business_id(name, business_id)

        company_data = CompanySerializer(company).data

        return Response(company_data)
