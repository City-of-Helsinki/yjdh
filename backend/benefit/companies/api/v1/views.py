import logging

from django.conf import settings
from django.db import transaction
from django.http import HttpRequest
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from requests.exceptions import HTTPError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsAuthenticated, TermsOfServiceAccepted
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.services import get_or_create_organisation_with_business_id
from companies.tests.data.company_data import get_dummy_company_data
from shared.oidc.utils import get_organization_roles

LOGGER = logging.getLogger(__name__)


class GetCompanyView(APIView):
    """
    API View to retrieve company info using the YTJ API integration.
    """

    permission_classes = [BFIsAuthenticated, TermsOfServiceAccepted]

    @property
    def ytj_api_error(self):
        return Response(
            "YTJ API is under heavy load or no company found with the given business id",
            status.HTTP_404_NOT_FOUND,
        )

    @property
    def organization_roles_error(self):
        return Response(
            "Unable to fetch organization roles from eauthorizations API",
            status.HTTP_401_UNAUTHORIZED,
        )

    def api_usage_http_error(self, message):
        return Response(message, status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def get_mock(self, request: HttpRequest, format: str = None) -> Response:
        # This mocked get method will be used for testing purposes for the frontend.
        # If the dummy company does not already exist in the database, create it,
        # so that the validation logic in the API works.
        session_id = request.META.get("HTTP_SESSION_ID")
        if session_id == "-1":
            return self.ytj_api_error

        dummy_data = get_dummy_company_data()
        dummy_company = Company.objects.filter(
            business_id=dummy_data["business_id"]
        ).first()
        if not dummy_company:
            del dummy_data["id"]
            dummy_company = Company(**dummy_data)
            dummy_company.save()
        company_data = CompanySerializer(dummy_company).data

        return Response(company_data)

    @extend_schema(
        parameters=[
            OpenApiParameter("business_id", OpenApiTypes.STR, OpenApiParameter.PATH),
        ],
        responses=CompanySerializer,
        description="Retrieve company information from YTJ/other API",
    )
    @transaction.atomic
    def get(self, request: HttpRequest, format: str = None) -> Response:
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return self.get_mock(request, format)

        if settings.DISABLE_AUTHENTICATION:
            company = Company.objects.all().order_by("name").first()
        else:
            try:
                organization_roles = get_organization_roles(request)
            except HTTPError:
                return self.organization_roles_error

            business_id = organization_roles.get("identifier")
            try:
                company = get_or_create_organisation_with_business_id(business_id)
            except HTTPError:
                # Since YTJ public API is not 100% reliable, we can use the Company data
                # saved in our DB as a fallback data, this Company data should be the
                # data that we got from the latest request to YTJ
                try:
                    company = Company.objects.get(business_id=business_id)
                except Company.DoesNotExist:
                    # Throw error if API failed or no object found in both places
                    return self.ytj_api_error
            except (ValueError, KeyError) as err:
                LOGGER.debug(
                    "Could not handle the response from Palveluväylä and YRTTI API, error: {}".format(
                        err
                    )
                )
                return Response(
                    "Could not handle the response from Palveluväylä and YRTTI API",
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        company_data = CompanySerializer(company).data

        return Response(company_data)
