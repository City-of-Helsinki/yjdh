from io import StringIO

import pytest
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
    call_command("cleanup_applications", "--employer-drafts", stdout=out)
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
    call_command("cleanup_applications", "--youth-expired", stdout=out)
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
