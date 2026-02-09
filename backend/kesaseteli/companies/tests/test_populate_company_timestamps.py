"""
Tests for populate_company_timestamps migration function
used in migration "0010_populate_company_timestamps".

These tests use the current data models. These tests CAN BE REMOVED
later IF the data MODELS CHANGE radically, rather than trying to
maintain them indefinitely.
"""

from datetime import datetime, timedelta

import pytest
from django.utils import timezone
from freezegun import freeze_time

from common.tests.factories import CompanyFactory, EmployerApplicationFactory
from companies.migrations.helpers.company_timestamps import populate_company_timestamps
from companies.models import Company


@pytest.mark.django_db
def test_populate_single_company_with_single_application():
    """
    Test that populate_company_timestamps correctly sets timestamps for a
    company with a single employer application.
    """
    with freeze_time("2025-01-01 12:00"):
        company = CompanyFactory()

    # Create an employer application with an earlier timestamp
    with freeze_time("2024-01-15 10:30"):
        employer_app = EmployerApplicationFactory(company=company)

    expected_timestamp = employer_app.created_at
    assert company.created_at != expected_timestamp
    assert company.modified_at != expected_timestamp

    # Run the migration function
    populate_company_timestamps(Company)

    # After migration, company should have the employer application's created_at
    company.refresh_from_db()
    assert company.created_at == expected_timestamp
    assert company.modified_at == expected_timestamp


@pytest.mark.django_db
def test_populate_company_with_multiple_applications():
    """
    Test that populate_company_timestamps uses the earliest employer
    application's created_at timestamp when multiple applications exist.
    """
    company = CompanyFactory()

    # Create three employer applications with different timestamps
    timestamps = [
        timezone.make_aware(datetime(2024, 3, 20, 14, 0)),
        timezone.make_aware(datetime(2024, 1, 10, 9, 0)),  # Earliest
        timezone.make_aware(datetime(2024, 6, 15, 16, 30)),
    ]

    for timestamp in timestamps:
        employer_app = EmployerApplicationFactory(company=company)
        employer_app.created_at = timestamp
        employer_app.save()

    # Run the migration function
    populate_company_timestamps(Company)

    # Company should have the earliest timestamp
    company.refresh_from_db()
    earliest_timestamp = min(timestamps)
    assert company.created_at == earliest_timestamp
    assert company.modified_at == earliest_timestamp


@pytest.mark.django_db
def test_company_without_applications_unchanged():
    """
    Test that companies without any employer applications remain unchanged.
    """
    company = CompanyFactory()
    assert company.employer_applications.count() == 0
    original_created_at = company.created_at
    original_modified_at = company.modified_at

    # Run the migration function
    populate_company_timestamps(Company)

    # Company timestamps should remain unchanged
    company.refresh_from_db()
    assert company.created_at == original_created_at
    assert company.modified_at == original_modified_at


@pytest.mark.django_db
def test_multiple_companies_with_different_scenarios():
    """
    Test populate_company_timestamps with multiple companies:
    some with applications, one without.
    """
    base_time = timezone.make_aware(datetime(2024, 1, 1, 0, 0))

    # 1st company with multiple applications - should use earliest
    company_multi_1 = CompanyFactory()
    timestamps_multi_1 = [
        base_time + timedelta(days=d) for d in [10, 5, 15]
    ]  # 5 is earliest
    for timestamp in timestamps_multi_1:
        app = EmployerApplicationFactory(company=company_multi_1)
        app.created_at = timestamp
        app.save()

    # 2nd company with multiple applications - should use earliest
    company_multi_2 = CompanyFactory()
    timestamps_multi_2 = [
        base_time + timedelta(days=d) for d in [-5, -10, 3]
    ]  # -10 is earliest
    for timestamp in timestamps_multi_2:
        app = EmployerApplicationFactory(company=company_multi_2)
        app.created_at = timestamp
        app.save()

    # Company with single application
    company_single = CompanyFactory()
    timestamp_single = base_time + timedelta(days=20)
    app = EmployerApplicationFactory(company=company_single)
    app.created_at = timestamp_single
    app.save()

    # Company without applications - should remain unchanged
    company_none = CompanyFactory()
    original_created = company_none.created_at

    populate_company_timestamps(Company)

    # Sanity check that the earliest timestamps for the multi-application companies are different
    assert min(timestamps_multi_1) != min(timestamps_multi_2)

    company_multi_1.refresh_from_db()
    assert company_multi_1.created_at == min(timestamps_multi_1)
    assert company_multi_1.modified_at == min(timestamps_multi_1)

    company_multi_2.refresh_from_db()
    assert company_multi_2.created_at == min(timestamps_multi_2)
    assert company_multi_2.modified_at == min(timestamps_multi_2)

    company_single.refresh_from_db()
    assert company_single.created_at == timestamp_single
    assert company_single.modified_at == timestamp_single

    company_none.refresh_from_db()
    assert company_none.created_at == original_created


@pytest.mark.django_db
def test_populate_company_timestamps_query_count(django_assert_max_num_queries):
    """
    Test that populate_company_timestamps uses at most 3 queries.

    NOTE:
        With larger datasets, the chunk/bulk sizes in the migration
        function will make the actual query count higher!
    """
    for i, company in enumerate(CompanyFactory.create_batch(size=15)):
        if i < 10:  # First 10 companies get 3 applications each, last 5 do not
            EmployerApplicationFactory.create_batch(company=company, size=3)

    with django_assert_max_num_queries(3):
        populate_company_timestamps(Company)


@pytest.mark.django_db
def test_populate_company_timestamps_logger_output(caplog):
    """
    Test that populate_company_timestamps logs the expected summary output.
    """
    # Create 3 companies: 2 with applications, 1 without
    EmployerApplicationFactory(company=CompanyFactory())
    EmployerApplicationFactory(company=CompanyFactory())
    CompanyFactory()

    with caplog.at_level("INFO"):
        populate_company_timestamps(Company)

        assert "Handled 3 companies:\n" in caplog.text
        assert (
            "- Set timestamps using related employer applications: 2\n" in caplog.text
        )
        assert "- Did nothing for unused companies: 1\n" in caplog.text
