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
    def test_logout_service_view_redirects_to_next_after_session_flush(self):
        """Regression: next_path must be popped before super() flushes the session."""
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"
        request = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request.session = {"saml2_logout_next_path": next_url}

        view = HelsinkiSaml2LogoutServiceView()
        mock_client = mock.MagicMock()
        mock_state = mock.MagicMock()

        def flushing_finish_logout(req, response):
            req.session.clear()  # simulates auth.logout()
            return HttpResponseRedirect("/")

        with mock.patch.object(
            view, "get_state_client", return_value=(mock_state, mock_client)
        ):
            with mock.patch(
                "djangosaml2.views.finish_logout", side_effect=flushing_finish_logout
            ):
                with mock.patch(
                    "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
                ) as mock_is_safe:
                    response = view.get(request)

        mock_is_safe.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )
        assert isinstance(response, HttpResponseRedirect)
        assert response.url == next_url

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_logout_service_view_stays_on_fallback_if_next_path_unsafe(self):
        factory = RequestFactory()
        next_url = "https://malicious.com"
        request = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request.session = {"saml2_logout_next_path": next_url}

        view = HelsinkiSaml2LogoutServiceView()
        mock_client = mock.MagicMock()
        mock_state = mock.MagicMock()

        def flushing_finish_logout(req, response):
            req.session.clear()
            return HttpResponseRedirect("/")

        with mock.patch.object(
            view, "get_state_client", return_value=(mock_state, mock_client)
        ):
            with mock.patch(
                "djangosaml2.views.finish_logout", side_effect=flushing_finish_logout
            ):
                with mock.patch(
                    "shared.suomi_fi.views.is_safe_redirect_url", return_value=False
                ) as mock_is_safe:
                    response = view.get(request)

        mock_is_safe.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )
        assert isinstance(response, HttpResponseRedirect)
        assert response.url == "/"

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_logout_redirection_flow_integration(self):
        """
        Full SLO flow: initiation stores next_url → SLS callback flushes session
        via finish_logout → response still redirects to next_url.
        """
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"

        # Step 1: initiation stores next_url in session
        request_init = factory.get("/saml2/logout/", {"next": next_url})
        request_init.session = {}
        view_init = HelsinkiSaml2LogoutView()
        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ):
                view_init.get(request_init)
        assert request_init.session.get("saml2_logout_next_path") == next_url

        # Step 2: IdP sends SAMLResponse back; finish_logout flushes session
        request_ls = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request_ls.session = dict(request_init.session)

        view_ls = HelsinkiSaml2LogoutServiceView()
        mock_client = mock.MagicMock()
        mock_state = mock.MagicMock()

        def flushing_finish_logout(req, response):
            req.session.clear()  # simulates auth.logout()
            return HttpResponseRedirect("/")

        with mock.patch.object(
            view_ls, "get_state_client", return_value=(mock_state, mock_client)
        ):
            with mock.patch(
                "djangosaml2.views.finish_logout", side_effect=flushing_finish_logout
            ):
                with mock.patch(
                    "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
                ):
                    response = view_ls.get(request_ls)

        assert response.status_code == 302
        assert response.url == next_url
