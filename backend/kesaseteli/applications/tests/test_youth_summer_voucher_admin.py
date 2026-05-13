from unittest.mock import Mock, patch

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.core import mail
from django.test import RequestFactory
from django.urls import reverse

from applications.admin import YouthSummerVoucherAdmin
from applications.models import YouthSummerVoucher
from common.tests.factories import YouthSummerVoucherFactory


@pytest.fixture
def youth_summer_voucher_admin():
    return YouthSummerVoucherAdmin(YouthSummerVoucher, AdminSite())


@pytest.mark.django_db
def test_resend_voucher_action_success(youth_summer_voucher_admin):
    # Create a voucher and application
    voucher = YouthSummerVoucherFactory()

    factory = RequestFactory()
    request = factory.post(reverse("admin:applications_youthsummervoucher_changelist"))

    # Needs a user, but can be a mock if permissions aren't strictly checked by the action itself method
    # However, usually admin actions operate on a request that has a user.
    request.user = Mock()

    # Fix message storage
    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = YouthSummerVoucher.objects.filter(pk=voucher.pk)

    # Execute action without mocking
    youth_summer_voucher_admin.resend_voucher(request, queryset)

    # Check that email was sent
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == [voucher.youth_application.email]

    # Check success message
    msgs = [msg.message for msg in storage]
    assert any("Resent summer voucher to 1 applicant." in m for m in msgs)


@pytest.mark.django_db
def test_resend_voucher_action_failure(youth_summer_voucher_admin):
    # Create a voucher
    voucher = YouthSummerVoucherFactory()

    factory = RequestFactory()
    request = factory.post(reverse("admin:applications_youthsummervoucher_changelist"))
    request.user = Mock()

    # Fix message storage
    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = YouthSummerVoucher.objects.filter(pk=voucher.pk)

    with patch.object(
        YouthSummerVoucher, "send_youth_summer_voucher_email", return_value=False
    ) as mock_send:
        youth_summer_voucher_admin.resend_voucher(request, queryset)
        mock_send.assert_called_once()

    assert len(mail.outbox) == 0

    # Check error message
    msgs = [msg.message for msg in storage]
    assert any("Failed to resend summer voucher to 1 applicant." in m for m in msgs)


@pytest.mark.django_db
def test_search_fields_exist(youth_summer_voucher_admin):
    search_fields = youth_summer_voucher_admin.search_fields
    assert "youth_application__email" in search_fields
    assert "youth_application__phone_number" in search_fields


@pytest.mark.django_db
def test_list_display_methods(youth_summer_voucher_admin):
    voucher = YouthSummerVoucherFactory()

    # Test link display
    link_html = youth_summer_voucher_admin.youth_application_link(voucher)
    assert voucher.youth_application.name in link_html
    assert str(voucher.youth_application.id) in link_html
    assert "href" in link_html


@pytest.mark.django_db
def test_get_queryset(youth_summer_voucher_admin):
    voucher = YouthSummerVoucherFactory()
    request = RequestFactory().get("/")
    qs = youth_summer_voucher_admin.get_queryset(request)
    assert qs.filter(pk=voucher.pk).exists()


@pytest.mark.parametrize(
    "search_term, expected_term",
    [
        # Unchanged search terms:
        ("Test text", "Test text"),  # Normal text
        ("9999", "9999"),  # sequential, no dash
        ("31n-023", "31n-023"),  # invalid checksum → ValueError caught
        # Changed search terms:
        ("31n-022", "100000"),  # base32 encoded → decoded
        ("3g9-230-vqv-s62", "123456789012345"),  # base32 encoded → decoded
    ],
)
def test_get_search_results_search_term_modification(
    youth_summer_voucher_admin, search_term, expected_term
):
    """
    Test that YouthSummerVoucherAdmin.get_search_results calls the super class's
    version with the search term modified/unmodified as expected.
    """
    request = RequestFactory().get("/")
    queryset = YouthSummerVoucher.objects.none()

    with patch(
        "django.contrib.admin.ModelAdmin.get_search_results",
        return_value=(queryset, False),
    ) as mock_super:
        youth_summer_voucher_admin.get_search_results(request, queryset, search_term)
        mock_super.assert_called_once_with(request, queryset, expected_term)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "serial_number, search_term",
    [
        (9999, "9999"),  # sequential number, stringified as-is
        (100_000, "31n-022"),  # base32 encoded, decoded to "100000" before searching
        (123456789012345, "3g9-230-vqv-s62"),  # base32 encoded → decoded
    ],
)
def test_serial_number_search(
    youth_summer_voucher_admin, serial_number: int, search_term
):
    """
    Test that searching with a serial number (in both sequential and base32 encoded forms)
    returns the correct voucher.
    """
    _smaller, voucher, _larger = (
        YouthSummerVoucherFactory(summer_voucher_serial_number=serial_number + diff)
        for diff in (-1, 0, 1)
    )
    request = RequestFactory().get("/")

    result_qs, _ = youth_summer_voucher_admin.get_search_results(
        request, YouthSummerVoucher.objects.all(), search_term
    )
    assert list(result_qs.values_list("pk", flat=True)) == [voucher.pk]
