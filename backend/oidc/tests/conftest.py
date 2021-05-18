import pytest
from django.test import Client

from applications.tests.conftest import *  # noqa
from oidc.tests.factories import OIDCProfileFactory


@pytest.fixture
def oidc_profile():
    return OIDCProfileFactory()


@pytest.fixture
def client():
    client = Client()
    return client
