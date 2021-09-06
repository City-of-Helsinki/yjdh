import re

import pytest
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.tests.data.company_data import (
    DUMMY_COMPANY_DATA,
    DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE,
    DUMMY_YTJ_RESPONSE,
)
from django.conf import settings
from django.test import override_settings


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
def test_get_mock_company(api_client, mock_get_organisation_roles_and_create_company):
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True)
def test_get_mock_company_results_in_error(
    api_client, mock_get_organisation_roles_and_create_company
):
    api_client.credentials(HTTP_SESSION_ID="-1")
    response = api_client.get(get_company_api_url())

    assert response.status_code == 404
    assert (
        response.data
        == "YTJ API is under heavy load or no company found with the given business id"
    )


@pytest.mark.django_db
@override_settings(MOCK_FLAG=False)
def test_get_company_from_ytj(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    set_up_mock_requests(
        DUMMY_YTJ_RESPONSE, DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE, requests_mock
    )
    response = api_client.get(get_company_api_url())
    assert response.status_code == 200

    company = Company.objects.first()
    company_data = CompanySerializer(company).data

    assert response.data == company_data
    assert (
        response.data["business_id"] == DUMMY_YTJ_RESPONSE["results"][0]["businessId"]
    )


@pytest.mark.django_db
@override_settings(MOCK_FLAG=False)
def test_get_company_from_ytj_results_in_error(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    matcher = re.compile(settings.YTJ_BASE_URL)
    requests_mock.get(matcher, text="Error", status_code=404)
    # Delete company so that API cannot return object from DB
    mock_get_organisation_roles_and_create_company.delete()
    response = api_client.get(get_company_api_url())

    assert response.status_code == 404
    assert (
        response.data
        == "YTJ API is under heavy load or no company found with the given business id"
    )


@pytest.mark.django_db
@override_settings(MOCK_FLAG=False)
def test_get_company_from_ytj_with_fallback_data(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    set_up_mock_requests(
        DUMMY_YTJ_RESPONSE, DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE, requests_mock
    )
    response = api_client.get(get_company_api_url())

    # First request to save Company to DB
    assert response.status_code == 200
    assert Company.objects.count() == 1

    # Now assuming request to YTJ doesn't return any data
    matcher = re.compile(settings.YTJ_BASE_URL)
    requests_mock.get(matcher, text="Error", status_code=404)

    response = api_client.get(get_company_api_url())
    # Still be able to query company data
    assert response.data["business_id"] == DUMMY_COMPANY_DATA["business_id"]


@pytest.mark.django_db
@override_settings(MOCK_FLAG=False)
def test_get_company_from_ytj_invalid_response(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    response = DUMMY_YTJ_RESPONSE
    response["results"][0]["addresses"] = []

    set_up_mock_requests(response, DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE, requests_mock)
    response = api_client.get(get_company_api_url())

    assert response.status_code == 500
    assert response.data == "Could not handle the response from YTJ API"
