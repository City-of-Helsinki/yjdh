import pytest
from django.test import Client

from oidc.tests.factories import (
    EAuthorizationProfileFactory,
    OIDCProfileFactory,
    UserFactory,
)


@pytest.fixture()
def user():
    return UserFactory()


@pytest.fixture
def oidc_profile():
    return OIDCProfileFactory()


@pytest.fixture
def eauthorization_profile():
    return EAuthorizationProfileFactory()


@pytest.fixture
def client():
    client = Client()
    return client


@pytest.fixture
def user_client(user):
    client = Client()
    client.force_login(user)
    return client
