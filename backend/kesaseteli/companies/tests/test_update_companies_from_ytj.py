import io

import pytest
from django.core.management import call_command

from companies.models import Company


@pytest.mark.django_db
def test_command_dry_run_does_not_save(requests_mock):
    Company.objects.all().delete()
    Company.objects.create(
        name="Target Company",
        business_id="1234567-8",
        ytj_json=None,
    )

    out = io.StringIO()
    call_command("update_companies_from_ytj", "--dry-run", stdout=out)

    output = out.getvalue()
    assert (
        "Dry run: Would query YTJ and update company: Target Company (1234567-8)"
        in output
    )
    assert "Dry run completed successfully." in output

    # Verify DB unchanged
    company = Company.objects.get(business_id="1234567-8")
    assert company.ytj_json is None


@pytest.mark.django_db
def test_command_updates_companies_missing_ytj_json(requests_mock, mock_ytj_response):
    Company.objects.all().delete()
    company_missing = Company.objects.create(
        name="Missing Data Oy",
        business_id="1111111-1",
        ytj_json=None,
    )
    company_with_data = Company.objects.create(
        name="Has Data Oy",
        business_id="2222222-2",
        company_form="Osakeyhtiö",
        ytj_json={"mocked": True},
    )

    ytj_api_data = mock_ytj_response(
        business_id="1111111-1",
        name="Updated Missing Oy",
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

    out = io.StringIO()
    call_command("update_companies_from_ytj", stdout=out)

    company_missing.refresh_from_db()
    company_with_data.refresh_from_db()

    # The one missing data should be updated
    assert company_missing.name == "Updated Missing Oy"
    assert company_missing.ytj_json == ytj_api_data
    # The one with data should not be queried/updated
    assert company_with_data.name == "Has Data Oy"


@pytest.mark.django_db
def test_command_all_flag_includes_companies_with_ytj_json(
    requests_mock, mock_ytj_response
):
    Company.objects.all().delete()
    company_with_data = Company.objects.create(
        name="Has Data Oy",
        business_id="2222222-2",
        ytj_json={"mocked": True},
    )

    ytj_api_data = mock_ytj_response(
        business_id="2222222-2",
        name="Updated Has Data Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Mannerheimintie 1",
        postcode="00100",
        industry="IT-palvelut",
    )

    requests_mock.get(
        "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=2222222-2",
        json=ytj_api_data,
        status_code=200,
    )

    out = io.StringIO()
    # Call with --all
    call_command("update_companies_from_ytj", "--all", stdout=out)

    company_with_data.refresh_from_db()
    assert company_with_data.name == "Updated Has Data Oy"
    assert company_with_data.ytj_json == ytj_api_data


@pytest.mark.django_db
def test_command_success_and_failure_reporting(requests_mock, mock_ytj_response):
    Company.objects.all().delete()
    company_success = Company.objects.create(
        name="Success Company Oy",
        business_id="1111111-1",
        ytj_json={"mocked": True},
    )
    company_fail = Company.objects.create(
        name="Error Company Oy",
        business_id="3333333-3",
        ytj_json={"mocked": True},
    )

    ytj_api_data = mock_ytj_response(
        business_id=company_success.business_id,
        name="Updated Success Oy",
        company_form="Osakeyhtiö",
        city="HELSINKI",
        street="Mannerheimintie 1",
        postcode="00100",
        industry="IT-palvelut",
    )

    requests_mock.get(
        f"https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId={company_success.business_id}",
        json=ytj_api_data,
        status_code=200,
    )
    requests_mock.get(
        f"https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId={company_fail.business_id}",
        status_code=500,
    )

    out = io.StringIO()
    call_command("update_companies_from_ytj", "--all", "--delay", "0.0", stdout=out)

    output = out.getvalue()
    assert f"Successfully updated {company_success.business_id}" in output
    assert f"Failed to update {company_fail.business_id}" in output
    assert "Success: 1, Failed/Skipped: 1" in output
