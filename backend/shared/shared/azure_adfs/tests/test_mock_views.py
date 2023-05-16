from urllib.parse import urljoin

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse

callback_url = "/oauth2/callback?code=mock_adfs_code"


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_login_view(client):
    login_url = reverse("django_auth_adfs:login")
    response = client.get(login_url)
    assert response.status_code == 302
    assert response.url == callback_url


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    ADFS_LOGIN_REDIRECT_URL="http://example.com/login",
)
def test_callback_view(settings, client):
    response = client.get(callback_url)
    user = get_user_model().objects.get(id=client.session.get("_adfs_user_id"))
    assert user.is_authenticated
    assert user.is_staff
    assert response.status_code == 302
    assert response.url == settings.ADFS_LOGIN_REDIRECT_URL


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    ADFS_LOGIN_REDIRECT_URL="http://example.com/login",
)
def test_logout_view(user_client):
    logout_url = reverse("django_auth_adfs:logout")
    response = user_client.get(logout_url)
    assert response.status_code == 302
    assert response.headers["Location"] == urljoin(
        settings.ADFS_LOGIN_REDIRECT_URL, "?logout=true"
    )
    assert "_adfs_user_id" not in user_client.session
