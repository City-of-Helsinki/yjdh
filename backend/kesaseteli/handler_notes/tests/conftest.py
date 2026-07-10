import pytest
from rest_framework.test import APIClient

from shared.common.tests.factories import UserFactory


@pytest.fixture
def user():
    return UserFactory()


@pytest.fixture
def staff_client(user):
    user.is_staff = True
    user.save()
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def api_client():
    client = APIClient()
    # Unauthenticated
    return client
