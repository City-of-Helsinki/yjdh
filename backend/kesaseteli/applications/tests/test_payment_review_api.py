from uuid import uuid4

import pytest
from auditlog.models import LogEntry
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from applications.api.v1.views import EmployerApplicationViewSet
from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication, TimelineActivityLog
from common.tests.factories import EmployerApplicationFactory

APPROVER_GROUP_UUID = uuid4()
OTHER_APPROVER_GROUP_UUID = uuid4()


@pytest.fixture(autouse=True)
def approver_group_uuid_setting(settings):
    settings.ADFS_APPROVER_GROUP_UUIDS = [
        str(OTHER_APPROVER_GROUP_UUID),
        str(APPROVER_GROUP_UUID),
    ]


def get_action_url(application: EmployerApplication, action: str):
    return reverse(
        f"v1:employerapplication-approver-{action}",
        kwargs={"pk": application.id},
    )


def get_bulk_action_url(action: str):
    return reverse(f"v1:employerapplication-approver-bulk-{action}")


@pytest.mark.parametrize(
    "action_name", sorted(EmployerApplicationViewSet.APPROVER_ACTIONS)
)
def test_approver_actions_are_defined_on_viewset(action_name):
    viewset_action_names = {
        action.__name__ for action in EmployerApplicationViewSet.get_extra_actions()
    }

    assert action_name in viewset_action_names


@pytest.fixture
def approver_client(staff_user):
    group = Group.objects.create(name=f"adfs-{APPROVER_GROUP_UUID}")
    staff_user.groups.add(group)
    client = APIClient()
    client.force_authenticate(staff_user)
    return client


@pytest.mark.django_db
def test_approver_actions_denied_when_no_approver_groups_configured(
    settings, approver_client
):
    """
    An empty ADFS_APPROVER_GROUP_UUIDS means nobody is an approver, so every
    approver-gated action must be denied even for a user who is in an ADFS group.
    """
    settings.ADFS_APPROVER_GROUP_UUIDS = []
    application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )

    response = approver_client.post(
        get_action_url(application, "accept-for-payment"), {}
    )

    assert response.status_code == 403
    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.PAYMENT_REVIEW


@pytest.mark.parametrize(
    ("source_status", "target_status", "action"),
    [
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            "accept-for-payment",
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.REJECTED,
            "reject",
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.SUBMITTED,
            "return-to-handler-queue",
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.PAYMENT_REVIEW,
            "return-to-payment-review",
        ),
    ],
)
@pytest.mark.django_db
def test_approver_can_apply_payment_review_transitions(
    approver_client, source_status, target_status, action
):
    application = EmployerApplicationFactory(status=source_status)

    response = approver_client.post(
        get_action_url(application, action),
    )

    assert response.status_code == 200
    application.refresh_from_db()
    assert application.status == target_status


@pytest.mark.django_db
def test_regular_handler_cannot_apply_payment_review_transition(
    staff_client,
):
    application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )

    response = staff_client.post(
        get_action_url(application, "accept-for-payment"),
    )

    assert response.status_code == 403
    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.PAYMENT_REVIEW


@pytest.mark.django_db
def test_approver_action_requires_the_expected_source_status(approver_client):
    application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.APPLICATION_HANDLING
    )

    response = approver_client.post(
        get_action_url(application, "reject"),
    )

    assert response.status_code == 409
    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
def test_return_to_handler_queue_returns_to_additional_information_provided_when_applicable(
    approver_client,
):
    application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
        additional_info_provided_at=timezone.now(),
    )

    response = approver_client.post(
        get_action_url(application, "return-to-handler-queue"),
    )

    assert response.status_code == 200
    application.refresh_from_db()
    assert (
        application.status == EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
    )


@pytest.mark.django_db
def test_bulk_approver_action_processes_each_application_independently(
    approver_client,
):
    valid_application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )
    invalid_application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.SUBMITTED
    )

    response = approver_client.post(
        get_bulk_action_url("accept-for-payment"),
        {
            "application_ids": [valid_application.id, invalid_application.id],
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["updated_ids"] == [str(valid_application.id)]
    assert response.data["failed_ids"] == [str(invalid_application.id)]
    valid_application.refresh_from_db()
    invalid_application.refresh_from_db()
    assert valid_application.status == EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT
    assert invalid_application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_bulk_approver_action_reports_unknown_application_ids(approver_client):
    application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )
    unknown_id = uuid4()

    response = approver_client.post(
        get_bulk_action_url("accept-for-payment"),
        {"application_ids": [application.id, unknown_id]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["updated_ids"] == [str(application.id)]
    assert response.data["failed_ids"] == [str(unknown_id)]
    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT


@pytest.mark.django_db
def test_bulk_approver_action_returns_200_when_every_application_fails(
    approver_client,
):
    application = EmployerApplicationFactory(status=EmployerApplicationStatus.SUBMITTED)

    response = approver_client.post(
        get_bulk_action_url("accept-for-payment"),
        {"application_ids": [application.id]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["updated_ids"] == []
    assert response.data["failed_ids"] == [str(application.id)]
    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_bulk_approver_action_leaves_no_audit_or_timeline_records_for_failures(
    approver_client,
):
    """
    django-auditlog writes its LogEntry on pre_save, before the UPDATE, so a
    rejected application must not leave an audit trace of a change that never
    happened.
    """
    invalid_application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.SUBMITTED
    )
    content_type = ContentType.objects.get_for_model(EmployerApplication)
    log_entries_before = LogEntry.objects.filter(
        content_type=content_type,
        object_pk=str(invalid_application.id),
        action=LogEntry.Action.UPDATE,
    ).count()

    response = approver_client.post(
        get_bulk_action_url("accept-for-payment"),
        {"application_ids": [invalid_application.id]},
        format="json",
    )

    assert response.status_code == 200
    assert (
        LogEntry.objects.filter(
            content_type=content_type,
            object_pk=str(invalid_application.id),
            action=LogEntry.Action.UPDATE,
        ).count()
        == log_entries_before
    )
    assert not TimelineActivityLog.objects.filter(
        application_type="employerapplication",
        application_id=invalid_application.id,
    ).exists()


@pytest.mark.django_db
def test_bulk_return_to_handler_queue_chooses_status_per_application(
    approver_client,
):
    submitted_application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )
    additional_information_application = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
        additional_info_provided_at=timezone.now(),
    )

    response = approver_client.post(
        get_bulk_action_url("return-to-handler-queue"),
        {
            "application_ids": [
                submitted_application.id,
                additional_information_application.id,
            ],
        },
        format="json",
    )

    assert response.status_code == 200
    submitted_application.refresh_from_db()
    additional_information_application.refresh_from_db()
    assert submitted_application.status == EmployerApplicationStatus.SUBMITTED
    assert (
        additional_information_application.status
        == EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
    )


@pytest.mark.django_db
def test_bulk_approver_action_preserves_audit_and_timeline_records(
    approver_client,
):
    applications = EmployerApplicationFactory.create_batch(
        2,
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
    )
    application_ids = [application.id for application in applications]
    content_type = ContentType.objects.get_for_model(EmployerApplication)

    response = approver_client.post(
        get_bulk_action_url("accept-for-payment"),
        {
            "application_ids": application_ids,
        },
        format="json",
    )

    assert response.status_code == 200
    assert set(response.data["updated_ids"]) == {
        str(application_id) for application_id in application_ids
    }
    assert (
        LogEntry.objects.filter(
            content_type=content_type,
            object_pk__in=[str(application_id) for application_id in application_ids],
            action=LogEntry.Action.UPDATE,
        ).count()
        == 2
    )
    assert (
        TimelineActivityLog.objects.filter(
            application_type="employerapplication",
            application_id__in=application_ids,
            old_value=EmployerApplicationStatus.PAYMENT_REVIEW,
            new_value=EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ).count()
        == 2
    )
