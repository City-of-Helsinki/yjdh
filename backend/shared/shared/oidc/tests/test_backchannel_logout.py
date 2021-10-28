from unittest import mock

import pytest
from django.contrib import auth
from django.test import override_settings
from django.urls import reverse

from shared.common.tests.factories import UserFactory


def get_token_claims():
    return {
        "iat": 1613023879,
        "jti": "85d6778d-3fed-4988-95c1-10443a5e981f",
        "iss": "https://helsinki-profile-keycloak-dev.agw.arodevtest.hel.fi/auth/realms/helsinki-tunnistus",
        "aud": "tunnistamo",
        "sub": "e9dbc682-2d93-4b5e-a472-6ee0ebe79fc7",
        "typ": "Logout",
        "sid": "09dbeeaa-228f-408b-a27c-afecae0235c4",
        "events": {"http://schemas.openid.net/event/backchannel-logout": {}},
    }


def post_to_backchannel_logout(claims, client):
    with mock.patch(
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend.verify_token",
        return_value=claims,
    ):
        backchannel_logout_url = reverse("oidc_backchannel_logout")
        payload = {"logout_token": "test"}

        return client.post(backchannel_logout_url, data=payload)


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
)
def test_backchannel_logout(client):
    """
    Example claims from:

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#Practical-backchannel-logout-request-example
    """
    claims = get_token_claims()
    user = UserFactory(username=claims["sub"])

    client.force_login(user)

    claims = get_token_claims()
    response = post_to_backchannel_logout(claims, client)

    assert response.status_code == 200
    assert response.content == b"OK"

    user = auth.get_user(client)
    assert not user.is_authenticated


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
)
def test_backchannel_logout_with_username_that_does_not_exist(client):
    """
    Example claims from:

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#Practical-backchannel-logout-request-example
    """
    claims = get_token_claims()
    response = post_to_backchannel_logout(claims, client)

    assert response.status_code == 400
    assert response.content == b"No users found with the given 'sub' claim"


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
)
def test_backchannel_logout_without_logout_token(client):
    """
    Example claims from:

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#Practical-backchannel-logout-request-example
    """
    backchannel_logout_url = reverse("oidc_backchannel_logout")
    response = client.post(backchannel_logout_url)

    assert response.status_code == 400
    assert response.content == b"No logout token found in the request payload"


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
)
def test_backchannel_logout_invalid_logout_token_without_events(client):
    """
    Example claims from:

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#Practical-backchannel-logout-request-example
    """
    claims = get_token_claims()
    user = UserFactory(username=claims["sub"])

    client.force_login(user)

    claims.pop("events")
    response = post_to_backchannel_logout(claims, client)

    assert response.status_code == 400
    assert response.content == b"Incorrect logout_token: events"

    user = auth.get_user(client)
    assert user.is_authenticated


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=False,
)
def test_backchannel_logout_invalid_logout_token_with_nonce(client):
    """
    Example claims from:

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#Practical-backchannel-logout-request-example
    """
    claims = get_token_claims()
    claims.update({"nonce": "test"})
    user = UserFactory(username=claims["sub"])

    client.force_login(user)

    response = post_to_backchannel_logout(claims, client)

    assert response.status_code == 400
    assert response.content == b"Incorrect logout_token: nonce"

    user = auth.get_user(client)
    assert user.is_authenticated
