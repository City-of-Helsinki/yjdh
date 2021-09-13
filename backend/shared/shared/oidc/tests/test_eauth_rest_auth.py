import re
from unittest import mock

import pytest
from django.conf import settings
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import override_settings, RequestFactory

from shared.oidc.auth import EAuthRestAuthentication


@pytest.mark.django_db
@override_settings(
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
)
def test_eauth_rest_auth_success(requests_mock, eauthorization_profile):
    factory = RequestFactory()
    request = factory.get("/")
    user = eauthorization_profile.oidc_profile.user
    request.user = user

    session_middleware = SessionMiddleware()
    session_middleware.process_request(request)
    request.session.save()

    organization_roles_json = [
        {
            "name": "Activenakusteri Oy",
            "identifier": "7769480-5",
            "complete": True,
            "roles": ["NIMKO"],
        }
    ]

    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, json=organization_roles_json)

    with mock.patch(
        "shared.oidc.auth.SessionAuthentication.authenticate", return_value=(user, None)
    ):
        eauth_rest_auth = EAuthRestAuthentication()
        user, auth = eauth_rest_auth.authenticate(request)

    assert user == eauthorization_profile.oidc_profile.user
    assert request.session["organization_roles"] == organization_roles_json[0]


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True)
def test_eauth_rest_auth_success_mock(user):
    factory = RequestFactory()
    request = factory.get("/")
    request.user = user

    with mock.patch(
        "shared.oidc.auth.SessionAuthentication.authenticate", return_value=(user, None)
    ):
        eauth_rest_auth = EAuthRestAuthentication()
        user, auth = eauth_rest_auth.authenticate(request)

    assert user.oidc_profile.eauthorization_profile


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
