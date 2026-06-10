import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from applications.admin import (
    EmployerApplicationAdmin,
    EmployerSummerVoucherInline,
)
from applications.models import EmployerApplication, EmployerSummerVoucher
from common.tests.factories import EmployerSummerVoucherFactory


@pytest.fixture
def employer_application_admin():
    return EmployerApplicationAdmin(EmployerApplication, AdminSite())


@pytest.mark.django_db
def test_employer_summer_voucher_inline_defined(employer_application_admin):
    # Check that EmployerSummerVoucherInline is registered in inlines
    assert EmployerSummerVoucherInline in employer_application_admin.inlines


@pytest.mark.django_db
def test_employer_summer_voucher_inline_permissions():
    inline = EmployerSummerVoucherInline(EmployerSummerVoucher, AdminSite())

    User = get_user_model()  # noqa: N806

    # Normal user request
    request = RequestFactory().get("/")
    request.user = User(is_superuser=False)
    assert not inline.has_add_permission(request)
    assert not inline.has_change_permission(request)
    assert not inline.has_delete_permission(request)

    # Superuser request
    request_su = RequestFactory().get("/")
    request_su.user = User(is_superuser=True)
    assert not inline.has_delete_permission(request_su)


@pytest.mark.django_db
def test_employer_summer_voucher_inline_links():
    inline = EmployerSummerVoucherInline(EmployerSummerVoucher, AdminSite())

    # Create a test voucher with related youth voucher
    voucher = EmployerSummerVoucherFactory()

    # Test link for employer summer voucher
    emp_link = inline.employer_summer_voucher_link(voucher)
    assert f"/{voucher.pk}/change/" in emp_link
    assert str(voucher.pk) in emp_link

    # Test link for youth summer voucher
    youth_link = inline.youth_summer_voucher_link(voucher)
    assert f"/{voucher.youth_summer_voucher.pk}/change/" in youth_link
    assert voucher.youth_summer_voucher.user_showable_serial_number in youth_link


@pytest.mark.django_db
def test_employer_summer_voucher_inline_links_none_cases():
    inline = EmployerSummerVoucherInline(EmployerSummerVoucher, AdminSite())

    # Unsaved voucher
    unsaved_voucher = EmployerSummerVoucher()
    assert inline.employer_summer_voucher_link(unsaved_voucher) == ""
    assert inline.youth_summer_voucher_link(unsaved_voucher) == ""
