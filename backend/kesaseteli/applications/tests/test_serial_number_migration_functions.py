"""
Tests for set_current_valid_serial_number_based_foreign_keys migration function
used in migration "0042_migrate_youth_summer_voucher_foreign_keys".

These tests use the current data models. These tests CAN BE REMOVED
later IF the data MODELS CHANGE significantly, rather than trying to
maintain them indefinitely.
"""

import pytest

from applications.migrations.helpers.serial_number_foreign_keys import (
    set_current_valid_serial_number_based_foreign_keys,
)
from applications.models import (
    EmployerApplication,
    EmployerSummerVoucher,
    YouthSummerVoucher,
)
from common.tests.factories import CompanyFactory, YouthSummerVoucherFactory
from shared.common.tests.factories import DuplicateAllowingUserFactory


def create_employer_summer_voucher(**overrides):
    """Create EmployerSummerVoucher with test defaults and the given overrides."""
    params = {
        "youth_summer_voucher": None,
        "employee_phone_number": "+3584012345678",
        "employment_postcode": "00200",
        "employment_start_date": "2024-06-01",
        "employment_end_date": "2024-08-31",
        "employment_work_hours": 37.5,
        "employment_salary_paid": 2000.00,
    }
    params.update(overrides)

    voucher = EmployerSummerVoucher.objects.create(**params)

    # Set created_at afterward as it can't be overridden on create
    created_at = params.get("created_at", None)
    if created_at:
        voucher.created_at = created_at
        voucher.save()
        voucher.refresh_from_db()
        assert voucher.created_at == created_at

    return voucher


@pytest.fixture
def employer_app():
    """Create an EmployerApplication with all required dependencies."""
    company = CompanyFactory()
    user = DuplicateAllowingUserFactory()
    return EmployerApplication.objects.create(
        company=company,
        user=user,
        status="draft",
        contact_person_name="Test Contact",
        contact_person_email="test@example.com",
        contact_person_phone_number="+3584012345678",
    )


@pytest.mark.django_db
def test_match_by_numeric_serial_number(employer_app):
    """
    Test matching in set_current_valid_serial_number_based_foreign_keys
    by purely numeric serial number.
    """
    # Create a YouthSummerVoucher with a known serial number
    youth_voucher = YouthSummerVoucherFactory(summer_voucher_serial_number=12345)

    # Create an EmployerSummerVoucher with matching numeric serial
    employer_voucher = create_employer_summer_voucher(
        application=employer_app,
        _obsolete_unclean_serial_number=" 00012345   ",
    )

    # Before migration, foreign key should be None
    assert employer_voucher.youth_summer_voucher is None

    # Run the migration function
    set_current_valid_serial_number_based_foreign_keys(
        EmployerSummerVoucher, YouthSummerVoucher
    )

    # After migration, foreign key should be set
    employer_voucher.refresh_from_db()
    assert employer_voucher.youth_summer_voucher is not None
    assert employer_voucher.youth_summer_voucher.id == youth_voucher.id
    assert employer_voucher.youth_summer_voucher.summer_voucher_serial_number == 12345
