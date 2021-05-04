import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient

from applications.tests.factories import ApplicationFactory, UserFactory


@pytest.fixture
def api_client():
    user = UserFactory()
    permissions = Permission.objects.all()
    user.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(user)
    return client


@pytest.fixture
def application():
    return ApplicationFactory()
