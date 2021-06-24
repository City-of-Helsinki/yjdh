from unittest import mock

import pytest
from django.test import RequestFactory

from shared.oidc.auth import EAuthRestAuthentication


@pytest.mark.django_db
def test_eauth_rest_auth_success(eauthorization_profile):
    factory = RequestFactory()
    request = factory.get("/")
    user = eauthorization_profile.oidc_profile.user
    request.user = user

    with mock.patch(
        "shared.oidc.auth.SessionAuthentication.authenticate", return_value=(user, None)
    ):
        eauth_rest_auth = EAuthRestAuthentication()
        user, auth = eauth_rest_auth.authenticate(request)

    assert user == eauthorization_profile.oidc_profile.user


@pytest.mark.django_db
def test_eauth_rest_auth_failure_missing_access_token(eauthorization_profile):
    factory = RequestFactory()
    request = factory.get("/")
    user = eauthorization_profile.oidc_profile.user
    request.user = user

    eauthorization_profile.access_token = ""
    eauthorization_profile.save()

    with mock.patch(
        "shared.oidc.auth.SessionAuthentication.authenticate", return_value=(user, None)
    ):
        eauth_rest_auth = EAuthRestAuthentication()
        user_auth_tuple = eauth_rest_auth.authenticate(request)

    assert user_auth_tuple is None


def test_eauth_rest_auth_failure():
    factory = RequestFactory()
    request = factory.get("/")

    with mock.patch(
        "shared.oidc.auth.SessionAuthentication.authenticate", return_value=None
    ):
        eauth_rest_auth = EAuthRestAuthentication()
        user_auth_tuple = eauth_rest_auth.authenticate(request)

    assert user_auth_tuple is None
