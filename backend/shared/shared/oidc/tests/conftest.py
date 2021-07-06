import pytest

from shared.common.tests.conftest import *  # noqa
from shared.oidc.tests.factories import EAuthorizationProfileFactory, OIDCProfileFactory


@pytest.fixture
def oidc_profile():
    return OIDCProfileFactory()


@pytest.fixture
def eauthorization_profile():
    return EAuthorizationProfileFactory()
