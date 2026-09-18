from io import StringIO

import pytest
from dateutil.relativedelta import relativedelta
from django.core.management import call_command
from django.utils import timezone
from freezegun import freeze_time

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication, YouthApplication
from common.tests.factories import (
    EmployerApplicationFactory,
    InactiveYouthApplicationFactory,
)


@pytest.mark.django_db
def test_cleanup_applications_employer_drafts():
    EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)
    submitted_app = EmployerApplicationFactory(
        status=EmployerApplicationStatus.SUBMITTED
    )
    assert EmployerApplication.objects.count() == 2
    out = StringIO()
    call_command(
        "cleanup_applications",
        "--employer-drafts",
        "--ignore-5-years-restriction",
        stdout=out,
    )
    assert EmployerApplication.objects.count() == 1
    assert EmployerApplication.objects.first().pk == submitted_app.pk
    assert (
        EmployerApplication.objects.first().status
        == EmployerApplicationStatus.SUBMITTED
    )


@pytest.mark.django_db
def test_cleanup_applications_youth_expired():
    # Create an unactivated youth application that is old (expired)
    with freeze_time("2020-01-01 12:00:00"):
        InactiveYouthApplicationFactory(receipt_confirmed_at=None)

    # Create a recent unactivated youth application (not expired)
    # This uses current time which is definitely after 2020
    unexpired_app = InactiveYouthApplicationFactory(receipt_confirmed_at=None)
    # Create an old activated youth application (should not be deleted even if old)
    with freeze_time("2020-01-01 12:00:00"):
        activated_app = InactiveYouthApplicationFactory(
            receipt_confirmed_at=timezone.now()
        )
    assert YouthApplication.objects.count() == 3
    out = StringIO()
    call_command(
        "cleanup_applications",
        "--youth-expired",
        "--ignore-5-years-restriction",
        stdout=out,
    )
    # Only the old unactivated one should be deleted
    assert YouthApplication.objects.count() == 2
    assert YouthApplication.objects.filter(pk=unexpired_app.pk).exists()
    assert YouthApplication.objects.filter(pk=activated_app.pk).exists()
    assert "Successfully deleted 1 expired youth applications." in out.getvalue()


@pytest.mark.django_db
def test_cleanup_applications_dry_run():
    EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)
    with freeze_time("2020-01-01 12:00:00"):
        InactiveYouthApplicationFactory(receipt_confirmed_at=None)

    assert EmployerApplication.objects.count() == 1
    assert YouthApplication.objects.count() == 1

    out = StringIO()
    call_command(
        "cleanup_applications",
        "--employer-drafts",
        "--youth-expired",
        "--ignore-5-years-restriction",
        "--dry-run",
        stdout=out,
    )

    # Nothing should be deleted
    assert EmployerApplication.objects.count() == 1
    assert YouthApplication.objects.count() == 1
    assert (
        "Dry run: 1 employer applications in draft mode would be deleted."
        in out.getvalue()
    )
    assert "Dry run: 1 expired youth applications would be deleted." in out.getvalue()


@pytest.mark.django_db
def test_cleanup_applications_no_options():
    out = StringIO()
    call_command("cleanup_applications", stdout=out)
    assert (
        "No cleanup options specified. Use --help for available options."
        in out.getvalue()
    )


@pytest.mark.django_db
@freeze_time("2026-06-09 12:00:00")
def test_cleanup_applications_employer_drafts_retention():
    # 1. Created > 5 years ago - should be deleted by default
    with freeze_time(timezone.now() - relativedelta(years=5, days=1)):
        old_draft = EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)

    # 2. Created < 5 years ago - should NOT be deleted by default
    with freeze_time(timezone.now() - relativedelta(years=5) + relativedelta(days=1)):
        new_draft = EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)

    assert EmployerApplication.objects.count() == 2

    # Run without ignore flag (default behavior)
    out = StringIO()
    call_command("cleanup_applications", "--employer-drafts", stdout=out)

    # Only old draft is deleted
    assert EmployerApplication.objects.count() == 1
    assert EmployerApplication.objects.filter(pk=new_draft.pk).exists()
    assert not EmployerApplication.objects.filter(pk=old_draft.pk).exists()
    assert "Successfully deleted 1 employer applications" in out.getvalue()

    # Run with ignore flag
    out = StringIO()
    call_command(
        "cleanup_applications",
        "--employer-drafts",
        "--ignore-5-years-restriction",
        stdout=out,
    )

    # New draft is deleted now
    assert EmployerApplication.objects.count() == 0
    assert "Successfully deleted 1 employer applications" in out.getvalue()


@pytest.mark.django_db
@freeze_time("2026-06-09 12:00:00")
def test_cleanup_applications_youth_expired_retention():
    # 1. Created > 5 years ago - should be deleted by default
    with freeze_time(timezone.now() - relativedelta(years=5, days=1)):
        old_youth = InactiveYouthApplicationFactory(receipt_confirmed_at=None)

    # 2. Created < 5 years ago - should NOT be deleted by default
    with freeze_time(timezone.now() - relativedelta(years=5) + relativedelta(days=1)):
        new_youth = InactiveYouthApplicationFactory(receipt_confirmed_at=None)

    assert YouthApplication.objects.count() == 2

    # Run without ignore flag (default behavior)
    out = StringIO()
    call_command("cleanup_applications", "--youth-expired", stdout=out)

    # Only old youth application is deleted
    assert YouthApplication.objects.count() == 1
    assert YouthApplication.objects.filter(pk=new_youth.pk).exists()
    assert not YouthApplication.objects.filter(pk=old_youth.pk).exists()
    assert "Successfully deleted 1 expired youth applications." in out.getvalue()

    # Run with ignore flag
    out = StringIO()
    call_command(
        "cleanup_applications",
        "--youth-expired",
        "--ignore-5-years-restriction",
        stdout=out,
    )

    # New youth application is deleted now
    assert YouthApplication.objects.count() == 0
    assert "Successfully deleted 1 expired youth applications." in out.getvalue()
