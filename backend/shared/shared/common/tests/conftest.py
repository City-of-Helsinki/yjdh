import pytest
from django.test import Client
from shared.common.tests.factories import UserFactory


@pytest.fixture()
def user():
    return UserFactory()


@pytest.fixture()
def other_user():
    return UserFactory()


@pytest.fixture
def client():
    client = Client()
    return client


@pytest.fixture
def user_client(user):
    client = Client()
    client.force_login(user)
    return client
