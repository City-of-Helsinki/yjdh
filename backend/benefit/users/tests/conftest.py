import pytest

from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa

from .factories import UserFactory


@pytest.fixture
def admin_user():
    user = UserFactory()
    user.is_staff = True
    user.save()
    return user
