import re
from unittest import mock

import pytest
from django.test import override_settings

from companies.models import Company
from companies.services import (
    get_or_create_company_using_company_data,
    get_or_create_company_using_organization_roles,
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
