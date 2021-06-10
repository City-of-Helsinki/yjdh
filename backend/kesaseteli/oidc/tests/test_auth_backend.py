import datetime
import re
from unittest import mock

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import override_settings, RequestFactory
from django.utils import timezone

from oidc.auth import HelsinkiOIDCAuthenticationBackend
from oidc.models import OIDCProfile
from oidc.services import store_token_info_in_oidc_profile


def check_token_info(user, oidc_profile, token_info):
    access_token_expires = timezone.now() + datetime.timedelta(
        seconds=token_info["expires_in"]
    )
    refresh_token_expires = timezone.now() + datetime.timedelta(
        seconds=token_info["refresh_expires_in"]
    )

    assert oidc_profile.user == user
    assert oidc_profile.id_token == token_info["id_token"]
    assert oidc_profile.access_token == token_info["access_token"]
    assert abs(
        oidc_profile.access_token_expires - access_token_expires
    ) < datetime.timedelta(seconds=10)
    assert oidc_profile.refresh_token == token_info["refresh_token"]
    assert abs(
        oidc_profile.refresh_token_expires - refresh_token_expires
    ) < datetime.timedelta(seconds=10)


def check_user_info(user, claims):
    assert user.username == claims["sub"]
    assert user.first_name == claims["given_name"]
    assert user.last_name == claims["family_name"]
    assert user.email == claims["email"]


@pytest.mark.django_db
@override_settings(
    AUTHENTICATION_BACKENDS=("django.contrib.auth.backends.ModelBackend",),
    OIDC_OP_USER_ENDPOINT="http://example.com/userinfo/",
    MOCK_FLAG=False,
)
def test_authenticate(requests_mock):
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {
        "sub": "testuser",
        "given_name": "test_given_name",
        "family_name": "test_family_name",
        "email": "test_email",
    }

    matcher = re.compile(settings.OIDC_OP_USER_ENDPOINT)
    requests_mock.get(matcher, json=claims)

    state = "test"
    code = "test"
    factory = RequestFactory()
    request = factory.get("/", {"code": code, "state": state})

    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    with mock.patch(
        "oidc.auth.HelsinkiOIDCAuthenticationBackend.get_token", return_value=token_info
    ):
        with mock.patch(
            "oidc.auth.HelsinkiOIDCAuthenticationBackend.verify_token",
            return_value={"test": "ok"},
        ):
            user = auth_backend.authenticate(request)

    assert OIDCProfile.objects.count() == 1

    oidc_profile = OIDCProfile.objects.first()

    check_token_info(user, oidc_profile, token_info)
    check_user_info(user, claims)


@pytest.mark.django_db
def test_filter_users_by_claims(user):
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {"sub": user.username}
    users = auth_backend.filter_users_by_claims(claims)
    assert list(users) == list(get_user_model().objects.filter(id=user.id))


@pytest.mark.django_db
def test_filter_users_by_claims_no_user():
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {"sub": "testuser"}
    users = auth_backend.filter_users_by_claims(claims)
    assert list(users) == list(get_user_model().objects.none())


@pytest.mark.django_db
def test_create_user():
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {
        "sub": "testuser",
        "given_name": "test_given_name",
        "family_name": "test_family_name",
        "email": "test_email",
    }

    user = auth_backend.create_user(claims)

    check_user_info(user, claims)


@pytest.mark.django_db
def test_store_token_info_in_oidc_profile(user):
    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    oidc_profile = store_token_info_in_oidc_profile(user, token_info)

    check_token_info(user, oidc_profile, token_info)


@pytest.mark.django_db
@override_settings(
    OIDC_OP_TOKEN_ENDPOINT="http://example.com/token/",
    MOCK_FLAG=False,
)
def test_refresh_token(oidc_profile, requests_mock):
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    matcher = re.compile(settings.OIDC_OP_TOKEN_ENDPOINT)
    requests_mock.post(matcher, json=token_info)

    new_oidc_profile = auth_backend.refresh_tokens(oidc_profile)

    check_token_info(oidc_profile.user, new_oidc_profile, token_info)
