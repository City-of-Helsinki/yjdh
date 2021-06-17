import pytest
from django.test import Client
from shared.azure_adfs.tests.factories import UserFactory


@pytest.fixture
def user():
    return UserFactory()


@pytest.fixture
def client():
    client = Client()
    return client
