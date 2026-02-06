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
    DUMMY_YTJ_RESPONSE,
)


def get_company_api_url():
    return "/v1/company/"


def set_up_mock_requests(ytj_response: dict, requests_mock):
    """
    Set up the mock responses.
    """
    requests_mock.get(f"{settings.YTJ_BASE_URL}/companies", json=ytj_response)


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_get_mock_company(api_client):
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_get_mock_company_not_found_from_ytj(api_client):
    api_client.credentials(HTTP_SESSION_ID="-1")
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200
    assert response.data["name"] == DUMMY_COMPANY_DATA["name"]
    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]

    for field in [
        f
        for f in Company._meta.fields
        if f.name
        not in ["id", "name", "business_id", "ytj_json", "created_at", "modified_at"]
    ]:
        assert response.data.get(field.name, "") == ""


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
)
def test_get_company_organization_roles_error(api_client, requests_mock, user, caplog):
    session = api_client.session
    session.pop("organization_roles")
    session.save()

    matcher = re.compile(re.escape(settings.EAUTHORIZATIONS_BASE_URL))
    requests_mock.get(matcher, text="Error", status_code=401)

    response = api_client.get(get_company_api_url())

    assert response.status_code == 404
    assert (
        response.data["detail"]
        == "Unable to fetch organization roles from eauthorizations API"
    )
    assert "Unable to fetch organization roles from eauthorizations API" in caplog.text


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com/v3",
)
def test_get_company_from_ytj(api_client, requests_mock):
    session = api_client.session
    session.pop("organization_roles")
    session.save()

    Company.objects.all().delete()

    set_up_mock_requests(DUMMY_YTJ_RESPONSE, requests_mock)

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.services.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    company = Company.objects.first()
    company_data = CompanySerializer(company).data

    assert response.data == company_data
    assert (
        response.data["business_id"]
        == DUMMY_YTJ_RESPONSE["companies"][0]["businessId"]["value"]
    )
    for field in ["company_form", "industry", "street_address", "postcode", "city"]:
        assert response.data[field]


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com/v3",
)
def test_get_company_not_found_from_ytj(api_client, requests_mock, user):
    matcher = re.compile(re.escape(settings.YTJ_BASE_URL))
    requests_mock.get(matcher, text="Error", status_code=404)

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.services.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 200
    assert response.data["name"] == org_roles_json["name"]
    assert response.data["business_id"] == org_roles_json["identifier"]

    for field in [
        f
        for f in Company._meta.fields
        if f.name
        not in ["id", "name", "business_id", "ytj_json", "created_at", "modified_at"]
    ]:
        assert response.data.get(field.name, "") == ""


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    YTJ_BASE_URL="http://example.com/v3",
)
def test_get_company_from_ytj_invalid_response(api_client, requests_mock, user, caplog):
    ytj_reponse = copy.deepcopy(DUMMY_YTJ_RESPONSE)
    # Simulate invalid data: empty companies list or no addresses
    ytj_reponse["companies"][0]["addresses"] = []

    set_up_mock_requests(ytj_reponse, requests_mock)

    org_roles_json = {
        "name": "Activenakusteri Oy",
        "identifier": "0877830-0",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.services.get_organization_roles", return_value=org_roles_json
    ):
        response = api_client.get(get_company_api_url())

    assert response.status_code == 200
    assert response.data["name"] == org_roles_json["name"]
    assert response.data["business_id"] == org_roles_json["identifier"]
    assert "YTJ API parsing error for business_id" in caplog.text

    for field in [
        f
        for f in Company._meta.fields
        if f.name
        not in ["id", "name", "business_id", "ytj_json", "created_at", "modified_at"]
    ]:
        assert response.data.get(field.name, "") == ""
