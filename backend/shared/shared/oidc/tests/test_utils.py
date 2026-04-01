from django.conf import settings
from django.test import RequestFactory, override_settings

import pytest

from shared.oidc.utils import get_eauth_login_success_url

@pytest.mark.django_db
class TestGetEauthLoginSuccessUrl:
    def test_returns_session_url_if_safe(self):
        rf = RequestFactory()
        request = rf.get("/")
        request.session = {"eauth_next_url": "/safe-url/"}

        # Default settings should allow internal URLs
        url = get_eauth_login_success_url(request)
        assert url == "/safe-url/"
        assert "eauth_next_url" not in request.session

    def test_returns_default_url_if_unsafe(self):
        rf = RequestFactory()
        request = rf.get("/")
        request.session = {"eauth_next_url": "http://evil.com/malicious"}

        # Should reject external URL if not in allowed hosts
        url = get_eauth_login_success_url(request)
        assert url == settings.LOGIN_REDIRECT_URL
        assert "eauth_next_url" not in request.session

    @override_settings(OIDC_REDIRECT_ALLOWED_HOSTS=["trusted.com"])
    def test_returns_allowed_external_url(self):
        rf = RequestFactory()
        request = rf.get("/")
        request.session = {"eauth_next_url": "http://trusted.com/callback"}

        url = get_eauth_login_success_url(request)
        assert url == "http://trusted.com/callback"

    def test_falls_back_to_default_if_no_session_url(self):
        rf = RequestFactory()
        request = rf.get("/")
        request.session = {}

        url = get_eauth_login_success_url(request)
        assert url == settings.LOGIN_REDIRECT_URL
