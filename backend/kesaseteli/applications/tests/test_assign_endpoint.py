from datetime import timedelta

import pytest
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from applications.enums import EmployerApplicationStatus, YouthApplicationStatus
from applications.exceptions import OptimisticLockError
from applications.models import EmployerApplication, YouthApplication
from shared.common.tests.factories import StaffUserFactory, UserFactory


@pytest.mark.django_db
def test_youth_application_assign_endpoint_success(
    api_client, youth_application, staff_user
):
    """
    Test that a handler can successfully assign a youth application to themselves.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})
    payload = {
        "modified_at": youth_application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["assignee"] == {
        "id": staff_user.username,
        "name": staff_user.get_full_name() or staff_user.username,
    }
    youth_application.refresh_from_db()
    assert youth_application.assignee == staff_user
    assert youth_application.status == YouthApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
def test_employer_application_assign_endpoint_success(
    api_client, application, staff_user
):
    """
    Test that a handler can successfully assign an employer application to themselves.
    Note: 'application' fixture is the employer application.
    """
    application.status = EmployerApplicationStatus.SUBMITTED
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-assign", kwargs={"pk": application.id})
    payload = {
        "modified_at": application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["assignee"] == {
        "id": staff_user.username,
        "name": staff_user.get_full_name() or staff_user.username,
    }
    application.refresh_from_db()
    assert application.assignee == staff_user
    assert application.status == EmployerApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
def test_youth_application_assign_endpoint_optimistic_lock_failure(
    api_client, youth_application, staff_user
):
    """
    Test that the assign endpoint returns 409 Conflict if modified_at is stale.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})
    stale_modified_at = youth_application.modified_at - timedelta(hours=1)
    payload = {"modified_at": stale_modified_at.isoformat().replace("+00:00", "Z")}
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_409_CONFLICT
    assert (
        response.data["detail"] == "The application has been modified by someone else."
    )


@pytest.mark.django_db
def test_assign_endpoint_detects_microsecond_conflict(
    api_client, youth_application, staff_user
):
    """
    Test that the assign endpoint returns 409 Conflict even if modified_at differs
    only by microseconds.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})
    microsecond_stale = youth_application.modified_at - timedelta(microseconds=500)
    payload = {"modified_at": microsecond_stale.isoformat().replace("+00:00", "Z")}
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_409_CONFLICT
    assert (
        response.data["detail"] == "The application has been modified by someone else."
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "url_name,is_assign",
    [
        ("v1:youthapplication-assign", True),
        ("v1:youthapplication-unassign", False),
    ],
)
def test_youth_application_assign_and_unassign_reject_unauthenticated_user(
    unauthenticated_api_client, youth_application, url_name, is_assign
):
    """
    Test that an unauthenticated user cannot access youth application assign/unassign endpoints.
    """
    url = reverse(url_name, kwargs={"pk": youth_application.id})
    payload = (
        {
            "modified_at": youth_application.modified_at.isoformat().replace(
                "+00:00", "Z"
            )
        }
        if is_assign
        else None
    )
    response = unauthenticated_api_client.post(url, data=payload, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.parametrize(
    "url_name,is_assign",
    [
        ("v1:employerapplication-assign", True),
        ("v1:employerapplication-unassign", False),
    ],
)
def test_employer_application_assign_and_unassign_reject_unauthenticated_user(
    unauthenticated_api_client, application, url_name, is_assign
):
    """
    Test that an unauthenticated user cannot access employer application assign/unassign endpoints.
    """
    url = reverse(url_name, kwargs={"pk": application.id})
    payload = (
        {"modified_at": application.modified_at.isoformat().replace("+00:00", "Z")}
        if is_assign
        else None
    )
    response = unauthenticated_api_client.post(url, data=payload, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "url_name,is_assign",
    [
        ("v1:youthapplication-assign", True),
        ("v1:youthapplication-unassign", False),
    ],
)
def test_youth_application_assign_and_unassign_reject_unauthorized_user(
    api_client, youth_application, staff_user, url_name, is_assign
):
    """
    Test that an authenticated non-handler user cannot access youth application assign/unassign endpoints.
    """
    if not is_assign:
        youth_application.assignee = staff_user
        youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
        youth_application.save()

    non_handler = UserFactory(is_staff=False, is_superuser=False)
    api_client.force_authenticate(user=non_handler)

    url = reverse(url_name, kwargs={"pk": youth_application.id})
    payload = (
        {
            "modified_at": youth_application.modified_at.isoformat().replace(
                "+00:00", "Z"
            )
        }
        if is_assign
        else None
    )
    response = api_client.post(url, data=payload, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "url_name,is_assign",
    [
        ("v1:employerapplication-assign", True),
        ("v1:employerapplication-unassign", False),
    ],
)
def test_employer_application_assign_and_unassign_reject_unauthorized_user(
    api_client, application, staff_user, url_name, is_assign
):
    """
    Test that an authenticated non-handler user cannot access employer application assign/unassign endpoints.
    """
    if is_assign:
        application.status = EmployerApplicationStatus.SUBMITTED
    else:
        application.assignee = staff_user
        application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.save()

    non_handler = UserFactory(is_staff=False, is_superuser=False)
    api_client.force_authenticate(user=non_handler)

    url = reverse(url_name, kwargs={"pk": application.id})
    payload = (
        {"modified_at": application.modified_at.isoformat().replace("+00:00", "Z")}
        if is_assign
        else None
    )
    response = api_client.post(url, data=payload, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.parametrize(
    "has_additional_info, expected_status",
    [
        (True, YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED),
        (False, YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED),
    ],
)
def test_youth_application_unassign_endpoint_success(
    api_client, youth_application, staff_user, has_additional_info, expected_status
):
    """
    Test that a handler can successfully unassign a youth application from themselves
    and the status correctly reverts based on whether additional info was provided.
    """
    if has_additional_info:
        youth_application.additional_info_provided_at = timezone.now()
    else:
        youth_application.additional_info_provided_at = None
    youth_application.assignee = staff_user
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-unassign", kwargs={"pk": youth_application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["assignee"] is None
    youth_application.refresh_from_db()
    assert youth_application.assignee is None
    assert youth_application.status == expected_status


@pytest.mark.django_db
def test_employer_application_unassign_endpoint_success(
    api_client, application, staff_user
):
    """
    Test that a handler can successfully unassign an employer application.
    """
    application.assignee = staff_user
    application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-unassign", kwargs={"pk": application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["assignee"] is None
    application.refresh_from_db()
    assert application.assignee is None
    assert application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_youth_application_unassign_rejects_non_assignee(
    api_client, youth_application, staff_user
):
    """
    Test that a handler cannot unassign a youth application assigned to another handler.
    """
    other_user = StaffUserFactory()
    youth_application.assignee = other_user
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-unassign", kwargs={"pk": youth_application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    youth_application.refresh_from_db()
    assert youth_application.assignee == other_user
    assert youth_application.status == YouthApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_status",
    [
        YouthApplicationStatus.AWAITING_MANUAL_PROCESSING,
        YouthApplicationStatus.ACCEPTED,
        YouthApplicationStatus.REJECTED,
        YouthApplicationStatus.SUBMITTED,
    ],
)
def test_youth_application_unassign_rejects_invalid_status(
    api_client, youth_application, staff_user, invalid_status
):
    """
    Test that unassigning a youth application not in APPLICATION_HANDLING status is rejected.
    """
    youth_application.assignee = staff_user
    youth_application.status = invalid_status
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-unassign", kwargs={"pk": youth_application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    youth_application.refresh_from_db()
    assert youth_application.status == invalid_status


@pytest.mark.django_db
def test_employer_application_unassign_rejects_non_assignee(
    api_client, application, staff_user
):
    """
    Test that a handler cannot unassign an employer application assigned to another handler.
    """
    other_user = StaffUserFactory()
    application.assignee = other_user
    application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-unassign", kwargs={"pk": application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    application.refresh_from_db()
    assert application.assignee == other_user
    assert application.status == EmployerApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_status",
    [
        EmployerApplicationStatus.SUBMITTED,
        EmployerApplicationStatus.DRAFT,
        EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        EmployerApplicationStatus.REJECTED,
    ],
)
def test_employer_application_unassign_rejects_invalid_status(
    api_client, application, staff_user, invalid_status
):
    """
    Test that unassigning an employer application not in APPLICATION_HANDLING status is rejected.
    """
    application.assignee = staff_user
    application.status = invalid_status
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-unassign", kwargs={"pk": application.id})
    response = api_client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    application.refresh_from_db()
    assert application.status == invalid_status


@pytest.mark.django_db
def test_youth_application_assign_allows_reassigning(
    api_client, youth_application, staff_user
):
    """
    Test that assigning a youth application already assigned to another user succeeds.
    """
    other_user = StaffUserFactory()
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.assignee = other_user
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})
    payload = {
        "modified_at": youth_application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    youth_application.refresh_from_db()
    assert youth_application.assignee == staff_user


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_status",
    [
        YouthApplicationStatus.ACCEPTED,
        YouthApplicationStatus.REJECTED,
        YouthApplicationStatus.SUBMITTED,
    ],
)
def test_youth_application_assign_rejects_invalid_status(
    api_client, youth_application, staff_user, invalid_status
):
    """
    Test that YouthApplication.assign() raises ValueError and the assign endpoint
    returns 400 for statuses not in active_unhandled_values().
    """
    youth_application.status = invalid_status
    youth_application.save()

    with pytest.raises(ValueError, match="Cannot assign youth application with status"):
        youth_application.assign(staff_user, youth_application.modified_at)

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})
    payload = {
        "modified_at": youth_application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["detail"] == "Application cannot be assigned."


@pytest.mark.django_db
@pytest.mark.parametrize(
    "valid_status",
    YouthApplicationStatus.active_unhandled_values(),
)
def test_youth_application_assign_accepts_active_unhandled_statuses(
    youth_application, staff_user, valid_status
):
    """
    Test that YouthApplication.assign() succeeds for all statuses in
    active_unhandled_values().
    """
    youth_application.status = valid_status
    youth_application.save()

    youth_application.assign(staff_user, youth_application.modified_at)
    youth_application.refresh_from_db()
    assert youth_application.assignee == staff_user
    assert youth_application.status == YouthApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
def test_employer_application_assign_allows_reassigning(
    api_client, application, staff_user
):
    """
    Test that assigning an employer application already assigned to another user succeeds.
    """
    other_user = StaffUserFactory()
    application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.assignee = other_user
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-assign", kwargs={"pk": application.id})
    payload = {
        "modified_at": application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    application.refresh_from_db()
    assert application.assignee == staff_user


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_status",
    [
        EmployerApplicationStatus.DRAFT,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        EmployerApplicationStatus.PAYMENT_REVIEW,
        EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
        EmployerApplicationStatus.REJECTED,
        EmployerApplicationStatus.CANCELLED,
    ],
)
def test_employer_application_assign_rejects_invalid_status(
    api_client, application, staff_user, invalid_status
):
    """
    Test that EmployerApplication.assign() raises ValueError and the assign endpoint
    returns 400 for statuses not permitted to enter APPLICATION_HANDLING.
    """
    application.status = invalid_status
    application.save()

    with pytest.raises(
        ValueError, match="Cannot assign employer application with status"
    ):
        application.assign(staff_user, application.modified_at)

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-assign", kwargs={"pk": application.id})
    payload = {
        "modified_at": application.modified_at.isoformat().replace("+00:00", "Z")
    }
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["detail"] == "Application cannot be assigned."


@pytest.mark.django_db
@pytest.mark.parametrize(
    "valid_status",
    [
        EmployerApplicationStatus.SUBMITTED,
        EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        EmployerApplicationStatus.ERROR_IN_PAYMENT,
        EmployerApplicationStatus.APPLICATION_HANDLING,
    ],
)
def test_employer_application_assign_accepts_valid_statuses(
    application, staff_user, valid_status
):
    """
    Test that EmployerApplication.assign() succeeds for statuses permitted to
    enter APPLICATION_HANDLING.
    """
    application.status = valid_status
    application.save()

    application.assign(staff_user, application.modified_at)
    application.refresh_from_db()
    assert application.assignee == staff_user
    assert application.status == EmployerApplicationStatus.APPLICATION_HANDLING


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_modified_at",
    [
        None,
        123,
        True,
        [],
        {},
        "not-a-date",
        "2026-09-22T10:00:00",
        "2026-09-22",
    ],
)
def test_youth_application_assign_endpoint_rejects_invalid_modified_at(
    api_client, youth_application, staff_user, invalid_modified_at
):
    """
    Test that youth application assign endpoint returns 400 Bad Request
    when modified_at is missing, non-string, invalid, or timezone-less.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:youthapplication-assign", kwargs={"pk": youth_application.id})

    payload = (
        {} if invalid_modified_at is None else {"modified_at": invalid_modified_at}
    )
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "modified_at" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "invalid_modified_at",
    [
        None,
        123,
        True,
        [],
        {},
        "not-a-date",
        "2026-09-22T10:00:00",
        "2026-09-22",
    ],
)
def test_employer_application_assign_endpoint_rejects_invalid_modified_at(
    api_client, application, staff_user, invalid_modified_at
):
    """
    Test that employer application assign endpoint returns 400 Bad Request
    when modified_at is missing, non-string, invalid, or timezone-less.
    """
    application.status = EmployerApplicationStatus.SUBMITTED
    application.save()

    api_client.force_authenticate(user=staff_user)
    url = reverse("v1:employerapplication-assign", kwargs={"pk": application.id})

    payload = (
        {} if invalid_modified_at is None else {"modified_at": invalid_modified_at}
    )
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "modified_at" in response.data


@pytest.mark.django_db
def test_youth_application_assign_atomic_optimistic_lock_db_conflict(
    youth_application, staff_user
):
    """
    Test that YouthApplication.assign() detects database updates made after
    in-memory object was loaded and raises OptimisticLockError atomically.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    payload_modified_at = youth_application.modified_at

    # Simulate another transaction updating the record in the database
    YouthApplication.objects.filter(pk=youth_application.pk).update(
        modified_at=youth_application.modified_at + timedelta(seconds=10)
    )

    with pytest.raises(
        OptimisticLockError, match="The application has been modified by someone else."
    ):
        youth_application.assign(staff_user, payload_modified_at)

    youth_application.refresh_from_db()
    assert youth_application.assignee is None
    assert youth_application.status == YouthApplicationStatus.AWAITING_MANUAL_PROCESSING


@pytest.mark.django_db
def test_employer_application_assign_atomic_optimistic_lock_db_conflict(
    application, staff_user
):
    """
    Test that EmployerApplication.assign() detects database updates made after
    in-memory object was loaded and raises OptimisticLockError atomically.
    """
    application.status = EmployerApplicationStatus.SUBMITTED
    application.save()

    payload_modified_at = application.modified_at

    # Simulate another transaction updating the record in the database
    EmployerApplication.objects.filter(pk=application.pk).update(
        modified_at=application.modified_at + timedelta(seconds=10)
    )

    with pytest.raises(
        OptimisticLockError, match="The application has been modified by someone else."
    ):
        application.assign(staff_user, payload_modified_at)

    application.refresh_from_db()
    assert application.assignee is None
    assert application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_assign_updates_in_memory_instance_attributes(youth_application, staff_user):
    """
    Test that successful assign updates in-memory attributes on self.
    """
    youth_application.status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    youth_application.save()

    payload_modified_at = youth_application.modified_at
    initial_modified_at = youth_application.modified_at

    youth_application.assign(staff_user, payload_modified_at)

    assert youth_application.assignee == staff_user
    assert youth_application.assignee_id == staff_user.pk
    assert youth_application.status == YouthApplicationStatus.APPLICATION_HANDLING
    assert youth_application.modified_at > initial_modified_at


@pytest.mark.django_db
@pytest.mark.parametrize(
    "terminal_status",
    [YouthApplicationStatus.ACCEPTED, YouthApplicationStatus.REJECTED],
)
def test_youth_application_handle_clears_assignee(
    youth_application, staff_user, terminal_status
):
    """
    Test that YouthApplication._handle() clears the assignee upon transition
    to terminal statuses (ACCEPTED or REJECTED).
    """
    youth_application.assignee = staff_user
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.save()

    youth_application._handle(
        status=terminal_status,
        handler=staff_user,
        encrypted_handler_vtj_json="",
        automatic_handling=False,
    )

    youth_application.refresh_from_db()
    assert youth_application.assignee is None
    assert youth_application.status == terminal_status


@pytest.mark.django_db
def test_youth_application_unassign_updates_in_memory_instance(
    youth_application, staff_user
):
    """model.unassign() propagates fields back to self."""
    youth_application.assignee = staff_user
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.save()

    youth_application.unassign(staff_user)

    assert youth_application.assignee is None
    assert youth_application.assignee_id is None
    assert youth_application.status in (
        YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
    )


@pytest.mark.django_db
def test_youth_application_unassign_raises_for_wrong_user(
    youth_application, staff_user
):
    """model.unassign() raises ValueError when called by non-assignee."""
    other_user = StaffUserFactory()
    youth_application.assignee = other_user
    youth_application.status = YouthApplicationStatus.APPLICATION_HANDLING
    youth_application.save()

    with pytest.raises(ValueError, match="Cannot unassign youth application"):
        youth_application.unassign(staff_user)


@pytest.mark.django_db
def test_employer_application_unassign_updates_in_memory_instance(
    application, staff_user
):
    """model.unassign() propagates fields back to self."""
    application.assignee = staff_user
    application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.save()

    application.unassign(staff_user)

    assert application.assignee is None
    assert application.assignee_id is None
    assert application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_employer_application_unassign_raises_for_wrong_user(application, staff_user):
    """model.unassign() raises ValueError when called by non-assignee."""
    other_user = StaffUserFactory()
    application.assignee = other_user
    application.status = EmployerApplicationStatus.APPLICATION_HANDLING
    application.save()

    with pytest.raises(ValueError, match="Cannot unassign employer application"):
        application.unassign(staff_user)
