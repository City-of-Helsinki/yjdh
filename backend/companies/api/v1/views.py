from django.conf import settings
from django.db import transaction
from requests.exceptions import HTTPError
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.services import get_or_create_company_with_business_id
from companies.tests.data.company_data import DUMMY_COMPANY_DATA


class GetCompanyView(APIView):
    """
    API View to retrieve company info using the YTJ API integration.
    """

    @property
    def ytj_api_error(self):
        return Response(
            "YTJ API is under heavy load or no company found with the given business id",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    @transaction.atomic
    def get_mock(self, request: Request, format: str = None) -> Response:
        # This mocked get method will be used for testing purposes for the frontend.
        session_id = request.META.get("HTTP_SESSION_ID")
        if session_id == "-1":
            return self.ytj_api_error

        company = Company(**DUMMY_COMPANY_DATA)
        company_data = CompanySerializer(company).data

        return Response(company_data)

    @transaction.atomic
    def get(self, request: Request, format: str = None) -> Response:
        if settings.MOCK_FLAG:
            return self.get_mock(request, format)
        try:
            # TODO: the actual implementation
            # This implementation is just for demonstrating the integration
            business_id = request.META.get("HTTP_BUSINESS_ID") or "0877830-0"
            company = get_or_create_company_with_business_id(business_id)
        except HTTPError:
            return self.ytj_api_error
        except ValueError:
            return Response(
                "Could not handle the response from YTJ API",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        company_data = CompanySerializer(company).data

        return Response(company_data)
