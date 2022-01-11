import re
from copy import deepcopy

import pytest
from applications.tests.conftest import *  # noqa
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.tests.data.company_data import (
    DUMMY_SERVICE_BUS_RESPONSE,
    DUMMY_YRTTI_RESPONSE,
    get_dummy_company_data,
)
from django.conf import settings
from django.test import override_settings
from requests import HTTPError
from terms.tests.factories import TermsOfServiceApprovalFactory


def get_company_api_url(business_id=""):
    return "/v1/company/{id}".format(id=business_id)


def set_up_ytj_mock_requests(
    ytj_response: dict, business_details_response: dict, requests_mock
):
    """Set up the mock responses."""
    business_id = ytj_response["results"][0]["businessId"]
    ytj_url = f"{settings.YTJ_BASE_URL}/{business_id}"
    business_details_url = ytj_response["results"][0]["bisDetailsUri"]

    requests_mock.get(ytj_url, json=ytj_response)
    requests_mock.get(business_details_url, json=business_details_response)


@pytest.mark.django_db
def test_get_company_unauthenticated(anonymous_client):
    response = anonymous_client.get(get_company_api_url())
    # Unauthenticated user cannot query company
    assert response.status_code == 403


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_get_mock_company(api_client, mock_get_organisation_roles_and_create_company):
    response = api_client.get(get_company_api_url())

    assert response.status_code == 200

    assert response.data["business_id"] == get_dummy_company_data()["business_id"]


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
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
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_company_from_service_bus_invalid_response(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    response = deepcopy(DUMMY_SERVICE_BUS_RESPONSE)
    response["GetCompanyResult"]["Company"]["PostalAddress"] = {}

    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, json=response)
    response = api_client.get(get_company_api_url())

    assert response.status_code == 500
    assert (
        response.data == "Could not handle the response from Palveluväylä and YRTTI API"
    )


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_organisation_from_service_bus(
    api_client,
    bf_user,
    requests_mock,
    mock_get_organisation_roles_and_create_company,
):
    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, json=DUMMY_SERVICE_BUS_RESPONSE)
    response = api_client.get(get_company_api_url())
    assert response.status_code == 200

    company = Company.objects.get(
        business_id=DUMMY_SERVICE_BUS_RESPONSE["GetCompanyResult"]["Company"][
            "BusinessId"
        ]
    )
    company_data = CompanySerializer(company).data
    assert response.data == company_data


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_company_from_yrtti(
    api_client,
    bf_user,
    terms_of_service,
    requests_mock,
    mock_get_organisation_roles_and_create_association,
):
    TermsOfServiceApprovalFactory(
        user=bf_user,
        company=mock_get_organisation_roles_and_create_association,
        terms=terms_of_service,
    )
    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(settings.YRTTI_BASIC_INFO_PATH)
    requests_mock.post(matcher, json=DUMMY_YRTTI_RESPONSE)
    response = api_client.get(get_company_api_url())
    assert response.status_code == 200

    company = Company.objects.get(
        business_id=DUMMY_YRTTI_RESPONSE["BasicInfoResponse"]["BusinessId"]
    )
    company_data = CompanySerializer(company).data
    assert response.data == company_data


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_company_from_service_bus_and_yrtti_results_in_error(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(settings.YRTTI_BASIC_INFO_PATH)
    requests_mock.post(matcher, text="Error", status_code=404)
    # Delete company so that API cannot return object from DB
    mock_get_organisation_roles_and_create_company.delete()
    with pytest.raises(HTTPError):
        api_client.get(get_company_api_url())


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_company_from_service_bus_and_yrtti_with_fallback_data(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, json=DUMMY_SERVICE_BUS_RESPONSE)
    response = api_client.get(get_company_api_url())

    # First request to save Company to DB
    assert response.status_code == 200
    assert Company.objects.count() == 1

    # Now assuming request to YTJ & YRTTI doesn't return any data
    matcher = re.compile(settings.SERVICE_BUS_INFO_PATH)
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(settings.YRTTI_BASIC_INFO_PATH)
    requests_mock.post(matcher, text="Error", status_code=404)

    response = api_client.get(get_company_api_url())
    # Still be able to query company data
    assert response.data["business_id"] == get_dummy_company_data()["business_id"]
