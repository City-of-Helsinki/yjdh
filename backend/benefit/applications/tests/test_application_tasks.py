import os
import random
from datetime import timedelta
from io import StringIO

import pytest
from django.core.management import call_command
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application, Attachment
from applications.tests.factories import CancelledApplicationFactory


def test_seed_applications_with_arguments(set_debug_to_true):
    amount = 5
    statuses = ApplicationStatus.values
    batch_count = 4
    total_created = (len(ApplicationStatus.values) + batch_count) * amount
    out = StringIO()
    call_command("seed", number=amount, stdout=out)

    seeded_applications = Application.objects.filter(
        status__in=statuses,
    )
    assert seeded_applications.count() == total_created
    assert f"Created {total_created} applications" in out.getvalue()


def test_seed_is_not_allowed_when_debug_is_false(set_debug_to_false):
    out = StringIO()
    call_command("seed", stdout=out)
    assert (
        "Seeding is allowed only when the DEBUG variable set to True" in out.getvalue()
    )


def test_delete_cancelled_applications_older_than_30_days(cancelled_to_delete):
    out = StringIO()
    status = ApplicationStatus.CANCELLED
    day_threshold = 30

    old_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=cancelled_to_delete)
    ]
    for _ in range(5):
        days = random.randint(1, 29)
        CancelledApplicationFactory(modified_at=timezone.now() - timedelta(days=days))

    applications = Application.objects.filter(status=status)
    total_applications = applications.count()

    call_command("delete_applications", status=status, stdout=out)

    remaining_applications = Application.objects.filter(
        status=status,
        modified_at__gte=(timezone.now() - timedelta(days=day_threshold)),
    )

    remaining_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=remaining_applications)
    ]
    # Assert that 5 applications were not deleted
    assert remaining_applications.count() == 5

    # Assert that the attachment files of the remaining applications were not deleted
    for file_path in remaining_applications_attachment_files:
        assert os.path.exists(file_path) is True

    # Assert that the attachment files of the old applications were deleted
    for file_path in old_applications_attachment_files:
        assert os.path.exists(file_path) is False

    # Assert that the correct number of applications were deleted
    assert (
        f"Deleted {total_applications - remaining_applications.count()} applications with status {status}"
        in out.getvalue()
    )


@pytest.mark.parametrize("status", ["submitted", "approved", "rejected", "foo"])
def test_delete_applications_allows_only_draft_and_cancelled_statuses(status):
    out = StringIO()
    call_command("delete_applications", status=status, stdout=out)
    assert f"Status {status} is not allowed" in out.getvalue()


def test_delete_draft_applications_older_than_180_days(
    drafts_to_delete, drafts_to_keep
):
    out = StringIO()
    status = ApplicationStatus.DRAFT
    day_threshold = 180

    # Collect the attachment file paths of the deletable applications for assertion
    old_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=drafts_to_delete)
    ]

    total_applications = Application.objects.filter(status=status).count()
    call_command("delete_applications", keep=180, status=status, stdout=out)

    # Query the remaining applications after the command has been executed
    remaining_applications = Application.objects.filter(
        status=status,
        modified_at__gte=(timezone.now() - timedelta(days=day_threshold)),
    )

    remaining_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=remaining_applications)
    ]
    # Assert that 5 applications were not deleted
    # assert remaining_applications.count() == 5
    assert remaining_applications.count() == 5

    # Assert that the attachment files of the remaining applications were not deleted
    for file_path in remaining_applications_attachment_files:
        assert os.path.exists(file_path) is True

    # Assert that the attachment files of the old applications were deleted
    for file_path in old_applications_attachment_files:
        assert os.path.exists(file_path) is False

    # Assert that the correct number of applications were deleted
    assert (
        f"Deleted {total_applications - remaining_applications.count()} applications with status {status}"
        in out.getvalue()
    )


def test_user_is_notified_of_upcoming_application_deletion(drafts_about_to_be_deleted):
    out = StringIO()
    call_command(
        "check_drafts_to_delete",
        notify=14,
        keep=180,
        stdout=out,
    )

    assert (
        f"Notified users of {drafts_about_to_be_deleted.count()} applications about upcoming application deletion"
        in out.getvalue()
    )
