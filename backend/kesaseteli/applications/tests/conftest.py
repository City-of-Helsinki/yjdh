import os
import random
from datetime import timedelta

import factory.random
import pytest
from django.conf import settings
from langdetect import DetectorFactory

from applications.target_groups import get_target_group_choices
from applications.tests.factories import SummerVoucherConfigurationFactory
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
def seed_default_configuration_for_tests(db):
    target_groups = [identifier for identifier, _ in get_target_group_choices()]
    # Create config for years 2021-2027 to cover most test cases
    for year in range(2021, 2028):
        SummerVoucherConfigurationFactory(
            year=year,
            target_group=target_groups,
            voucher_value_in_euros=325 if year < 2024 else 350,
            min_work_compensation_in_euros=400 if year < 2024 else 500,
            min_work_hours=60,
        )
