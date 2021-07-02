from datetime import datetime, timezone
from typing import Callable

from pytest import fixture
from shared.common.tests.conftest import *  # noqa


@fixture
def fixed_datetime() -> Callable[[], datetime]:
    return lambda: datetime(2020, 6, 1, tzinfo=timezone.utc)
