import random

import factory.random
import pytest
from django.contrib.auth.models import Permission
from django.utils.translation import activate
from freezegun import freeze_time
from langdetect import DetectorFactory
from rest_framework.test import APIClient

from shared.common.tests.conftest import *  # noqa
from shared.common.tests.conftest import store_tokens_in_session


def _api_client():
    return APIClient(HTTP_ACCEPT_LANGUAGE="en")


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    settings.MAILER_EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.DEFAULT_FROM_EMAIL = "noreply@foo.bar"
    settings.LANGUAGE_CODE = "fi"
    settings.DISABLE_TOS_APPROVAL_CHECK = False
    settings.NEXT_PUBLIC_MOCK_FLAG = False
    factory.random.reseed_random("777")
    DetectorFactory.seed = 0
    random.seed(777)
    activate("en")
    with freeze_time("2021-06-04"):
        yield


@pytest.fixture
def bf_user(user):
    return user


@pytest.fixture
def api_client(bf_user):
    permissions = Permission.objects.all()
    bf_user.user_permissions.set(permissions)
    client = _api_client()
    client.force_authenticate(bf_user)
    store_tokens_in_session(client)
    return client


@pytest.fixture
def handler_api_client(admin_user):
    permissions = Permission.objects.all()
    admin_user.user_permissions.set(permissions)
    client = _api_client()
    client.force_authenticate(admin_user)
    return client


@pytest.fixture
def anonymous_client():
    client = _api_client()
    return client


def get_client_user(api_client):
    return api_client.handler._force_user
