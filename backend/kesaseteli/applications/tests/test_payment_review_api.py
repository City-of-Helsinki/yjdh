from datetime import timedelta
from uuid import UUID, uuid4

import pytest
from auditlog.models import LogEntry
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from applications.api.v1.views import EmployerApplicationViewSet
from applications.enums import EmployerApplicationStatus
from applications.models import (
    EmployerApplication,
    EmployerSummerVoucher,
    TimelineActivityLog,
)
from applications.services import EmployerApplicationApproverService
from common.permissions import ApproverPermission
from common.tests.factories import (
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    HandlerUserFactory,
)

APPROVER_GROUP_UUID = uuid4()

_APPROVER_ACTIONS = (
    "accept_for_payment",
    "approver_reject",
    "return_to_handler_queue",
    "return_to_payment_review",
)


@pytest.fixture(autouse=True)
def approver_group_uuid_setting(settings):
    settings.ADFS_APPROVER_GROUP_UUIDS = [str(APPROVER_GROUP_UUID)]


@pytest.fixture
def approver_client(staff_user):
    group = Group.objects.create(name=f"adfs-{APPROVER_GROUP_UUID}")
    staff_user.groups.add(group)
    client = APIClient()
    client.force_authenticate(staff_user)
    return client


@pytest.fixture
def frozen_action_time():
    with freeze_time("2026-01-01 12:00:00"):
        yield timezone.now()


@pytest.fixture
def old_field_values(frozen_action_time):
    return {
        "assignee": HandlerUserFactory(),
        "handler": HandlerUserFactory(),
        "handled_at": frozen_action_time - timedelta(days=2),
        "approver": HandlerUserFactory(),
        "accepted_for_payment_at": frozen_action_time - timedelta(days=1),
    }


def get_action_url(action: str):
    return reverse(f"v1:employerapplication-{action.replace('_', '-')}")


def post_single_application_approver_action(
    client, application_id: UUID | str, action: str
):
    return client.post(
        get_action_url(action), {"application_ids": [application_id]}, format="json"
    )


@pytest.mark.parametrize(
    "expected_model,field_name",
    [
        (
            EmployerSummerVoucher if field == "is_exported" else EmployerApplication,
            field,
        )
        for field in sorted(
            EmployerApplicationApproverService.ExtraArguments.__annotations__
        )
    ],
)
def test_approver_extra_arguments_are_expected_model_fields(expected_model, field_name):
    """
    Test that EmployerApplicationApproverService.ExtraArguments keys are
    fields of expected models.
    """
    assert expected_model._meta.get_field(field_name) is not None


@pytest.mark.parametrize("action_name", _APPROVER_ACTIONS)
def test_approver_actions_are_defined_on_viewset(action_name):
    """
    Test that known approver actions are defined on EmployerApplicationViewSet.
    """
    viewset_extra_actions = {
        action.__name__ for action in EmployerApplicationViewSet.get_extra_actions()
    }

    assert action_name in viewset_extra_actions


@pytest.mark.parametrize("action_name", _APPROVER_ACTIONS)
def test_approver_actions_require_approver_permission(action_name):
    """
    Test that known approver actions require ApproverPermission.
    """
    action = getattr(EmployerApplicationViewSet, action_name)

    assert ApproverPermission in action.kwargs["permission_classes"]


@pytest.mark.parametrize(
    "mock_flag,expected_status_code,expected_app_status",
    [
        (False, 403, EmployerApplicationStatus.PAYMENT_REVIEW),
        (True, 200, EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT),
    ],
)
@pytest.mark.django_db
def test_accept_for_payment_follows_mock_flag_when_no_approver_groups_configured(
    settings, approver_client, mock_flag, expected_status_code, expected_app_status
):
    """
    Without mock mode, an empty ADFS_APPROVER_GROUP_UUIDS denies access.
    Mock mode grants access to any authenticated user.
    """
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    settings.ADFS_APPROVER_GROUP_UUIDS = []
    app = EmployerApplicationFactory(status=EmployerApplicationStatus.PAYMENT_REVIEW)

    response = post_single_application_approver_action(
        approver_client, app.id, "accept-for-payment"
    )

    assert response.status_code == expected_status_code
    app.refresh_from_db()
    assert app.status == expected_app_status


@pytest.mark.django_db
def test_accept_for_payment(
    approver_client, staff_user, frozen_action_time, old_field_values
):
    """
    Test the approver's accept_for_payment endpoint.
    """
    voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory(
            **old_field_values,
            status=EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        is_exported=True,
        invoiced_at=None,
    )
    app = voucher.application
    assert app.assignee is not None
    assert voucher.is_exported is True

    response = post_single_application_approver_action(
        approver_client, app.id, "accept-for-payment"
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == [str(app.id)]
    assert response.data["failed_ids"] == []
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT
    assert app.assignee is None
    assert app.summer_vouchers.count() == 1
    assert app.summer_vouchers.first().is_exported is False
    assert app.handler == old_field_values["handler"]
    assert app.handled_at == old_field_values["handled_at"]
    assert app.approver == staff_user
    assert app.accepted_for_payment_at == frozen_action_time


@pytest.mark.django_db
def test_approver_reject(
    approver_client, staff_user, frozen_action_time, old_field_values
):
    """
    Test the approver's approver_reject endpoint.
    """

    voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory(
            **old_field_values,
            status=EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        is_exported=True,
        invoiced_at=None,
    )
    app = voucher.application
    assert app.assignee is not None
    assert voucher.is_exported is True

    response = post_single_application_approver_action(
        approver_client, app.id, "approver-reject"
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == [str(app.id)]
    assert response.data["failed_ids"] == []
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.REJECTED
    assert app.assignee is None
    assert app.summer_vouchers.count() == 1
    assert app.summer_vouchers.first().is_exported is True
    assert app.handler == staff_user
    assert app.handled_at == frozen_action_time
    assert app.approver is None
    assert app.accepted_for_payment_at is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "additional_info_provided_at,expected_app_status",
    [
        (None, EmployerApplicationStatus.SUBMITTED),
        (
            "2024-01-01T00:00:00Z",
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
    ],
)
def test_return_to_handler_queue(
    approver_client, old_field_values, additional_info_provided_at, expected_app_status
):
    """
    Test the approver's return_to_handler_queue endpoint.
    """
    voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory(
            **old_field_values,
            status=EmployerApplicationStatus.PAYMENT_REVIEW,
            additional_info_provided_at=additional_info_provided_at,
        ),
        is_exported=True,
        invoiced_at=None,
    )
    app = voucher.application
    assert app.assignee is not None
    assert voucher.is_exported is True

    response = post_single_application_approver_action(
        approver_client, app.id, "return-to-handler-queue"
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == [str(app.id)]
    assert response.data["failed_ids"] == []
    app.refresh_from_db()
    assert app.status == expected_app_status
    assert app.assignee is None
    assert app.summer_vouchers.count() == 1
    assert app.summer_vouchers.first().is_exported is False
    assert app.handler is None
    assert app.handled_at is None
    assert app.approver is None
    assert app.accepted_for_payment_at is None


@pytest.mark.django_db
def test_return_to_payment_review(approver_client, old_field_values):
    """
    Test the approver's return_to_payment_review endpoint.
    """
    voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory(
            **old_field_values,
            status=EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        is_exported=True,
        invoiced_at=None,
    )
    app = voucher.application
    assert app.assignee is not None
    assert voucher.is_exported is True

    response = post_single_application_approver_action(
        approver_client, app.id, "return-to-payment-review"
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == [str(app.id)]
    assert response.data["failed_ids"] == []
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.PAYMENT_REVIEW
    assert app.assignee is None
    assert app.summer_vouchers.count() == 1
    assert app.summer_vouchers.first().is_exported is True
    assert app.handler == old_field_values["handler"]
    assert app.handled_at == old_field_values["handled_at"]
    assert app.approver is None
    assert app.accepted_for_payment_at is None


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_regular_handler_cannot_apply_payment_review_transition(staff_client):
    app = EmployerApplicationFactory(status=EmployerApplicationStatus.PAYMENT_REVIEW)

    response = post_single_application_approver_action(
        staff_client, app.id, "accept-for-payment"
    )

    assert response.status_code == 403
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.PAYMENT_REVIEW


@pytest.mark.django_db
def test_approver_reject_reports_failure_for_invalid_source_status(approver_client):
    app = EmployerApplicationFactory(
        status=EmployerApplicationStatus.APPLICATION_HANDLING
    )

    response = post_single_application_approver_action(
        approver_client, app.id, "approver-reject"
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == []
    assert response.data["failed_ids"] == [str(app.id)]
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.APPLICATION_HANDLING


@pytest.mark.parametrize("action", _APPROVER_ACTIONS)
@pytest.mark.django_db
def test_approver_action_reports_unknown_application_as_failed(approver_client, action):
    application_id = uuid4()
    assert not EmployerApplication.objects.filter(id=application_id).exists()
    response = post_single_application_approver_action(
        approver_client, application_id, action
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == []
    assert response.data["failed_ids"] == [str(application_id)]


@pytest.mark.django_db
def test_accept_for_payment_with_success_and_failure_simultaneously(
    approver_client,
):
    """
    Test that accept_for_payment is able to return both successful and failed
    employer application IDs.
    """
    valid_app = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW
    )
    invalid_app = EmployerApplicationFactory(status=EmployerApplicationStatus.SUBMITTED)

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": [valid_app.id, invalid_app.id]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == [str(valid_app.id)]
    assert response.data["failed_ids"] == [str(invalid_app.id)]
    valid_app.refresh_from_db()
    invalid_app.refresh_from_db()
    assert valid_app.status == EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT
    assert invalid_app.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_accept_for_payment_allows_configured_bulk_limit(settings, approver_client):
    settings.APPROVER_BULK_SIZE_LIMIT = 2
    apps = EmployerApplicationFactory.create_batch(
        2,
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
    )

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": [app.id for app in apps]},
        format="json",
    )

    assert response.status_code == 200
    assert set(response.data["successful_ids"]) == {str(app.id) for app in apps}


@pytest.mark.django_db
def test_accept_for_payment_rejects_whole_request_if_over_bulk_limit(
    settings, approver_client
):
    settings.APPROVER_BULK_SIZE_LIMIT = 1
    apps = EmployerApplicationFactory.create_batch(
        2,
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
    )

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": [app.id for app in apps]},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["application_ids"] == "Limit is 1 applications"
    for app in apps:
        app.refresh_from_db()
        assert app.status == EmployerApplicationStatus.PAYMENT_REVIEW


@pytest.mark.django_db
def test_accept_for_payment_returns_200_when_every_application_fails(
    approver_client,
):
    app = EmployerApplicationFactory(status=EmployerApplicationStatus.SUBMITTED)

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": [app.id]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == []
    assert response.data["failed_ids"] == [str(app.id)]
    app.refresh_from_db()
    assert app.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_accept_for_payment_leaves_no_audit_or_timeline_records_for_failures(
    approver_client,
):
    """
    A failed employer application must not leave an audit trace nor
    timeline activity log, because the changes are rolled back using a transaction.
    """
    invalid_app = EmployerApplicationFactory(status=EmployerApplicationStatus.SUBMITTED)
    content_type = ContentType.objects.get_for_model(EmployerApplication)
    update_log_entries_before = LogEntry.objects.filter(
        content_type=content_type,
        object_pk=str(invalid_app.id),
        action=LogEntry.Action.UPDATE,
    ).count()

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": [invalid_app.id]},
        format="json",
    )

    assert response.status_code == 200
    assert (
        LogEntry.objects.filter(
            content_type=content_type,
            object_pk=str(invalid_app.id),
            action=LogEntry.Action.UPDATE,
        ).count()
        == update_log_entries_before
    )
    assert not TimelineActivityLog.objects.filter(
        application_type="employerapplication",
        application_id=invalid_app.id,
    ).exists()


@pytest.mark.django_db
def test_bulk_return_to_handler_queue_chooses_status_per_application(
    approver_client,
):
    no_additional_info_app = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
        additional_info_provided_at=None,
    )
    additional_info_app = EmployerApplicationFactory(
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
        additional_info_provided_at=timezone.now(),
    )

    response = approver_client.post(
        get_action_url("return-to-handler-queue"),
        {"application_ids": [no_additional_info_app.id, additional_info_app.id]},
        format="json",
    )

    assert response.status_code == 200
    no_additional_info_app.refresh_from_db()
    additional_info_app.refresh_from_db()
    assert no_additional_info_app.status == EmployerApplicationStatus.SUBMITTED
    assert (
        additional_info_app.status
        == EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
    )


@pytest.mark.django_db
def test_successful_accept_for_payment_adds_audit_and_timeline_records(
    approver_client,
):
    apps = EmployerApplicationFactory.create_batch(
        2,
        status=EmployerApplicationStatus.PAYMENT_REVIEW,
    )
    app_ids = [str(app.id) for app in apps]
    content_type = ContentType.objects.get_for_model(EmployerApplication)
    update_log_entries_before = LogEntry.objects.filter(
        content_type=content_type,
        object_pk__in=app_ids,
        action=LogEntry.Action.UPDATE,
    ).count()

    response = approver_client.post(
        get_action_url("accept-for-payment"),
        {"application_ids": app_ids},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["successful_ids"] == app_ids
    assert (
        LogEntry.objects.filter(
            content_type=content_type,
            object_pk__in=app_ids,
            action=LogEntry.Action.UPDATE,
        ).count()
        == update_log_entries_before + 2
    )
    assert (
        TimelineActivityLog.objects.filter(
            application_type="employerapplication",
            application_id__in=app_ids,
            old_value=EmployerApplicationStatus.PAYMENT_REVIEW,
            new_value=EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ).count()
        == 2
    )
