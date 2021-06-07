import pytest
from django.conf import settings
from django.test import override_settings
from django.urls import path, reverse

from oidc.views.mock_views import (
    MockAuthenticationRequestView,
    MockLogoutView,
    MockUserInfoView,
)

urlpatterns = [
    path(
        "oidc/authenticate/",
        MockAuthenticationRequestView.as_view(),
        name="oidc_authentication_init",
    ),
    path(
        "oidc/logout/",
        MockLogoutView.as_view(),
        name="oidc_logout",
    ),
    path(
        "oidc/userinfo/",
        MockUserInfoView.as_view(),
        name="oidc_userinfo",
    ),
]


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=True,
    LOGIN_REDIRECT_URL="http://example.com/login/",
    ROOT_URLCONF=__name__,
)
def test_login_view(client):
    login_url = reverse("oidc_authentication_init")
    response = client.get(login_url)

    assert response.url == settings.LOGIN_REDIRECT_URL
    assert "_auth_user_id" in client.session  # User authenticated


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=True,
    ROOT_URLCONF=__name__,
)
def test_logout_view(user_client, user):
    logout_url = reverse("oidc_logout")
    response = user_client.post(logout_url)

    assert response.status_code == 200
    assert response.content == b"OK"
    assert "_auth_user_id" not in user_client.session  # User not authenticated


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True, ROOT_URLCONF=__name__)
def test_userinfo_view(user_client, user):
    logout_url = reverse("oidc_userinfo")
    response = user_client.get(logout_url)

    response = response.json()

    assert response["name"] == f"{user.first_name} {user.last_name}"
    assert response["preferred_username"] == user.username
    assert response["given_name"] == user.first_name
    assert response["family_name"] == user.last_name
