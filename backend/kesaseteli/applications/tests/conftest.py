import importlib
import os
import random
import sys
from datetime import timedelta

import factory.random
import pytest
from django.conf import settings
from django.urls import clear_url_caches
from langdetect import DetectorFactory

from common.tests.conftest import *  # noqa


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    DetectorFactory.seed = 0
    factory.random.reseed_random("888")
    random.seed(888)


@pytest.fixture
def excel_root():
    if not os.path.exists(settings.EXCEL_ROOT):
        os.makedirs(settings.EXCEL_ROOT)
    return settings.EXCEL_ROOT


@pytest.fixture
def make_youth_application_activation_link_expired(settings):
    settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = 0


@pytest.fixture
def make_youth_application_activation_link_unexpired(settings):
    settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = int(
        timedelta(days=365 * 100).total_seconds()
    )


@pytest.fixture(autouse=True)
def enable_admin_urls(settings):
    settings.ENABLE_ADMIN = True

    # Reload urls to pick up the new setting
    if "kesaseteli.urls" in sys.modules:
        importlib.reload(sys.modules["kesaseteli.urls"])

    clear_url_caches()
