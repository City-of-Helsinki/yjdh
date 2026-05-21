import re
from copy import deepcopy
from unittest.mock import patch

import pytest
from django.conf import settings
from django.test import override_settings
from requests import HTTPError

from applications.tests.conftest import *  # noqa
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from companies.tests.data.company_data import (
    DUMMY_SERVICE_BUS_RESPONSE,
    DUMMY_YRTTI_RESPONSE,
    get_dummy_company_data,
)
from shared.service_bus.enums import YtjOrganizationCode
from terms.tests.factories import TermsOfServiceApprovalFactory

SERVICE_BUS_INFO_PATH = f"{settings.SERVICE_BUS_BASE_URL}/GetCompany"
YRTTI_BASIC_INFO_PATH = f"{settings.YRTTI_BASE_URL}/BasicInfo"


def get_company_api_url(business_id=""):
    url = "/v1/company/"
    if business_id:
        url = f"{url}get/{business_id}/"
    return url


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
def test_get_company_from_service_bus_invalid_response(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    business_id = DUMMY_SERVICE_BUS_RESPONSE["GetCompanyResult"]["Company"][
        "BusinessId"
    ]
    response = deepcopy(DUMMY_SERVICE_BUS_RESPONSE)
    response["GetCompanyResult"]["Company"] = {}

    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, json=response)
    response = api_client.get(get_company_api_url(business_id))

    assert response.status_code == 500
    assert (
        response.data["detail"]
        == "Could not handle the response from Palveluväylä and YRTTI API"
    )


@pytest.mark.django_db
def test_get_organisation_from_service_bus(
    api_client,
    bf_user,
    requests_mock,
    mock_get_organisation_roles_and_create_company,
):
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, json=DUMMY_SERVICE_BUS_RESPONSE)
    business_id = DUMMY_SERVICE_BUS_RESPONSE["GetCompanyResult"]["Company"][
        "BusinessId"
    ]
    response = api_client.get(get_company_api_url(business_id))
    assert response.status_code == 200

    company = Company.objects.get(business_id=business_id)
    company_data = CompanySerializer(company).data
    assert response.data == company_data
    assert (
        response.data["company_form_code"]
        == YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT
    )
    assert response.data["company_form"] == "Osakeyhtiö"


@pytest.mark.django_db
def test_get_organisation_from_service_bus_missing_business_line(
    api_client,
    bf_user,
    requests_mock,
    mock_get_organisation_roles_and_create_company,
):
    dummy_copy = deepcopy(DUMMY_SERVICE_BUS_RESPONSE)
    dummy_copy["GetCompanyResult"]["Company"]["BusinessLine"] = None
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, json=dummy_copy)
    response = api_client.get(get_company_api_url())
    assert response.status_code == 200

    company = Company.objects.get(
        business_id=DUMMY_SERVICE_BUS_RESPONSE["GetCompanyResult"]["Company"][
            "BusinessId"
        ]
    )
    company_data = CompanySerializer(company).data
    assert response.data == company_data
    assert (
        response.data["company_form_code"]
        == YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT
    )
    assert response.data["company_form"] == "Osakeyhtiö"


@pytest.mark.django_db
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
    business_id = DUMMY_YRTTI_RESPONSE["BasicInfoResponse"]["BusinessId"]
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(re.escape(YRTTI_BASIC_INFO_PATH))
    requests_mock.post(matcher, json=DUMMY_YRTTI_RESPONSE)
    response = api_client.get(get_company_api_url(business_id))
    assert response.status_code == 200

    company = Company.objects.get(business_id=business_id)
    company_data = CompanySerializer(company).data
    assert response.data == company_data
    assert (
        response.data["company_form_code"]
        == YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT
    )
    assert (
        response.data["company_form"]
        == YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT.label
    )


@pytest.mark.django_db
def test_get_company_from_service_bus_and_yrtti_results_in_error(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(re.escape(YRTTI_BASIC_INFO_PATH))
    requests_mock.post(matcher, text="Error", status_code=404)
    # Delete company so that API cannot return object from DB
    mock_get_organisation_roles_and_create_company.delete()
    with pytest.raises(HTTPError):
        api_client.get(get_company_api_url())


@pytest.mark.django_db
def test_get_company_from_service_bus_and_yrtti_with_fallback_data(
    api_client, requests_mock, mock_get_organisation_roles_and_create_company
):
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, json=DUMMY_SERVICE_BUS_RESPONSE)
    response = api_client.get(get_company_api_url())

    # First request to save Company to DB
    assert response.status_code == 200
    assert Company.objects.count() == 1

    # Now assuming request to YTJ & YRTTI doesn't return any data
    matcher = re.compile(re.escape(SERVICE_BUS_INFO_PATH))
    requests_mock.post(matcher, text="Error", status_code=404)
    matcher = re.compile(re.escape(YRTTI_BASIC_INFO_PATH))
    requests_mock.post(matcher, text="Error", status_code=404)

    response = api_client.get(get_company_api_url())
    # Still be able to query company data
    assert response.data["business_id"] == get_dummy_company_data()["business_id"]
    assert (
        response.data["company_form_code"]
        == YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT
    )
    assert response.data["company_form"] == "Osakeyhtiö"


# ── UpdateCompanyIndustryCodeView ──────────────────────────────────────────────


def get_industry_code_url(company_id):
    return f"/v1/company/{company_id}/industry_code/"


@pytest.mark.django_db
def test_update_industry_code_success(handler_api_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = handler_api_client.patch(
        url,
        {"industry_code": "62010", "industry": "Computer programming"},
        format="json",
    )
    assert response.status_code == 200
    company.refresh_from_db()
    assert company.industry_code == "62010"
    assert company.industry == "Computer programming"


@pytest.mark.django_db
def test_update_industry_code_missing_field(handler_api_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = handler_api_client.patch(url, {"industry_code": ""}, format="json")
    assert response.status_code == 400
    assert "industry_code" in response.data


@pytest.mark.django_db
def test_update_industry_code_company_not_found(handler_api_client):
    import uuid

    url = get_industry_code_url(uuid.uuid4())
    response = handler_api_client.patch(url, {"industry_code": "62010"}, format="json")
    assert response.status_code == 404


@pytest.mark.django_db
def test_update_industry_code_unauthenticated(anonymous_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = anonymous_client.patch(url, {"industry_code": "62010"}, format="json")
    assert response.status_code == 403


@pytest.mark.django_db
def test_update_industry_code_non_handler_forbidden(api_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = api_client.patch(url, {"industry_code": "62010"}, format="json")
    assert response.status_code == 403


@pytest.mark.django_db
def test_update_industry_code_too_long(handler_api_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = handler_api_client.patch(url, {"industry_code": "X" * 11}, format="json")
    assert response.status_code == 400
    assert "industry_code" in response.data


@pytest.mark.django_db
def test_update_industry_too_long(handler_api_client):
    from companies.tests.factories import CompanyFactory

    company = CompanyFactory()
    url = get_industry_code_url(company.pk)
    response = handler_api_client.patch(
        url, {"industry_code": "62010", "industry": "A" * 256}, format="json"
    )
    assert response.status_code == 400
    assert "industry" in response.data


# ── SearchOrganisationsView ────────────────────────────────────────────────────


def get_search_url(name):
    return f"/v1/company/search/{name}/"


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_search_organisations_mock(api_client):
    response = api_client.get(get_search_url("test"))
    assert response.status_code == 200
    assert isinstance(response.data, list)


@pytest.mark.django_db
def test_search_organisations_live(api_client):
    mock_results = [
        {"name": "Acme Oy", "business_id": "1234567-8"},
        {"name": "Beta Oy", "business_id": "8765432-1"},
    ]
    with patch("companies.services.ServiceBusClient") as mock_sb_cls:
        mock_sb_cls.return_value.search_companies.return_value = mock_results
        with patch("companies.services.YRTTIClient") as mock_yrtti_cls:
            mock_yrtti_cls.return_value.search_associations.return_value = []
            response = api_client.get(get_search_url("Acme"))
    assert response.status_code == 200
    assert len(response.data) == 2
    business_ids = {item["business_id"] for item in response.data}
    assert "1234567-8" in business_ids


# ── GetOrganisationByIdView ────────────────────────────────────────────────────


def get_organisation_by_id_url(business_id):
    return f"/v1/company/get/{business_id}/"


@pytest.mark.django_db
def test_get_organisation_by_id_invalid_business_id(api_client):
    response = api_client.get(get_organisation_by_id_url("invalid-id"))
    assert response.status_code == 400


@pytest.mark.django_db
def test_get_organisation_by_id_valid(api_client):
    from companies.tests.factories import CompanyFactory

    business_id = DUMMY_SERVICE_BUS_RESPONSE["GetCompanyResult"]["Company"][
        "BusinessId"
    ]
    company = CompanyFactory(business_id=business_id)
    with patch(
        "companies.api.v1.views.get_or_create_organisation_with_business_id",
        return_value=company,
    ):
        response = api_client.get(get_organisation_by_id_url(business_id))
    assert response.status_code == 200
    assert response.data["business_id"] == business_id
