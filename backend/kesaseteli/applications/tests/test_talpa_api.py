import base64
from urllib.parse import parse_qs, urlparse

import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework import status

from applications.enums import EmployerApplicationStatus
from applications.models import TimelineActivityLog
from common.tests.factories import EmployerSummerVoucherFactory

pytestmark = pytest.mark.django_db

VALID_KEY = "test_key_with_at_least_32_characters_long_123"


@override_settings(TALPA_WEBHOOK_API_KEY="")
def test_export_missing_key_config_returns_unauthorized(
    unauthenticated_api_client,
):
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@override_settings(TALPA_WEBHOOK_API_KEY="too_short")
def test_export_short_key_config_returns_unauthorized(
    unauthenticated_api_client,
):
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_requires_api_key(unauthenticated_api_client):
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_wrong_api_key(unauthenticated_api_client):
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(
        url, HTTP_X_API_KEY="wrong_key_that_is_long_enough_123456789"
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_returns_records(unauthenticated_api_client):
    # DRAFT status apps are not included in base_queryset, we need SUBMITTED
    voucher = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
    )
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(
        f"{url}?limit=10", HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == str(voucher.id)
    record = response.data["results"][0]
    assert "company_name" in record
    assert "bank_account_number" in record
    assert "value_in_euros" in record


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_excludes_invoiced(unauthenticated_api_client):
    EmployerSummerVoucherFactory(
        application__status="submitted",
        invoiced_at="2026-08-20T10:00:00Z",
    )
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(
        f"{url}?exclude_invoiced=true&limit=10", HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 0


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_requires_api_key(unauthenticated_api_client):
    url = reverse("talpa-webhook")
    response = unauthenticated_api_client.post(url, data={})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_marks_invoiced(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data = {"successful_ids": [str(voucher.id)], "request_id": "req-123"}
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["updated"] == 1

    voucher.refresh_from_db()
    assert voucher.is_exported is True
    assert voucher.invoiced_at is not None
    assert voucher.talpa_request_id == "req-123"

    voucher.application.refresh_from_db()
    assert (
        voucher.application.status
        == EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM
    )
    tl = TimelineActivityLog.objects.get(application_id=voucher.application_id)
    assert tl.to_status == EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_unknown_ids(unauthenticated_api_client):
    url = reverse("talpa-webhook")
    data = {
        "successful_ids": ["00000000-0000-0000-0000-000000000000"],
        "request_id": "req-123",
    }
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "unknown_ids" in response.data


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_empty_ids(unauthenticated_api_client):
    url = reverse("talpa-webhook")
    data = {"successful_ids": [], "request_id": "req-123"}
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_filters_by_submitted_at(unauthenticated_api_client):
    # Voucher submitted before the cutoff — should be excluded.
    EmployerSummerVoucherFactory(
        application__status="submitted",
        application__submitted_at="2024-01-01T00:00:00Z",
    )
    # Voucher submitted after the cutoff — should be included.
    recent = EmployerSummerVoucherFactory(
        application__status="submitted",
        application__submitted_at="2026-06-01T00:00:00Z",
    )
    url = reverse("talpa-export")
    response = unauthenticated_api_client.get(
        f"{url}?submitted_at_gte=2026-01-01&limit=10",
        HTTP_X_API_KEY=VALID_KEY,
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == str(recent.id)


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_export_cursor_pagination_prevents_skipping(unauthenticated_api_client):
    # Create 3 vouchers in order of submission
    v1 = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
        application__submitted_at="2026-01-01T10:00:00Z",
    )
    v2 = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
        application__submitted_at="2026-01-02T10:00:00Z",
    )
    v3 = EmployerSummerVoucherFactory(
        application__status="submitted",
        is_exported=False,
        application__submitted_at="2026-01-03T10:00:00Z",
    )

    url = reverse("talpa-export")

    # 1. Fetch first page of 2
    response1 = unauthenticated_api_client.get(
        f"{url}?limit=2", HTTP_X_API_KEY=VALID_KEY
    )
    assert response1.status_code == status.HTTP_200_OK
    assert len(response1.data["results"]) == 2
    assert response1.data["results"][0]["id"] == str(v1.id)
    assert response1.data["results"][1]["id"] == str(v2.id)

    next_url = response1.data.get("next")
    assert next_url is not None

    # 2. Acknowledge first page
    webhook_url = reverse("talpa-webhook")
    webhook_data = {"successful_ids": [str(v1.id), str(v2.id)], "request_id": "req-1"}
    webhook_resp = unauthenticated_api_client.post(
        webhook_url, data=webhook_data, HTTP_X_API_KEY=VALID_KEY
    )
    assert webhook_resp.status_code == status.HTTP_200_OK

    # 3. Fetch next page using the cursor link
    # We must extract the cursor query parameter from the full next_url
    parsed = urlparse(next_url)
    cursor = parse_qs(parsed.query).get("cursor", [""])[0]

    response2 = unauthenticated_api_client.get(
        f"{url}?limit=2&cursor={cursor}", HTTP_X_API_KEY=VALID_KEY
    )
    assert response2.status_code == status.HTTP_200_OK
    assert len(response2.data["results"]) == 1
    assert response2.data["results"][0]["id"] == str(v3.id)


# HTTP method restrictions — webhook only accepts POST
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
def test_webhook_disallows_non_post_methods(unauthenticated_api_client, method):
    url = reverse("talpa-webhook")
    response = getattr(unauthenticated_api_client, method)(
        url, HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


# Basic Auth — success (X-Api-Key absent)
@override_settings(
    TALPA_WEBHOOK_API_KEY=VALID_KEY,
    TALPA_ROBOT_AUTH_CREDENTIAL="talpa-robot:a-very-secret-password",
)
def test_webhook_accepts_basic_auth(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    b64 = base64.b64encode(b"talpa-robot:a-very-secret-password").decode()
    response = unauthenticated_api_client.post(
        url,
        data={"successful_ids": [str(voucher.id)]},
        HTTP_AUTHORIZATION=f"Basic {b64}",
    )
    assert response.status_code == status.HTTP_200_OK


# Basic Auth — wrong credential → 401 (authenticator raises AuthenticationFailed)
@override_settings(
    TALPA_WEBHOOK_API_KEY=VALID_KEY, TALPA_ROBOT_AUTH_CREDENTIAL="talpa-robot:correct"
)
def test_webhook_rejects_wrong_basic_auth(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    b64 = base64.b64encode(b"talpa-robot:wrong").decode()
    response = unauthenticated_api_client.post(
        url,
        data={"successful_ids": [str(voucher.id)]},
        HTTP_AUTHORIZATION=f"Basic {b64}",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# Basic Auth — not configured → 401 (authenticator raises AuthenticationFailed)
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY, TALPA_ROBOT_AUTH_CREDENTIAL="")
def test_webhook_basic_auth_not_configured_returns_401(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    b64 = base64.b64encode(b"talpa-robot:correct").decode()
    response = unauthenticated_api_client.post(
        url,
        data={"successful_ids": [str(voucher.id)]},
        HTTP_AUTHORIZATION=f"Basic {b64}",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# Optional request_id — success with no request_id
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_marks_invoiced_without_request_id(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    data = {"successful_ids": [str(voucher.id)]}  # no request_id
    response = unauthenticated_api_client.post(
        reverse("talpa-webhook"), data=data, HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_200_OK
    voucher.refresh_from_db()
    assert voucher.invoiced_at is not None
    assert voucher.talpa_request_id == ""  # stored as empty string


# Idempotency: same request_id twice is safe (no conflict)
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_idempotent_retry_same_request_id(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data = {"successful_ids": [str(voucher.id)], "request_id": "req-123"}
    # First call
    unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    # Second call
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK


# Conflict: different request_id on already-invoiced voucher -> 400
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_conflict_different_request_id(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data1 = {"successful_ids": [str(voucher.id)], "request_id": "req-123"}
    unauthenticated_api_client.post(url, data=data1, HTTP_X_API_KEY=VALID_KEY)

    data2 = {"successful_ids": [str(voucher.id)], "request_id": "req-456"}
    response = unauthenticated_api_client.post(
        url, data=data2, HTTP_X_API_KEY=VALID_KEY
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "conflict_ids" in response.data


# No conflict: no request_id on already-invoiced voucher -> 200, updated=0
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_no_request_id_already_invoiced_returns_updated_zero(
    unauthenticated_api_client,
):
    voucher = EmployerSummerVoucherFactory(
        application__status="submitted", invoiced_at="2026-08-20T10:00:00Z"
    )
    url = reverse("talpa-webhook")
    data = {"successful_ids": [str(voucher.id)]}
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["updated"] == 0


# Failure stub: failed_ids recorded in audit log, status stays SUBMITTED (stub is no-op)
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_failed_ids_recorded(unauthenticated_api_client):
    voucher1 = EmployerSummerVoucherFactory(application__status="submitted")
    voucher2 = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    # For now, serializer requires at least one in ids
    data = {
        "successful_ids": [str(voucher1.id)],
        "failed_ids": [str(voucher2.id)],
        "request_id": "req-err-1",
    }
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK

    voucher2.application.refresh_from_db()
    assert voucher2.application.status == EmployerApplicationStatus.ERROR_IN_PAYMENT


# Idempotency: retry with same request_id on ERROR_IN_PAYMENT voucher is accepted,
# and no duplicate TimelineActivityLog rows are created.
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_failed_ids_retry_same_request_id_accepted(unauthenticated_api_client):
    """Second call with same request_id on a ERROR_IN_PAYMENT voucher must succeed."""
    good = EmployerSummerVoucherFactory(application__status="submitted")
    failed = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data = {
        "successful_ids": [str(good.id)],
        "failed_ids": [str(failed.id)],
        "request_id": "req-retry",
    }
    # First call — transitions failed voucher to ERROR_IN_PAYMENT
    r1 = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert r1.status_code == status.HTTP_200_OK

    # Second call — retry with identical payload and same request_id
    good2 = EmployerSummerVoucherFactory(application__status="submitted")
    data2 = {
        "successful_ids": [str(good2.id)],
        "failed_ids": [str(failed.id)],
        "request_id": "req-retry",
    }
    r2 = unauthenticated_api_client.post(url, data=data2, HTTP_X_API_KEY=VALID_KEY)
    assert r2.status_code == status.HTTP_200_OK

    # Exactly one TimelineActivityLog entry for the failed voucher's application
    tl_count = TimelineActivityLog.objects.filter(
        application_id=failed.application_id,
        to_status=EmployerApplicationStatus.ERROR_IN_PAYMENT,
    ).count()
    assert tl_count == 1


# Conflict: ERROR_IN_PAYMENT voucher from a different request_id is uninvoiceable
@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_failed_ids_retry_different_request_id_rejected(
    unauthenticated_api_client,
):
    """Second call with a different request_id on a ERROR_IN_PAYMENT voucher returns 400."""
    good = EmployerSummerVoucherFactory(application__status="submitted")
    failed = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    # First call — sets request_id="req-A" on the failed voucher
    r1 = unauthenticated_api_client.post(
        url,
        data={
            "successful_ids": [str(good.id)],
            "failed_ids": [str(failed.id)],
            "request_id": "req-A",
        },
        HTTP_X_API_KEY=VALID_KEY,
    )
    assert r1.status_code == status.HTTP_200_OK

    # Second call — different request_id; failed voucher is now ERROR_IN_PAYMENT
    # with a mismatching talpa_request_id, so it must be rejected as uninvoiceable.
    good2 = EmployerSummerVoucherFactory(application__status="submitted")
    r2 = unauthenticated_api_client.post(
        url,
        data={
            "successful_ids": [str(good2.id), str(failed.id)],
            "request_id": "req-B",
        },
        HTTP_X_API_KEY=VALID_KEY,
    )
    assert r2.status_code == status.HTTP_400_BAD_REQUEST
    assert "uninvoiceable_ids" in r2.data


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_oversized_request_id_returns_400(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data = {
        "successful_ids": [str(voucher.id)],
        "request_id": "a" * 256,
    }
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "request_id" in response.data


@override_settings(TALPA_WEBHOOK_API_KEY=VALID_KEY)
def test_webhook_overlapping_ids_returns_400(unauthenticated_api_client):
    voucher = EmployerSummerVoucherFactory(application__status="submitted")
    url = reverse("talpa-webhook")
    data = {
        "successful_ids": [str(voucher.id)],
        "failed_ids": [str(voucher.id)],
        "request_id": "req-overlap",
    }
    response = unauthenticated_api_client.post(url, data=data, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "overlapping_ids" in response.data
    assert str(voucher.id) in response.data["overlapping_ids"]
