import os

import factory.random
import pytest
from django.conf import settings

from common.tests.conftest import *  # noqa


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    factory.random.reseed_random("888")


@pytest.fixture
def excel_root():
    if not os.path.exists(settings.EXCEL_ROOT):
        os.makedirs(settings.EXCEL_ROOT)
    return settings.EXCEL_ROOT


@pytest.fixture
def make_youth_application_activation_link_expired(settings):
    settings.YOUTH_APPLICATION_ACTIVATION_LINK_EXPIRATION_HOURS = 0


@pytest.fixture
def make_youth_application_activation_link_unexpired(settings):
    settings.YOUTH_APPLICATION_ACTIVATION_LINK_EXPIRATION_HOURS = 24 * 365 * 100
