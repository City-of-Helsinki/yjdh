from datetime import timedelta

import pytest
from django.test import Client
from django.utils import timezone

from shared.common.tests.factories import UserFactory


def store_tokens_in_session(client):
    s = client.session
    s.update(
        {
            "oidc_id_token": "test",
            "oidc_access_token": "test",
            "oidc_refresh_token": "test",
            "oidc_access_token_expires": (
                timezone.now() + timedelta(hours=1)
            ).isoformat(),
            "oidc_refresh_token_expires": (
                timezone.now() + timedelta(hours=1)
            ).isoformat(),
            "eauth_id_token": "test",
            "eauth_access_token": "test",
            "eauth_refresh_token": "test",
            "eauth_access_token_expires": (
                timezone.now() + timedelta(hours=1)
            ).isoformat(),
            "eauth_refresh_token_expires": (
                timezone.now() + timedelta(hours=1)
            ).isoformat(),
        }
    )
    s.save()


@pytest.fixture()
def user():
    return UserFactory()


@pytest.fixture()
def staff_user():
    return UserFactory(is_staff=True)


@pytest.fixture()
def superuser_user():
    return UserFactory(is_superuser=True)


@pytest.fixture()
def other_user():
    return UserFactory()


@pytest.fixture
def client():
    client = Client()
    return client


@pytest.fixture
def staff_client(staff_user):
    client = Client()
    client.force_login(staff_user)
    return client


@pytest.fixture
def superuser_client(superuser_user):
    client = Client()
    client.force_login(superuser_user)
    return client


@pytest.fixture
def user_client(user):
    client = Client()
    client.force_login(user)
    store_tokens_in_session(client)
    return client
