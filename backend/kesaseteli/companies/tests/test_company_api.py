import copy
import re
from unittest import mock

import pytest
from django.conf import settings
from django.test import override_settings

from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.tests.data.company_data import (
    DUMMY_COMPANY_DATA,
    DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE,
    DUMMY_YTJ_RESPONSE,
)
from oidc.tests.factories import EAuthorizationProfileFactory, OIDCProfileFactory


def get_company_api_url():
    return "/v1/company/"


def set_up_mock_requests(
    ytj_response: dict, business_details_response: dict, requests_mock
):
    """Set up the mock responses."""
    business_id = ytj_response["results"][0]["businessId"]
    ytj_url = f"{settings.YTJ_BASE_URL}/{business_id}"
    business_details_url = ytj_response["results"][0]["bisDetailsUri"]

    requests_mock.get(ytj_url, json=ytj_response)
    requests_mock.get(business_details_url, json=business_details_response)


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True)
def test_get_mock_company(api_client):
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True)
def test_get_mock_company_not_found_from_ytj(api_client):
    api_client.credentials(HTTP_SESSION_ID="-1")
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200
    assert response.data["name"] == DUMMY_COMPANY_DATA["name"]
    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]

    for field in [
        f
        for f in Company._meta.fields
        if f.name not in ["id", "name", "business_id", "ytj_json"]
    ]:
        assert response.data[field.name] == ""


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
)
def test_get_company_organization_roles_error(api_client, requests_mock, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, text="Error", status_code=401)

    response = api_client.get(get_company_api_url())

    assert response.status_code == 401
    assert (
        response.data == "Unable to fetch organization roles from eauthorizations API"
    )


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com",
)
def test_get_company_from_ytj(api_client, requests_mock, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    set_up_mock_requests(
        DUMMY_YTJ_RESPONSE, DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE, requests_mock
    )

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.api.v1.views.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    company = Company.objects.first()
    company_data = CompanySerializer(company).data

    assert response.data == company_data
    assert (
        response.data["business_id"] == DUMMY_YTJ_RESPONSE["results"][0]["businessId"]
    )


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com",
)
def test_get_company_not_found_from_ytj(api_client, requests_mock, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    matcher = re.compile(settings.YTJ_BASE_URL)
    requests_mock.get(matcher, text="Error", status_code=404)

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.api.v1.views.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 200
    assert response.data["name"] == org_roles_json["name"]
    assert response.data["business_id"] == org_roles_json["identifier"]

    for field in [
        f
        for f in Company._meta.fields
        if f.name not in ["id", "name", "business_id", "ytj_json"]
    ]:
        assert response.data[field.name] == ""


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com",
)
def test_get_company_from_ytj_invalid_response(api_client, requests_mock, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    ytj_reponse = copy.deepcopy(DUMMY_YTJ_RESPONSE)
    ytj_reponse["results"][0]["addresses"] = []

    set_up_mock_requests(
        ytj_reponse, DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE, requests_mock
    )

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.api.v1.views.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 404
    assert response.data == "Could not handle the response from YTJ API"
