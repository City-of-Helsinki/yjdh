import os

import pytest
from django.conf import settings

from common.tests.conftest import *  # noqa


@pytest.fixture
def excel_root():
    if not os.path.exists(settings.EXCEL_ROOT):
        os.makedirs(settings.EXCEL_ROOT)
    return settings.EXCEL_ROOT
