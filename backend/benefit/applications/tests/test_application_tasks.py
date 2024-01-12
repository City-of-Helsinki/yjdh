import os
import random
from datetime import timedelta
from io import StringIO
from unittest.mock import MagicMock, patch

import pytest
from django.core.management import call_command
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application, Attachment
from applications.tests.factories import CancelledApplicationFactory


def test_seed_applications_with_arguments(set_debug_to_true):
    amount = 5
    statuses = ApplicationStatus.values
    # exlude rejected_by_talpa status as it is not used in seeder
    filtered_statuses = [status for status in statuses if status != "rejected_by_talpa"]
    batch_count = 6
    total_created = ((len(filtered_statuses) * 2) + batch_count) * amount
    out = StringIO()
    call_command("seed", number=amount, stdout=out)

    seeded_applications = Application.objects.filter(
        status__in=filtered_statuses,
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


@pytest.mark.django_db
def test_open_cases_in_ahjo_success(capfd, dummy_ahjo_token):
    # Mock external services
    with patch(
        "applications.services.ahjo_integration.get_token"
    ) as mock_get_token, patch(
        "applications.services.ahjo_integration.get_applications_for_open_case"
    ) as mock_get_applications, patch(
        "applications.services.ahjo_integration.send_open_case_request_to_ahjo"
    ) as mock_send_request, patch(
        "applications.services.ahjo_integration.create_status_for_application"
    ) as mock_create_status:
        # Setup mock return values
        mock_get_token.return_value = dummy_ahjo_token
        mock_get_applications.return_value = [MagicMock(spec=Application)]
        mock_send_request.return_value = (
            MagicMock(spec=Application),
            "{response_text}",
        )

        number_to_open = 1

        # Call the command
        call_command("open_cases_in_ahjo", number=number_to_open)

        # Capture the output
        out, _ = capfd.readouterr()

        # Assertions
        assert (
            f"Sending request to Ahjo to open cases for {number_to_open} applications"
            in out
        )
        assert "Successfully submitted open case request" in out
        assert mock_send_request.called
        assert mock_send_request.call_count == number_to_open
        assert mock_create_status.called
        assert mock_create_status.call_count == number_to_open

        assert (
            f"Sent open case requests for {number_to_open} applications to Ahjo" in out
        )


@pytest.mark.django_db
def test_open_cases_in_ahjo_dryrun(capfd, dummy_ahjo_token):
    with patch(
        "applications.services.ahjo_integration.get_token"
    ) as mock_get_token, patch(
        "applications.services.ahjo_integration.get_applications_for_open_case"
    ) as mock_get_applications:
        number_to_open = 3
        # Setup mock return values
        mock_get_token.return_value = dummy_ahjo_token
        mock_get_applications.return_value = [
            MagicMock(spec=Application) for _ in range(number_to_open)
        ]

        # Call the command
        call_command("open_cases_in_ahjo", dry_run=True, number=number_to_open)

        # Capture the output
        out, _ = capfd.readouterr()
        assert (
            f"Would send open case requests for {number_to_open} applications to Ahjo"
            in out
        )
