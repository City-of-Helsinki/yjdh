from uuid import uuid4

import pytest
from django.contrib.auth.models import Group
from rest_framework.reverse import reverse

APPROVER_GROUP_UUID = uuid4()
OTHER_APPROVER_GROUP_UUID = uuid4()


@pytest.fixture(autouse=True)
def approver_group_uuids_setting(settings):
    settings.ADFS_APPROVER_GROUP_UUIDS = [
        str(OTHER_APPROVER_GROUP_UUID),
        str(APPROVER_GROUP_UUID),
    ]


@pytest.fixture
def approver_user(staff_user):
    group = Group.objects.create(name=f"adfs-{APPROVER_GROUP_UUID}")
    staff_user.groups.add(group)
    return staff_user


@pytest.mark.django_db
def test_current_user_identifies_approver(approver_user, staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert response.json()["is_approver"] is True


@pytest.mark.django_db
def test_current_user_is_not_approver_without_the_group(staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_is_not_approver_when_no_groups_configured(
    settings, approver_user, staff_client
):
    settings.ADFS_APPROVER_GROUP_UUIDS = []

    response = staff_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_returns_expected_fields(approver_user, staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "first_name",
        "last_name",
        "is_staff",
        "is_approver",
    }


@pytest.mark.django_db
def test_current_user_returns_the_requesting_user(approver_user, staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert response.json()["first_name"] == approver_user.first_name
    assert response.json()["last_name"] == approver_user.last_name
    assert response.json()["is_staff"] is True


@pytest.mark.django_db
def test_current_user_is_available_to_authenticated_non_handlers(user_client):
    """
    The endpoint is not handler specific: an authenticated non-staff user gets
    their own data with is_approver False, because ApproverPermission requires
    handler permission first.
    """
    response = user_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert response.json()["is_staff"] is False
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_denies_anonymous_users(client):
    """
    Youth users are anonymous, i.e. they never authenticate. DRF is configured
    with SessionAuthentication only (see REST_FRAMEWORK in settings), which sends
    no WWW-Authenticate header, so unauthenticated requests get 403 rather
    than 401.
    """
    response = client.get(reverse("users-me"))

    assert response.status_code == 403
