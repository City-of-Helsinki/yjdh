import pytest
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory

from applications.admin import (
    EmployerSummerVoucherAdmin,
)
from applications.models import EmployerSummerVoucher
from common.tests.factories import EmployerSummerVoucherFactory


@pytest.fixture
def employer_summer_voucher_admin():
    return EmployerSummerVoucherAdmin(EmployerSummerVoucher, AdminSite())


@pytest.mark.django_db
def test_masked_employee_ssn(employer_summer_voucher_admin):
    # Test with valid SSN
    voucher = EmployerSummerVoucherFactory.build(
        youth_summer_voucher__youth_application__social_security_number="010101-1234"
    )
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == "******1234"

    # Test with another valid SSN
    voucher = EmployerSummerVoucherFactory.build(
        youth_summer_voucher__youth_application__social_security_number="311299A9876"
    )
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == "******9876"


@pytest.mark.django_db
def test_masked_employee_ssn_empty(employer_summer_voucher_admin):
    # Test with empty SSN
    voucher = EmployerSummerVoucherFactory.build(
        youth_summer_voucher__youth_application__social_security_number=""
    )
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == ""

    # Test with None SSN
    voucher = EmployerSummerVoucherFactory.build(youth_summer_voucher=None)
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == ""


@pytest.mark.django_db
def test_masked_employee_ssn_short(employer_summer_voucher_admin):
    # Test with short SSN
    voucher = EmployerSummerVoucherFactory.build(
        youth_summer_voucher__youth_application__social_security_number="123"
    )
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == "******123"


@pytest.mark.django_db
def test_field_configuration(employer_summer_voucher_admin):
    assert "employee_ssn" not in employer_summer_voucher_admin.get_list_display(None)
    # Note: exclude is not directly accessible as list on the instance in same way as readonly_fields if set as class attribute,
    # but we can check if it's in the fields list or not if we were traversing that.
    # checking get_readonly_fields is more robust if it's dynamic, but here it's static mostly.

    # We check if 'employee_ssn' is effectively hidden by checking it's not in the readonly fields list (which it shouldn't be, the masked one is)
    # and ensuring 'masked_employee_ssn' IS.

    config_readonly = employer_summer_voucher_admin.get_readonly_fields(None)
    assert "masked_employee_ssn" in config_readonly
    assert "employee_ssn" not in config_readonly


@pytest.mark.django_db
def test_get_queryset(employer_summer_voucher_admin):
    voucher = EmployerSummerVoucherFactory()
    request = RequestFactory().get("/")
    qs = employer_summer_voucher_admin.get_queryset(request)
    assert qs.filter(pk=voucher.pk).exists()


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
    employer_summer_voucher_admin, serial_number: int, search_term
):
    """
    Test that searching with a serial number (in both sequential and base32 encoded forms)
    returns the correct voucher.
    """
    _smaller, voucher, _larger = (
        EmployerSummerVoucherFactory(
            youth_summer_voucher__summer_voucher_serial_number=serial_number + diff
        )
        for diff in (-1, 0, 1)
    )
    request = RequestFactory().get("/")

    result_qs, _ = employer_summer_voucher_admin.get_search_results(
        request, EmployerSummerVoucher.objects.all(), search_term
    )
    assert list(result_qs.values_list("pk", flat=True)) == [voucher.pk]
