import pytest
from django.contrib.admin.sites import AdminSite

from applications.admin import EmployerSummerVoucherAdmin
from applications.models import EmployerSummerVoucher
from common.tests.factories import EmployerSummerVoucherFactory


@pytest.fixture
def employer_summer_voucher_admin():
    return EmployerSummerVoucherAdmin(EmployerSummerVoucher, AdminSite())


@pytest.mark.django_db
def test_masked_employee_ssn(employer_summer_voucher_admin):
    # Test with valid SSN
    voucher = EmployerSummerVoucherFactory.build(employee_ssn="010101-1234")
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == "******1234"

    # Test with another valid SSN
    voucher = EmployerSummerVoucherFactory.build(employee_ssn="311299A9876")
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == "******9876"


@pytest.mark.django_db
def test_masked_employee_ssn_empty(employer_summer_voucher_admin):
    # Test with empty SSN
    voucher = EmployerSummerVoucherFactory.build(employee_ssn="")
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == ""

    # Test with None SSN
    voucher = EmployerSummerVoucherFactory.build(employee_ssn=None)
    assert employer_summer_voucher_admin.masked_employee_ssn(voucher) == ""


@pytest.mark.django_db
def test_masked_employee_ssn_short(employer_summer_voucher_admin):
    # Test with short SSN
    voucher = EmployerSummerVoucherFactory.build(employee_ssn="123")
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
