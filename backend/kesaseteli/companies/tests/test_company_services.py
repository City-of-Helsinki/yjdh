import re
from unittest import mock

import pytest
from django.test import override_settings, RequestFactory

from applications.api.v1.serializers import EmployerApplicationSerializer
from applications.enums import EmployerApplicationStatus, OrganizationType
from common.tests.factories import EmployerApplicationFactory
from companies.models import Company
from companies.services import (
    get_or_create_company_using_company_data,
    get_or_create_company_using_organization_roles,
    resolve_organization_type,
    update_company_from_ytj,
)


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_or_create_company_via_organization_roles_fallback_uses_defaults(
    api_client, requests_mock
):
    """
    Test the fallback path of 'get_or_create_company_using_organization_roles'.
    When the YTJ API is unavailable (404), the service should use the fallback
    creation method and apply safety defaults (empty strings) to ensure a valid
    database record.
    """
    Company.objects.all().delete()

    org_roles_json = {
        "name": "Test Company Oy",
        "identifier": "1234567-8",
        "complete": True,
        "roles": ["NIMKO"],
    }

    matcher = re.compile(r".*")  # Match any YTJ request
    requests_mock.get(matcher, text="Not Found", status_code=404)

    with mock.patch(
        "companies.services.get_organization_roles", return_value=org_roles_json
    ):
        company = get_or_create_company_using_organization_roles(
            api_client.get("/").wsgi_request
        )

    assert company.name == "Test Company Oy"
    assert company.business_id == "1234567-8"
    assert company.postcode == ""
    assert company.street_address == ""
    assert company.city == ""
    assert company.company_form == ""
    assert company.industry == ""
    assert company.organization_type == OrganizationType.COMPANY

    assert Company.objects.count() == 1


@pytest.mark.django_db
def test_get_or_create_company_via_ytj_data_uses_defaults():
    """
    Test direct company creation using 'get_or_create_company_using_company_data'.
    Verifies that 'COMPANY_SAFE_DEFAULTS' are correctly merged and applied when
    the input YTJ data is incomplete, preventing database integrity errors.
    """
    Company.objects.all().delete()
    ytj_data = {"raw": "data"}
    company_data = {
        "name": "Partial Data Oy",
        "business_id": "9876543-2",
        "ytj_json": ytj_data,
        # Explicitly missing other fields
    }

    company = get_or_create_company_using_company_data(company_data)

    assert company.name == "Partial Data Oy"
    assert company.business_id == "9876543-2"
    assert company.company_form == ""
    assert company.industry == ""
    assert company.street_address == ""
    assert company.postcode == ""
    assert company.city == ""
    assert company.ytj_json == ytj_data


@pytest.mark.django_db
def test_get_or_create_company_using_company_data_with_none_address_fields():
    """
    Test that get_or_create_company_using_company_data handles cases where
    YTJ data uses "addresses" / "freeAddressLine" field instead of separate fields
    for postcode, street_address and city.

    An example from open public endpoint data:
    @see https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=3156602-3
    """
    company_data = {
        "business_id": "3156602-3",
        "city": None,
        "company_form": "Osakeyhtiö",
        "industry": "Muu erikoistumaton vähittäiskauppa",
        "name": "Test Company Oy",
        "postcode": None,
        "street_address": None,
    }

    result = get_or_create_company_using_company_data(company_data)

    assert isinstance(result, Company)
    assert result.business_id == "3156602-3"
    assert result.city == ""
    assert result.company_form == "Osakeyhtiö"
    assert result.industry == "Muu erikoistumaton vähittäiskauppa"
    assert result.name == "Test Company Oy"
    assert result.postcode == ""
    assert result.street_address == ""
    assert result.ytj_json == {}


@pytest.mark.parametrize(
    "company_form,expected_type",
    [
        ("Osakeyhtiö", OrganizationType.COMPANY),
        ("Kommandiittiyhtiö", OrganizationType.COMPANY),
        ("Aatteellinen yhdistys", OrganizationType.ASSOCIATION),
        ("Rekisteröity yhdistys ry", OrganizationType.ASSOCIATION),
        ("Helsingin seurakunta", OrganizationType.PARISH),
        ("Evankelis-luterilainen kirkko", OrganizationType.PARISH),
        ("", OrganizationType.COMPANY),
        (None, OrganizationType.COMPANY),
    ],
)
def test_resolve_organization_type(company_form, expected_type):
    assert resolve_organization_type(company_form) == expected_type


@pytest.mark.django_db
def test_update_company_from_ytj_success(requests_mock, mock_ytj_response):
    Company.objects.all().delete()
    company = Company.objects.create(
        name="Old Name Oy",
        business_id="1234567-8",
        street_address="",
        postcode="",
        city="",
    )

    ytj_api_data = mock_ytj_response(
        business_id="1234567-8",
        name="New Name Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Testikatu 1",
        postcode="00100",
        industry="Ohjelmistojen suunnittelu ja valmistus",
    )

    requests_mock.get(
        "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=1234567-8",
        json=ytj_api_data,
        status_code=200,
    )

    updated_company = update_company_from_ytj(company)

    assert updated_company.name == "New Name Oy"
    assert updated_company.company_form == "Osakeyhtiö"
    assert updated_company.industry == "Ohjelmistojen suunnittelu ja valmistus"
    assert updated_company.street_address == "Testikatu 1"
    assert updated_company.postcode == "00100"
    # City must be formatted to Title Case
    assert updated_company.city == "Helsinki"
    assert updated_company.organization_type == OrganizationType.COMPANY
    assert updated_company.ytj_json == ytj_api_data


@pytest.mark.django_db
def test_update_company_from_ytj_not_found(requests_mock):
    Company.objects.all().delete()
    company = Company.objects.create(
        name="Old Name Oy",
        business_id="1234567-8",
        street_address="",
        postcode="",
        city="",
        ytj_json=None,
    )

    requests_mock.get(
        "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=1234567-8",
        status_code=404,
    )

    updated_company = update_company_from_ytj(company)

    # Values must remain unchanged
    assert updated_company.name == "Old Name Oy"
    assert updated_company.ytj_json is None


@pytest.mark.django_db(transaction=True)
@override_settings(UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT=True)
def test_employer_application_submission_triggers_ytj_update(
    requests_mock, mock_ytj_response
):
    # 1. Create a company missing YTJ data
    company = Company.objects.create(
        name="Missing Data Oy",
        business_id="1111111-1",
        ytj_json=None,
    )

    # 2. Create a draft application for this company
    application = EmployerApplicationFactory(
        company=company,
        status=EmployerApplicationStatus.DRAFT,
    )

    # Mock the YTJ API call
    ytj_api_data = mock_ytj_response(
        business_id="1111111-1",
        name="Updated Name Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Mannerheimintie 1",
        postcode="00100",
        industry="IT-palvelut",
    )

    requests_mock.get(
        "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=1111111-1",
        json=ytj_api_data,
        status_code=200,
    )

    # 3. Simulate PUT update transition to SUBMITTED
    request = RequestFactory().patch("/")
    serializer = EmployerApplicationSerializer(
        instance=application,
        data={"status": EmployerApplicationStatus.SUBMITTED},
        context={"request": request},
        partial=True,
    )
    assert serializer.is_valid()
    serializer.save()

    # Verify that company's name and ytj_json were updated
    company.refresh_from_db()
    assert company.name == "Updated Name Oy"
    assert company.ytj_json == ytj_api_data


@pytest.mark.django_db(transaction=True)
@override_settings(UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT=True)
def test_employer_application_submission_triggers_ytj_update_with_existing_data(
    requests_mock, mock_ytj_response
):
    business_id = "1111111-1"
    # 1. Create a company WITH existing YTJ data
    existing_ytj_json = mock_ytj_response(
        business_id=business_id,
        name="Old Name Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Mannerheimintie 1",
        postcode="00100",
        industry="IT-palvelut",
    )
    company = Company.objects.create(
        name="Old Name Oy",
        business_id=business_id,
        ytj_json=existing_ytj_json,
    )

    # 2. Create a draft application for this company
    application = EmployerApplicationFactory(
        company=company,
        status=EmployerApplicationStatus.DRAFT,
    )

    # Mock the new YTJ API call
    new_ytj_api_data = mock_ytj_response(
        business_id=business_id,
        name="Updated Name Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Mannerheimintie 2",
        postcode="00100",
        industry="IT-palvelut",
    )

    requests_mock.get(
        f"https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId={business_id}",
        json=new_ytj_api_data,
        status_code=200,
    )

    # 3. Simulate PUT update transition to SUBMITTED
    request = RequestFactory().patch("/")
    serializer = EmployerApplicationSerializer(
        instance=application,
        data={"status": EmployerApplicationStatus.SUBMITTED},
        context={"request": request},
        partial=True,
    )
    assert serializer.is_valid()
    serializer.save()

    # Verify that company's name and ytj_json were updated
    company.refresh_from_db()
    assert company.name == "Updated Name Oy"
    assert company.ytj_json == new_ytj_api_data


@pytest.mark.django_db
def test_update_company_from_ytj_updates_modified_at(
    requests_mock, mock_ytj_response, freezer
):
    freezer.move_to("2026-07-08T12:00:00Z")
    Company.objects.all().delete()
    company = Company.objects.create(
        name="Old Name Oy",
        business_id="1234567-8",
        street_address="",
        postcode="",
        city="",
    )
    original_modified_at = company.modified_at

    freezer.move_to("2026-07-08T12:05:00Z")

    ytj_api_data = mock_ytj_response(
        business_id="1234567-8",
        name="New Name Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Testikatu 1",
        postcode="00100",
        industry="Ohjelmistojen suunnittelu ja valmistus",
    )

    requests_mock.get(
        "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=1234567-8",
        json=ytj_api_data,
        status_code=200,
    )

    updated_company = update_company_from_ytj(company)
    updated_company.refresh_from_db()

    assert updated_company.modified_at > original_modified_at
