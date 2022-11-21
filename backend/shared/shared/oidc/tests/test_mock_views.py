import itertools

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse


@pytest.mark.django_db
@pytest.mark.parametrize(
    "oidc_mock_user_is_staff,oidc_mock_user_is_superuser",
    itertools.product([None, False, True], repeat=2),  # None means no setting at all
)
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    LOGIN_REDIRECT_URL="http://example.com/login/",
)
def test_login_view(
    settings, client, oidc_mock_user_is_staff, oidc_mock_user_is_superuser
):
    if oidc_mock_user_is_staff is None:
        if hasattr(settings, "OIDC_MOCK_USER_IS_STAFF"):
            delattr(settings, "OIDC_MOCK_USER_IS_STAFF")
    else:
        settings.OIDC_MOCK_USER_IS_STAFF = oidc_mock_user_is_staff

    if oidc_mock_user_is_superuser is None:
        if hasattr(settings, "OIDC_MOCK_USER_IS_SUPERUSER"):
            delattr(settings, "OIDC_MOCK_USER_IS_SUPERUSER")
    else:
        settings.OIDC_MOCK_USER_IS_SUPERUSER = oidc_mock_user_is_superuser

    assert (oidc_mock_user_is_staff is not None) == hasattr(
        settings, "OIDC_MOCK_USER_IS_STAFF"
    )
    assert (oidc_mock_user_is_superuser is not None) == hasattr(
        settings, "OIDC_MOCK_USER_IS_SUPERUSER"
    )

    assert bool(oidc_mock_user_is_staff) == getattr(
        settings, "OIDC_MOCK_USER_IS_STAFF", False
    )
    assert bool(oidc_mock_user_is_superuser) == getattr(
        settings, "OIDC_MOCK_USER_IS_SUPERUSER", False
    )

    login_url = reverse("oidc_authentication_init")
    response = client.get(login_url)

    assert response.url == settings.LOGIN_REDIRECT_URL
    assert "_auth_user_id" in client.session  # User authenticated
    user = get_user_model().objects.get(pk=client.session.get("_auth_user_id"))
    assert user.is_authenticated
    assert user.is_staff == bool(oidc_mock_user_is_staff)
    assert user.is_superuser == bool(oidc_mock_user_is_superuser)


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    LOGOUT_REDIRECT_URL="http://example.com/logged_out/?status=logout",
)
def test_logout_view(user_client, user):
    logout_url = reverse("oidc_logout")
    response = user_client.get(logout_url)
    assert response.status_code == 302
    assert response.headers["Location"] == settings.LOGOUT_REDIRECT_URL
    assert "_auth_user_id" not in user_client.session  # User not authenticated


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    LOGOUT_REDIRECT_URL="http://example.com/logged_out/?status=logout",
)
def test_logout_callback_view(user_client, user):
    logout_url = reverse("oidc_logout_callback")
    response = user_client.get(logout_url)
    assert response.status_code == 302
    assert response.headers["Location"] == settings.LOGOUT_REDIRECT_URL


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_userinfo_view(user_client, user):
    logout_url = reverse("oidc_userinfo")
    response = user_client.get(logout_url)

    response = response.json()

    assert response["given_name"] == user.first_name
    assert response["family_name"] == user.last_name
    assert response["name"] == f"{user.first_name} {user.last_name}"
