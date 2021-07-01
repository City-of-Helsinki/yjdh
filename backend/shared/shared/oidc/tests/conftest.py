import pytest
from shared.oidc.tests.factories import EAuthorizationProfileFactory, OIDCProfileFactory
from shared.common.tests.conftest import *  # noqa


@pytest.fixture
def oidc_profile():
    return OIDCProfileFactory()


@pytest.fixture
def eauthorization_profile():
    return EAuthorizationProfileFactory()
