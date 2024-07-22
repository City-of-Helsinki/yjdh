from datetime import timedelta

import pytest
from django.test import Client
from django.utils.timezone import now

from shared.common.tests.factories import (
    StaffSuperuserFactory,
    StaffUserFactory,
    SuperuserFactory,
    UserFactory,
)


def store_tokens_in_session(client):
    s = client.session
    now_plus_1_hour = now() + timedelta(hours=1)
    s.update(
        {
            "oidc_id_token": "test",
            "oidc_access_token": "test",
            "oidc_refresh_token": "test",
            "oidc_access_token_expires": now_plus_1_hour.isoformat(),
            "oidc_refresh_token_expires": now_plus_1_hour.isoformat(),
            "eauth_id_token": "test",
            "eauth_access_token": "test",
            "eauth_refresh_token": "test",
            "eauth_access_token_expires": now_plus_1_hour.isoformat(),
            "eauth_refresh_token_expires": now_plus_1_hour.isoformat(),
        }
    )
    s.save()


def force_login_user(user) -> Client:
    client = Client()
    client.force_login(user)
    return client


@pytest.fixture()
def user():
    return UserFactory()


@pytest.fixture()
def staff_user():
    return StaffUserFactory()


@pytest.fixture()
def superuser_user():
    return SuperuserFactory()


@pytest.fixture()
def staff_superuser_user():
    return StaffSuperuserFactory()


@pytest.fixture()
def other_user():
    return UserFactory()


@pytest.fixture
def client():
    client = Client()
    return client


@pytest.fixture
def staff_client(staff_user):
    return force_login_user(staff_user)


@pytest.fixture
def superuser_client(superuser_user):
    return force_login_user(superuser_user)


@pytest.fixture
def staff_superuser_client(staff_superuser_user):
    return force_login_user(staff_superuser_user)


@pytest.fixture
def user_client(user):
    client = force_login_user(user)
    store_tokens_in_session(client)
    return client
