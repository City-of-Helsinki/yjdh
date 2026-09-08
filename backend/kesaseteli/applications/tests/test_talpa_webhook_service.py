import uuid

import pytest
from django.db import transaction

from applications.enums import EmployerApplicationStatus
from applications.services import _VoucherClassification, TalpaWebhookService
from common.tests.factories import (
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
)

pytestmark = pytest.mark.django_db


def test_service_initialization():
    """Test that the TalpaWebhookService correctly stores its initialization parameters."""
    service = TalpaWebhookService(
        successful_ids={"success-1"}, failed_ids={"failed-1"}, request_id="req-123"
    )
    assert service.successful_ids == {"success-1"}
    assert service.failed_ids == {"failed-1"}
    assert service.request_id == "req-123"
    assert not service.has_overlapping_ids()


def test_service_overlapping_ids():
    """Test that overlapping voucher IDs in both successful and failed sets are correctly identified."""
    service = TalpaWebhookService(
        successful_ids={"overlap"}, failed_ids={"overlap"}, request_id="req-123"
    )
    assert service.has_overlapping_ids()
    assert service.get_overlapping_ids() == {"overlap"}


def test_classify_voucher_uninvoiceable():
    """
    Test that a voucher is classified as UNINVOICEABLE if its application
    is not in an invoiceable state (e.g., 'draft' instead of 'submitted').
    """
    # Application is in draft status, not SUBMITTED (which is TALPA_INVOICEABLE_STATUSES)
    app = EmployerApplicationFactory(status="draft")
    voucher = EmployerSummerVoucherFactory(application=app)

    service = TalpaWebhookService(set(), set(), "req-1")
    classification = service._classify_voucher(voucher, request_id="req-1")
    assert classification == _VoucherClassification.UNINVOICEABLE


def test_classify_voucher_conflict_already_invoiced():
    """
    Test that a voucher already invoiced by a DIFFERENT request ID
    is classified as a CONFLICT to prevent double-invoicing.
    """
    app = EmployerApplicationFactory(status="submitted")
    voucher = EmployerSummerVoucherFactory(
        application=app, invoiced_at="2026-08-20T10:00:00Z", talpa_request_id="req-1"
    )

    service = TalpaWebhookService(set(), set(), "req-2")
    # Different request ID -> Conflict
    assert (
        service._classify_voucher(voucher, request_id="req-2")
        == _VoucherClassification.CONFLICT
    )


def test_classify_voucher_idempotent_retry_success():
    """
    Test that a voucher already invoiced by the SAME request ID
    is classified as VALID, safely allowing idempotent retries.
    """
    app = EmployerApplicationFactory(status="submitted")
    voucher = EmployerSummerVoucherFactory(
        application=app, invoiced_at="2026-08-20T10:00:00Z", talpa_request_id="req-1"
    )

    service = TalpaWebhookService(set(), set(), "req-1")
    # Same request ID, not failed -> Valid (Idempotent)
    assert (
        service._classify_voucher(voucher, request_id="req-1")
        == _VoucherClassification.VALID
    )


def test_validate_and_lock_returns_unknown_ids():
    """
    Test that providing UUIDs that do not exist in the database
    results in an 'unknown_ids' validation error.
    """
    service = TalpaWebhookService(
        successful_ids={uuid.UUID("00000000-0000-0000-0000-000000000000")},
        failed_ids=set(),
        request_id="req-1",
    )
    with transaction.atomic():
        errors = service.validate_and_lock_vouchers()

    assert "unknown_ids" in errors
    assert "00000000-0000-0000-0000-000000000000" in errors["unknown_ids"]


def test_process_batch_successful_vouchers():
    """
    Test the happy path where a batch of successful vouchers is processed.
    Vouchers are marked as exported and invoiced, and the parent application
    is transitioned to RECEIVED_BY_PAYMENT_SYSTEM.
    """
    app = EmployerApplicationFactory(status="submitted")
    voucher = EmployerSummerVoucherFactory(application=app)

    service = TalpaWebhookService(
        successful_ids={voucher.id}, failed_ids=set(), request_id="req-1"
    )

    with transaction.atomic():
        errors = service.validate_and_lock_vouchers()
        assert not errors
        updated = service.process_batch()

    assert updated == 1
    voucher.refresh_from_db()
    assert voucher.is_exported is True
    assert voucher.invoiced_at is not None
    assert voucher.talpa_request_id == "req-1"

    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM


def test_process_batch_failed_vouchers():
    """
    Test the failure path where a batch of failed vouchers is processed.
    Vouchers are tagged with the request ID but NOT marked as invoiced,
    and the parent application is transitioned to ERROR_IN_PAYMENT.
    """
    app = EmployerApplicationFactory(status="submitted")
    voucher = EmployerSummerVoucherFactory(application=app)

    service = TalpaWebhookService(
        successful_ids=set(), failed_ids={voucher.id}, request_id="req-fail-1"
    )

    with transaction.atomic():
        errors = service.validate_and_lock_vouchers()
        assert not errors
        updated = service.process_batch()

    assert updated == 0
    voucher.refresh_from_db()
    assert voucher.is_exported is False
    assert voucher.invoiced_at is None
    assert voucher.talpa_request_id == "req-fail-1"

    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.ERROR_IN_PAYMENT


def test_process_batch_mixed_outcomes_prioritize_error():
    """
    Test the edge case where an application has multiple vouchers, and the
    webhook reports some as successful and some as failed.
    The application's status must be prioritized as ERROR_IN_PAYMENT.
    """
    app = EmployerApplicationFactory(status="submitted")
    voucher_ok = EmployerSummerVoucherFactory(application=app)
    voucher_fail = EmployerSummerVoucherFactory(application=app)

    service = TalpaWebhookService(
        successful_ids={voucher_ok.id},
        failed_ids={voucher_fail.id},
        request_id="req-mixed",
    )

    with transaction.atomic():
        errors = service.validate_and_lock_vouchers()
        assert not errors
        updated = service.process_batch()

    assert updated == 1

    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.ERROR_IN_PAYMENT
