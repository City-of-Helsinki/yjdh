import logging

from django.conf import settings
from django.db import transaction
from django.http import HttpRequest
from django.utils.translation import gettext_lazy as __
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from requests.exceptions import HTTPError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView
from stdnum.fi import ytunnus

from common.permissions import BFIsAuthenticated, TermsOfServiceAccepted
from companies.api.v1.serializers import CompanySearchSerializer, CompanySerializer
from companies.models import Company
from companies.services import (
    get_or_create_organisation_with_business_id,
    search_organisations,
)
from companies.tests.data.company_data import get_dummy_company_data
from shared.oidc.utils import get_organization_roles

LOGGER = logging.getLogger(__name__)


class GetUsersOrganizationView(APIView):
    """API View to retrieve organization that the users belongs to."""

    permission_classes = [BFIsAuthenticated, TermsOfServiceAccepted]

    @property
    def ytj_api_error(self):
        return Response(
            __(
                "YTJ API is under heavy load or no company found with the given business id"
            ),
            status.HTTP_404_NOT_FOUND,
        )

    @property
    def organization_roles_error(self):
        return Response(
            __("Unable to fetch organization roles from eauthorizations API"),
            status.HTTP_401_UNAUTHORIZED,
        )

    def api_usage_http_error(self, message):
        return Response(message, status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def get_mock(self, request: HttpRequest, format: str = "") -> Response:
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
    def get(self, request: HttpRequest, format: str = "") -> Response:
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return self.get_mock(request, format)

        try:
            organization_roles = get_organization_roles(request)
        except HTTPError:
            return self.organization_roles_error

        business_id = organization_roles.get("identifier")
        if not business_id:
            return Response(
                "No business id found for the user",
                status.HTTP_404_NOT_FOUND,
            )
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
                __("Could not handle the response from Palveluväylä and YRTTI API"),
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        company_data = CompanySerializer(company).data

        return Response(company_data)


class SearchOrganisationsView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("name", OpenApiTypes.STR, OpenApiParameter.PATH),
        ],
        responses=CompanySearchSerializer(many=True),
        description="Search organisations",
    )
    @transaction.atomic
    def get(self, _: HttpRequest, name: str) -> Response:
        results = search_organisations(name)
        return Response(CompanySearchSerializer(results, many=True).data)


class GetOrganisationByIdView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("business_id", OpenApiTypes.STR, OpenApiParameter.PATH),
        ],
        responses=CompanySerializer,
        description="Get organisation by business id",
    )
    @transaction.atomic
    def get(self, _: HttpRequest, business_id: str) -> Response:
        if not ytunnus.is_valid(business_id):
            raise ValidationError(__("Social security number invalid"))
        company = get_or_create_organisation_with_business_id(business_id)
        return Response(CompanySerializer(company).data)
