import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework import status

from common.tests.factories import EmployerSummerVoucherFactory

pytestmark = pytest.mark.django_db

VALID_KEY = "test_key_with_at_least_32_characters_long_123"
VALID_ANONYMOUS_KEY = "anon_key_with_at_least_32_characters_long_123"


@override_settings(REPORTING_EXPORT_API_KEY="")
def test_export_missing_key_config_returns_forbidden(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(REPORTING_EXPORT_API_KEY="too_short")
def test_export_short_key_config_returns_forbidden(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_export_requires_api_key(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_export_wrong_api_key(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(
        url, HTTP_X_API_KEY="wrong_key_that_is_long_enough_123456789"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_export_returns_records(api_client):
    # DRAFT status apps are not included in base_queryset, we need SUBMITTED
    voucher = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
    )
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(f"{url}?limit=10", HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == str(voucher.id)
    record = response.data["results"][0]
    assert "company_name" in record
    assert "employment_salary_paid" in record
    assert "submitted_at" in record


@override_settings(REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_export_excludes_invoiced(api_client):
    EmployerSummerVoucherFactory(
        application__status="submitted",
        invoiced_at="2026-08-20T10:00:00Z",
    )
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(
        f"{url}?exclude_invoiced=true&limit=10", HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 0


@override_settings(REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_export_invalid_year_parameter(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(f"{url}?year=invalid&limit=10", HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "year" in response.data


@override_settings(ANONYMOUS_REPORTING_EXPORT_API_KEY="")
def test_anonymous_export_missing_key_config_returns_forbidden(api_client):
    url = reverse("anonymous-reporting-employer-summer-vouchers")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(ANONYMOUS_REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_anonymous_export_requires_api_key(api_client):
    url = reverse("anonymous-reporting-employer-summer-vouchers")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(ANONYMOUS_REPORTING_EXPORT_API_KEY=VALID_KEY)
def test_anonymous_export_returns_records_without_pii(api_client):
    voucher = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
    )
    url = reverse("anonymous-reporting-employer-summer-vouchers")
    response = api_client.get(f"{url}?limit=10", HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1

    record = response.data["results"][0]
    assert record["id"] == str(voucher.id)
    assert "company_name" in record
    assert "company_industry" in record
    assert "target_group" in record

    # Assert sensitive PII fields are absent
    sensitive_fields = [
        "summer_voucher_serial_number",
        "employee_name",
        "employee_ssn",
        "employee_phone_number",
        "contact_person_email",
        "contact_person_phone_number",
        "payee_name",
        "payee_address",
        "bank_account_number",
        "bank_swift_bic_code",
    ]
    assert all(field not in record for field in sensitive_fields)


@override_settings(
    REPORTING_EXPORT_API_KEY=VALID_KEY,
    ANONYMOUS_REPORTING_EXPORT_API_KEY=VALID_ANONYMOUS_KEY,
)
def test_anonymous_key_rejected_on_full_export(api_client):
    url = reverse("reporting-employer-summer-vouchers")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_ANONYMOUS_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(
    REPORTING_EXPORT_API_KEY=VALID_KEY,
    ANONYMOUS_REPORTING_EXPORT_API_KEY=VALID_ANONYMOUS_KEY,
)
def test_full_key_rejected_on_anonymous_export(api_client):
    url = reverse("anonymous-reporting-employer-summer-vouchers")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN
