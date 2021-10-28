import factory.random
import pytest
from django.contrib.auth.models import Permission
from freezegun import freeze_time
from rest_framework.test import APIClient

from shared.common.tests.conftest import *  # noqa
from shared.common.tests.conftest import store_tokens_in_session


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    factory.random.reseed_random("777")
    with freeze_time("2021-06-04"):
        yield


@pytest.fixture
def bf_user(user):
    return user


@pytest.fixture
def api_client(bf_user):
    permissions = Permission.objects.all()
    bf_user.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(bf_user)
    store_tokens_in_session(client)
    return client


@pytest.fixture
def anonymous_client():
    client = APIClient()
    return client
