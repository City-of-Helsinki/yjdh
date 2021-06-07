import factory.random
import pytest
from django.test.utils import freeze_time


@pytest.fixture(autouse=True)
def setup_test_environment(settings):
    factory.random.reseed_random("777")
    with freeze_time("2021-01-04"):
        yield
