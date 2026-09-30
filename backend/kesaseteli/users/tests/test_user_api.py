from uuid import uuid4

import pytest
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.reverse import reverse

APPROVER_GROUP_UUID = uuid4()


@pytest.fixture(autouse=True)
def set_adfs_approver_group_uuids(settings):
    settings.ADFS_APPROVER_GROUP_UUIDS = [str(APPROVER_GROUP_UUID)]


@pytest.fixture(autouse=True)
def disable_mock_flag(settings):
    settings.NEXT_PUBLIC_MOCK_FLAG = False


@pytest.fixture
def approver_user(user):
    group = Group.objects.create(name=f"adfs-{APPROVER_GROUP_UUID}")
    user.groups.add(group)
    return user


@pytest.mark.django_db
def test_current_user_identifies_approver_independent_of_staff_status(
    approver_user, user_client
):
    response = user_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_staff"] is False
    assert response.json()["is_approver"] is True


@pytest.mark.django_db
def test_staff_status_does_not_make_current_user_an_approver(staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_staff"] is True
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_is_not_approver_when_no_groups_configured(
    settings, approver_user, user_client
):
    settings.ADFS_APPROVER_GROUP_UUIDS = []

    response = user_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_is_approver_in_mock_mode(settings, user_client):
    settings.NEXT_PUBLIC_MOCK_FLAG = True

    response = user_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_approver"] is True


@pytest.mark.django_db
def test_current_user_is_approver_when_superuser(superuser_client):
    response = superuser_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_approver"] is True


@pytest.mark.django_db
def test_current_user_returns_expected_fields(user_client):
    response = user_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert set(response.json()) == {
        "id",
        "first_name",
        "last_name",
        "is_staff",
        "is_approver",
    }


@pytest.mark.django_db
def test_current_user_returns_the_requesting_user(staff_user, staff_client):
    response = staff_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == staff_user.id
    assert response.json()["first_name"] == staff_user.first_name
    assert response.json()["last_name"] == staff_user.last_name
    assert response.json()["is_staff"] is True


@pytest.mark.django_db
def test_current_user_is_available_to_authenticated_non_approvers(user_client):
    response = user_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_staff"] is False
    assert response.json()["is_approver"] is False


@pytest.mark.django_db
def test_current_user_denies_anonymous_users(client):
    response = client.get(reverse("users-me"))
    assert response.status_code == status.HTTP_403_FORBIDDEN
