import pytest
from rest_framework.test import APIClient

from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa


@pytest.fixture
def gdpr_api_client():
    return APIClient()
