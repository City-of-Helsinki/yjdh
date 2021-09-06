import factory.random
import pytest
from django.contrib.auth.models import Permission
from freezegun import freeze_time
from rest_framework.test import APIClient

from shared.oidc.tests.factories import EAuthorizationProfileFactory


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    factory.random.reseed_random("777")
    with freeze_time("2021-06-04"):
        yield


@pytest.fixture
def user():
    eauth_profile = EAuthorizationProfileFactory()
    return eauth_profile.oidc_profile.user


@pytest.fixture
def api_client(user):
    permissions = Permission.objects.all()
    user.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(user)
    return client
