from unittest import mock

import pytest
from django.conf import settings
from django.http import HttpResponseRedirect
from django.test import RequestFactory, override_settings

from shared.suomi_fi.views import (
    RELAY_STATE_PARAM,
    HelsinkiSaml2LogoutServiceView,
    HelsinkiSaml2LogoutView,
    SuomiFiAssertionConsumerServiceView,
)


@pytest.mark.django_db
class TestSuomiFiViews:
    def test_handle_acs_failure_with_relay_state(self):
        factory = RequestFactory()
        relay_state = "https://auth-started-here.hel.fi/fi/callback-here"
        request = factory.post("/saml2/acs/", {RELAY_STATE_PARAM: relay_state})

        view = SuomiFiAssertionConsumerServiceView()

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
        ) as mock_is_safe_redirect_url:
            response = view.handle_acs_failure(request)

        mock_is_safe_redirect_url.assert_called_with(
            request, relay_state, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert isinstance(response, HttpResponseRedirect)
        assert response.url == relay_state

    def test_handle_acs_failure_without_relay_state(self):
        factory = RequestFactory()
        request = factory.post("/saml2/acs/")

        view = SuomiFiAssertionConsumerServiceView()

        # We need to mock the super().handle_acs_failure to avoid 403 error page rendering during test
        with mock.patch(
            "djangosaml2.views.AssertionConsumerServiceView.handle_acs_failure"
        ) as mock_super:
            view.handle_acs_failure(request)
            mock_super.assert_called_once()

    def test_helsinki_saml2_logout_view_captures_next(self):
        factory = RequestFactory()
        next_url = "/dashboard"
        request = factory.get("/saml2/logout/", {"next": next_url})
        request.session = {}

        view = HelsinkiSaml2LogoutView()

        # Mock super().get to avoid full logout initiation
        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            view.get(request)

        assert view.next_path == next_url

    def test_handle_unsupported_slo_exception_redirects_to_next(self):
        factory = RequestFactory()
        next_url = "https://auth-started-here.hel.fi/fi/logout-callback"
        request = factory.get("/saml2/logout/")

        view = HelsinkiSaml2LogoutView()
        view.next_path = next_url

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
        ) as mock_is_safe_redirect_url:
            response = view.handle_unsupported_slo_exception(
                request, Exception("SLO not supported")
            )

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert isinstance(response, HttpResponseRedirect)
        assert response.url == next_url

    def test_handle_unsupported_slo_exception_safe_check(self):
        factory = RequestFactory()
        next_url = "https://malicious.com"
        request = factory.get("/saml2/logout/")

        view = HelsinkiSaml2LogoutView()
        view.next_path = next_url

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=False
        ) as mock_is_safe_redirect_url:
            with mock.patch(
                "djangosaml2.views.LogoutInitView.handle_unsupported_slo_exception"
            ) as mock_super:
                view.handle_unsupported_slo_exception(
                    request, Exception("SLO not supported")
                )
                mock_super.assert_called_once()

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

    def test_helsinki_saml2_logout_view_sets_next_path_to_session(self):
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"
        request = factory.get("/saml2/logout/", {"next": next_url})
        request.session = {}

        view = HelsinkiSaml2LogoutView()

        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ) as mock_is_safe_redirect_url:
                view.get(request)

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert request.session.get("saml2_logout_next_path") == next_url

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_helsinki_saml2_logout_service_view_restores_next_path(self):
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"

        request = factory.get("/saml2/ls/?SAMLResponse=foo&RelayState=bar")
        request.session = {"saml2_logout_next_path": next_url}

        view = HelsinkiSaml2LogoutServiceView()

        fallback_response = HttpResponseRedirect("/")
        with mock.patch(
            "djangosaml2.views.LogoutView.get", return_value=fallback_response
        ):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ) as mock_is_safe_redirect_url:
                response = view.get(request)

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert isinstance(response, HttpResponseRedirect)
        assert response.url == next_url
        assert "saml2_logout_next_path" not in request.session

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_helsinki_saml2_logout_service_view_ignores_unsafe_next_path(self):
        factory = RequestFactory()
        next_url = "https://malicious.com"

        request = factory.get("/saml2/ls/?SAMLResponse=foo&RelayState=bar")
        request.session = {"saml2_logout_next_path": next_url}

        view = HelsinkiSaml2LogoutServiceView()

        fallback_response = HttpResponseRedirect("/")
        with mock.patch(
            "djangosaml2.views.LogoutView.get", return_value=fallback_response
        ):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=False
            ) as mock_is_safe_redirect_url:
                response = view.get(request)

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert isinstance(response, HttpResponseRedirect)
        assert response.url == "/"

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_logout_redirection_flow_integration(self):
        """
        Integration test replicating the HAR flow:
        1. Initiation with 'next' parameter sets the session.
        2. Callback from IdP retrieves that same session.
        3. Final redirect to the original 'next' URL.
        """
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"

        # Step 1: Start logout (Initiator)
        request_init = factory.get("/saml2/logout/", {"next": next_url})
        request_init.session = {}  # Manually attach session

        view_init = HelsinkiSaml2LogoutView()
        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ) as mock_is_safe_init:
                view_init.get(request_init)

        mock_is_safe_init.assert_called_with(
            request_init, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        # Verify session was set
        assert request_init.session.get("saml2_logout_next_path") == next_url

        # Step 2: Return from IdP (Service)
        request_ls = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        # We simulate the handoff by passing the session object from step 1
        request_ls.session = request_init.session

        view_ls = HelsinkiSaml2LogoutServiceView()
        fallback_response = HttpResponseRedirect("/")
        with mock.patch(
            "djangosaml2.views.LogoutView.get", return_value=fallback_response
        ):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ) as mock_is_safe_ls:
                response = view_ls.get(request_ls)

        mock_is_safe_ls.assert_called_with(
            request_ls, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        # Step 3: Final Result
        assert response.status_code == 302
        assert response.url == next_url
