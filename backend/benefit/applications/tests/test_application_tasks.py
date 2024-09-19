import os
import random
import uuid
from datetime import datetime, timedelta
from io import StringIO
from unittest.mock import MagicMock, patch

import pytest
from django.core.management import call_command
from django.utils import timezone

from applications.enums import (
    AhjoDecision,
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationStatus,
)
from applications.models import AhjoSetting, AhjoStatus, Application, Attachment
from applications.services.ahjo_authentication import AhjoToken
from applications.tests.factories import CancelledApplicationFactory


def test_seed_applications_with_arguments(set_debug_to_true):
    amount = 4
    statuses = ApplicationStatus.values
    # exlude rejected_by_talpa status as it is not used in seeder
    filtered_statuses = [
        status for status in statuses if status != ApplicationStatus.ARCHIVAL
    ]
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


@pytest.mark.parametrize(
    "previous_ahjo_status, request_type, patch_db_function, patch_request",
    [
        (
            AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
            AhjoRequestType.OPEN_CASE,
            "applications.management.commands.send_ahjo_requests.Application.objects.get_by_statuses",
            "applications.management.commands.send_ahjo_requests.send_open_case_request_to_ahjo",
        ),
        (
            AhjoStatusEnum.CASE_OPENED,
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            "applications.management.commands.send_ahjo_requests.Application.objects.get_for_ahjo_decision",
            "applications.management.commands.send_ahjo_requests.send_decision_proposal_to_ahjo",
        ),
        (
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            AhjoRequestType.ADD_RECORDS,
            "applications.management.commands.send_ahjo_requests.Application.objects.with_non_downloaded_attachments",
            "applications.management.commands.send_ahjo_requests.send_new_attachment_records_to_ahjo",
        ),
        (
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
            AhjoRequestType.UPDATE_APPLICATION,
            "applications.management.commands.send_ahjo_requests.Application.objects.get_by_statuses",
            "applications.management.commands.send_ahjo_requests.update_application_summary_record_in_ahjo",
        ),
        (
            AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO,
            AhjoRequestType.GET_DECISION_DETAILS,
            "applications.management.commands.send_ahjo_requests.Application.objects.get_by_statuses",
            "applications.management.commands.send_ahjo_requests.get_decision_details_from_ahjo",
        ),
        (
            AhjoStatusEnum.CASE_OPENED,
            AhjoRequestType.DELETE_APPLICATION,
            "applications.management.commands.send_ahjo_requests.Application.objects.get_by_statuses",
            "applications.management.commands.send_ahjo_requests.delete_application_in_ahjo",
        ),
    ],
)
@patch("applications.management.commands.send_ahjo_requests.get_token")
def test_send_ahjo_requests(
    mock_get_token,
    previous_ahjo_status,
    request_type,
    patch_db_function,
    patch_request,
    p2p_settings,
    batch_for_decision_details,
    ahjo_decision_detail_response,
    application_with_ahjo_decision,
):
    AhjoSetting.objects.create(name="ahjo_code", data={"code": "12345"})
    with patch(patch_db_function) as mock_get_applications, patch(
        patch_request
    ) as mock_send_request:
        mock_get_token.return_value = MagicMock(AhjoToken)
        number_to_send = 5

        application = application_with_ahjo_decision
        AhjoStatus.objects.create(application=application, status=previous_ahjo_status)

        if request_type == AhjoRequestType.GET_DECISION_DETAILS:
            mock_response = ahjo_decision_detail_response
            # Set the decision date to the current date in the same format as in the response
            date_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
            mock_response[0]["DateDecision"] = date_str
            application.batch_id = batch_for_decision_details.id
            application.save()
        else:
            mock_response = f"{uuid.uuid4()}"

        applications = [
            MagicMock(spec=Application, handled_by_ahjo_automation=True)
            for _ in range(number_to_send)
        ]
        applications_qs = MagicMock()
        applications_qs.filter.return_value = applications

        mock_get_applications.return_value = applications_qs
        mock_send_request.return_value = (
            application,
            mock_response,
        )

        # Call the command
        out = StringIO()
        call_command(
            "send_ahjo_requests",
            request_type=request_type,
            number=number_to_send,
            stdout=out,
        )

        assert (
            f"Sending {request_type} request to Ahjo for {number_to_send} applications"
            in out.getvalue()
        )

        assert (
            f"Sent {request_type} requests for {number_to_send} applications to Ahjo"
            in out.getvalue()
        )

        if request_type == AhjoRequestType.GET_DECISION_DETAILS:
            assert (
                application.ahjo_status.latest().status
                == AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO
            )
            assert (
                application.batch.proposal_for_decision == AhjoDecision.DECIDED_ACCEPTED
            )
