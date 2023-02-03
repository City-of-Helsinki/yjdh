import pytest
from rest_framework.test import APIClient

from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from shared.common.tests.factories import HelsinkiProfileUserFactory


@pytest.fixture
def gdpr_api_client():
    return APIClient()


@pytest.fixture
def user():
    return HelsinkiProfileUserFactory()
