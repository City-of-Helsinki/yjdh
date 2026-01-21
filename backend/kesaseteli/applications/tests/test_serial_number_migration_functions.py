"""
Tests for set_current_valid_serial_number_based_foreign_keys and
set_historical_serial_number_based_foreign_keys migration functions
used in migration "0042_migrate_youth_summer_voucher_foreign_keys".

These tests use the current data models. These tests CAN BE REMOVED
later IF the data MODELS CHANGE significantly, rather than trying to
maintain them indefinitely.
"""

from datetime import datetime

import pytest
from django.utils import timezone

from applications.migrations.helpers.serial_number_foreign_keys import (
    set_current_valid_serial_number_based_foreign_keys,
    set_historical_serial_number_based_foreign_keys,
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
        "employee_name": "Test Employee",
        "employee_phone_number": "+3584012345678",
        "employee_home_city": "Helsinki",
        "employee_postcode": "00100",
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


@pytest.fixture
def complex_data_setup(employer_app):
    """
    Create a complex set of EmployerSummerVoucher and YouthSummerVoucher
    objects to be used in tests for set_current_valid_serial_number_based_foreign_keys.
    """
    year = 2025

    # Create 11 YouthSummerVouchers that should match by serial number
    for serial_number in range(1, 12):
        YouthSummerVoucherFactory(summer_voucher_serial_number=serial_number)
        create_employer_summer_voucher(
            application=employer_app,
            _obsolete_unclean_serial_number=str(serial_number),
            employee_ssn="111111-111C",
        )

    # Create 12 YouthSummerVouchers that should match by SSN
    for serial_number in range(12, 24):
        youth_voucher = YouthSummerVoucherFactory(
            summer_voucher_serial_number=serial_number
        )
        youth_app = youth_voucher.youth_application
        youth_app.created_at = timezone.make_aware(datetime(year, 5, 1))
        youth_app.save()

        create_employer_summer_voucher(
            application=employer_app,
            _obsolete_unclean_serial_number="INVALID",  # Won't match by serial
            employee_ssn=youth_app.social_security_number,
            created_at=timezone.make_aware(datetime(year, 6, 15)),
        )

    # Create 7 EmployerSummerVouchers that shouldn't match anything
    for _ in range(7):
        create_employer_summer_voucher(
            application=employer_app,
            _obsolete_unclean_serial_number="NOMATCH",
            employee_ssn="INVALID",
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
        employee_ssn="121212A899H",
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


@pytest.mark.django_db
@pytest.mark.parametrize("youth_app_created_before_employer_app", [True, False])
def test_match_by_ssn_and_year(youth_app_created_before_employer_app, employer_app):
    """
    Test the fallback matching in set_current_valid_serial_number_based_foreign_keys
    by social security number and creation year when the serial number does not match.

    :param youth_app_created_before_employer_app: Was the youth application created
        before the employer application?
    """
    # Create a YouthSummerVoucher
    youth_voucher = YouthSummerVoucherFactory(summer_voucher_serial_number=99999)
    youth_app = youth_voucher.youth_application
    created_year = youth_app.created_at.year

    # Create an EmployerSummerVoucher with non-numeric serial but matching SSN
    employer_voucher = create_employer_summer_voucher(
        application=employer_app,
        _obsolete_unclean_serial_number="ABC123",  # Non-numeric → won't match by serial
        employee_ssn=youth_app.social_security_number,
        created_at=timezone.make_aware(datetime(created_year, 6, 15)),
    )

    # Ensure youth application was created before/after employer voucher in the same year
    youth_app.created_at = timezone.make_aware(
        datetime(created_year, 5 if youth_app_created_before_employer_app else 7, 1)
    )
    youth_app.save()

    # Before migration, foreign key should be None
    assert employer_voucher.youth_summer_voucher is None

    # Run the migration function
    set_current_valid_serial_number_based_foreign_keys(
        EmployerSummerVoucher, YouthSummerVoucher
    )

    # Verify the result
    employer_voucher.refresh_from_db()
    assert (
        employer_voucher.youth_summer_voucher is not None
    ) == youth_app_created_before_employer_app
    assert (
        employer_voucher.youth_summer_voucher_id
        == youth_voucher.summer_voucher_serial_number
    ) == youth_app_created_before_employer_app


@pytest.mark.django_db
def test_ambiguous_multimatch_with_ssn(employer_app):
    """
    Test that no match will be found in
    set_current_valid_serial_number_based_foreign_keys when serial number does
    not match, and the fallback matching using social security number matches
    multiple youth summer vouchers.

    The foreign key should remain None due to ambiguity.
    """
    # Create two YouthSummerVouchers with the same social security number
    # and application year
    ssn = "010203-1230"
    created_at = timezone.make_aware(datetime(2024, 5, 1))

    for serial_number in 11111, 22222:
        youth_voucher = YouthSummerVoucherFactory(
            summer_voucher_serial_number=serial_number,
            youth_application__social_security_number=ssn,
        )
        youth_app = youth_voucher.youth_application
        youth_app.created_at = created_at
        youth_app.save()

    # Create an EmployerSummerVoucher with matching social security number
    employer_voucher = create_employer_summer_voucher(
        application=employer_app,
        _obsolete_unclean_serial_number="ABC123",  # Invalid serial number
        employee_ssn=ssn,
        created_at=timezone.make_aware(datetime(2024, 6, 1)),
    )

    # Before migration, foreign key should be None
    assert employer_voucher.youth_summer_voucher is None

    # Run the migration function
    set_current_valid_serial_number_based_foreign_keys(
        EmployerSummerVoucher, YouthSummerVoucher
    )

    # After migration, foreign key should still be None (ambiguous match)
    employer_voucher.refresh_from_db()
    assert employer_voucher.youth_summer_voucher is None


@pytest.mark.django_db
def test_set_current_valid_serial_number_query_count(
    complex_data_setup, django_assert_max_num_queries
):
    """
    Test that set_current_valid_serial_number_based_foreign_keys
    uses at most 3 queries with the data set up in `complex_data_setup`
    fixture (it should be 30 EmployerSummerVoucher objects) to process.

    NOTE:
        With larger datasets, the chunk/bulk sizes in the migration
        function will make the actual query count higher!
    """
    with django_assert_max_num_queries(3):
        set_current_valid_serial_number_based_foreign_keys(
            EmployerSummerVoucher, YouthSummerVoucher
        )


@pytest.mark.django_db
def test_set_current_valid_serial_number_logger_output(complex_data_setup, caplog):
    """
    Test that set_current_valid_serial_number_based_foreign_keys
    logs the expected summary output.
    """
    with caplog.at_level("INFO"):
        set_current_valid_serial_number_based_foreign_keys(
            EmployerSummerVoucher, YouthSummerVoucher
        )
        assert "Handled 30 employer summer vouchers, updated 23:\n" in caplog.text
        assert "- Matched by voucher serial number: 11\n" in caplog.text
        assert "- Matched by social security number & year: 12\n" in caplog.text
        assert "- Failed to match: 7 and left as is\n" in caplog.text


@pytest.mark.django_db
@pytest.mark.parametrize(
    "obsolete_serial,expected_id",
    [
        # Successful conversions
        ("0", 0),
        ("12345", 12345),
        ("987654321987654321", 987654321987654321),
        ("  00250   ", 250),
        # Invalid conversions
        ("ABC123", None),  # Non-numeric string
        ("Korhonen", None),  # Most common Finnish surname
        ("", None),  # Empty string
        ("-123", None),  # Negative numbers are invalid
    ],
)
def test_set_historical_serial_number_based_foreign_keys(
    obsolete_serial, expected_id, employer_app
):
    """
    Test set_historical_serial_number_based_foreign_keys with various
    valid and invalid serial numbers.
    """
    # Create an EmployerSummerVoucher to generate history
    employer_voucher = create_employer_summer_voucher(
        application=employer_app,
        _obsolete_unclean_serial_number=obsolete_serial,
        employee_ssn="111111-111C",
    )

    # HistoricalEmployerSummerVoucher does exist, not all IDEs (e.g. PyCharm)
    # might find it possibly because the model is created dynamically by simple_history.
    # Disabling possible F401 (unused-import) warning as false positive.
    from applications.models import HistoricalEmployerSummerVoucher  # noqa: F401

    assert HistoricalEmployerSummerVoucher
    assert HistoricalEmployerSummerVoucher.__name__ == "HistoricalEmployerSummerVoucher"

    # Clear the history to ensure a clean state
    HistoricalEmployerSummerVoucher.objects.all().delete()
    assert HistoricalEmployerSummerVoucher.objects.count() == 0

    # Update the object to create historical record
    employer_voucher.employee_name = "Updated Name"
    employer_voucher.save()

    assert HistoricalEmployerSummerVoucher.objects.count() == 1
    historical = HistoricalEmployerSummerVoucher.objects.first()
    assert historical.youth_summer_voucher_id is None

    # Run the migration function
    set_historical_serial_number_based_foreign_keys(HistoricalEmployerSummerVoucher)

    # Verify the result
    historical.refresh_from_db()
    assert historical.youth_summer_voucher_id == expected_id
