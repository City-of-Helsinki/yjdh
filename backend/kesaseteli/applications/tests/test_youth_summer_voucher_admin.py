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
