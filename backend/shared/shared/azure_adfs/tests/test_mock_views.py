from unittest import mock
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
    assert response.headers["Location"] == urljoin(
        settings.ADFS_LOGIN_REDIRECT_URL, "?logout=true"
    )
    assert "_adfs_user_id" not in user_client.session


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_login_view_with_next(client):
    next_url = "/some/path"
    login_url = reverse("django_auth_adfs:login") + f"?next={next_url}"
    response = client.get(login_url)
    assert response.status_code == 302
    assert f"next={next_url}" in response.url


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    ADFS_LOGIN_REDIRECT_URL="http://example.com/login",
)
def test_callback_view_with_next(settings, client):
    next_url = "/some/path"
    url = f"{callback_url}&next={next_url}"
    response = client.get(url)
    user = get_user_model().objects.get(id=client.session.get("_adfs_user_id"))
    assert user.is_authenticated
    assert response.status_code == 302
    assert response.url == next_url


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    ADFS_LOGIN_REDIRECT_URL="http://example.com/login",
)
def test_callback_view_with_unsafe_next(settings, client):
    next_url = "http://evil.com"
    url = f"{callback_url}&next={next_url}"
    response = client.get(url)
    user = get_user_model().objects.get(id=client.session.get("_adfs_user_id"))
    assert user.is_authenticated
    assert response.status_code == 302
    assert response.url == settings.ADFS_LOGIN_REDIRECT_URL


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    CORS_ALLOWED_ORIGINS=["http://localhost:3200"],
)
def test_mock_adfs_logout_deep_link(client):
    """
    Test that the mock logout view respects the `next` parameter
    if it matches an allowed host.
    """
    deep_link = "http://localhost:3200/login"
    logout_url = f"{reverse('django_auth_adfs:logout')}?next={deep_link}"

    with mock.patch(
        "shared.azure_adfs.mock_views.is_safe_redirect_url",
        return_value=True,
    ):
        response = client.get(logout_url)

    assert response.status_code == 302
    assert response.url == deep_link
    assert "_auth_user_id" not in client.session
