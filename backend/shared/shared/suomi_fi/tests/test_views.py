import base64
import sys
import types
import zlib
from unittest import mock

import pytest
from django.conf import settings
from django.http import HttpResponseRedirect
from django.test import Client, RequestFactory, override_settings
from django.urls import clear_url_caches, path
from six.moves import urllib_parse

from shared.common.tests.utils import normalize_whitespace
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

    def test_helsinki_saml2_logout_view_uses_next_as_relay_state(self):
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"
        request = factory.get("/saml2/logout/", {"next": next_url})
        request.session = {}

        view = HelsinkiSaml2LogoutView()

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
        ):
            relay_state = view.get_relay_state(request)

        assert relay_state == next_url


@pytest.mark.django_db
class TestSuomiFiViewsHARIntegration:
    """
    Integration tests using the Django Client to verify the end-to-end SAML logout flow.

    These tests require a custom URL configuration because the production kesaseteli.urls
    conditionally loads SAML routes, which can be inconsistent in a test environment.
    """

    # Minimal URL conf for Client-based tests.
    _SAML_TEST_URLCONF = "_shared_suomi_fi_test_urlconf"
    _saml_url_module = types.ModuleType(_SAML_TEST_URLCONF)
    _saml_url_module.urlpatterns = [
        path("saml2/logout/", HelsinkiSaml2LogoutView.as_view(), name="saml2_logout"),
        path("saml2/ls/", HelsinkiSaml2LogoutServiceView.as_view(), name="saml2_ls"),
    ]
    sys.modules[_SAML_TEST_URLCONF] = _saml_url_module

    # Real SAMLResponse from HAR (base64-encoded LogoutResponse, URL-decoded).
    # Decodes to:
    # <?xml version="1.0" encoding="UTF-8"?>
    # <saml2p:LogoutResponse xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
    #   Destination="https://yjdh-kesaseteli.api.dev.hel.ninja/saml2/ls/"
    #   ID="_5c6cb09746cf826f3456e6fa223c6674" InResponseTo="id-CXP5fBFhcypIJA9bY"
    #   IssueInstant="2026-05-12T11:50:33.932Z" Version="2.0">
    #   <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
    #     https://testi.apro.tunnistus.fi/idp1
    #   </saml2:Issuer>
    #   <saml2p:Status>
    #     <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Requester">
    #       <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:UnknownPrincipal"/>
    #     </saml2p:StatusCode>
    #     <saml2p:StatusMessage>An error occurred.</saml2p:StatusMessage>
    #   </saml2p:Status>
    # </saml2p:LogoutResponse>
    #
    # NOTE: This response contains an 'UnknownPrincipal' error from the IdP.
    # This is a valuable test case because it forces djangosaml2 to fall back
    # to the local LOGOUT_REDIRECT_URL (/). Our fix ensures that even in this
    # "error" state, the session-stored next_path is recovered and used
    # instead of the API root.
    SAML_RESPONSE_HAR = (
        "pZJNT+MwEIb/iuV7nMRpArWaoC4IKSuQEBQEe1kZZ9Ia0nHWY7Pw71d0KZQe"
        "uHAcz8f7zuOZHT2vB/YEnqzDmuci4wzQuM7isubXi9PkkB81M9LrQY7qzC1dD"
        "JdAo0MC9rwekNT/XM2jR+U0WVKo10AqGHU1Pz9TUmRq9C444wbOToCCRR02c"
        "qsQRlJp+vLQrZJHIE0QYLBCj1Z08CRWMAi0+KDTjUg6UMpZe1Lz36WpzH02"
        "PZhUpj+UVV9MygqqXktZmKo6mHDW4tbnwtXcdsnx7UXZ/zhdmZex/Tmf3t9x"
        "1hJFaJGCxlBzmckqycokl4s8V2WmikJMC/mLs5stHyky/kZDbZr9LoSvGWgi"
        "8K9782a7d3iFIfTonQgR0VKIJHqb2m7MZ+muzPsXXAUdIu2Fx64DdqOHCF9b"
        "oE21uoQ/ESiA59+bc42P6P7ihbdo7KgHnjZvrncH7mmcA5FeQjNHBt47z5wx0"
        "XvoxF7vtnDv+SP+fI3NPw=="
    )

    EXPECTED_DECODED_SAML_RESPONSE_HAR = normalize_whitespace("""
        <?xml version="1.0" encoding="UTF-8"?>
        <saml2p:LogoutResponse xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
                               Destination="https://yjdh-kesaseteli.api.dev.hel.ninja/saml2/ls/"
                               ID="_5c6cb09746cf826f3456e6fa223c6674"
                               InResponseTo="id-CXP5fBFhcypIJA9bY"
                               IssueInstant="2026-05-12T11:50:33.932Z"
                               Version="2.0">
          <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">https://testi.apro.tunnistus.fi/idp1</saml2:Issuer>
          <saml2p:Status>
            <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Requester">
              <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:UnknownPrincipal"/>
            </saml2p:StatusCode>
            <saml2p:StatusMessage>An error occurred.</saml2p:StatusMessage>
          </saml2p:Status>
        </saml2p:LogoutResponse>
    """).replace("> <", "><")  # Remove whitespace between tags for exact string match

    NEXT_URL_HAR = "https://kesaseteli.dev.hel.ninja/fi"

    # Real RelayState from HAR — pysaml2's opaque ID, never a URL.
    # Format: [request_id]|[timestamp]|[hmac_signature]
    # - request_id: matches InResponseTo in the LogoutResponse
    # - timestamp: 1778586633 (2026-05-12 11:50:33 UTC)
    RELAY_STATE_HAR = (
        "id-CXP5fBFhcypIJA9bY|1778586633|dcad624ca4cf9af0f69f31ad9a6dbe51231c19b9"
    )

    # Mock IdP SLO URL used in the HAR flow
    IDP_SLO_URL_HAR = "https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO"

    def test_saml_response_har_decoded_content(self):
        """
        Test that SAML_RESPONSE_HAR decodes as expected
        """
        saml_response_xml = zlib.decompress(
            base64.b64decode(self.SAML_RESPONSE_HAR), -zlib.MAX_WBITS
        ).decode()
        assert saml_response_xml == self.EXPECTED_DECODED_SAML_RESPONSE_HAR

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        LOGOUT_REDIRECT_URL="/",
        SAML_ALLOWED_HOSTS=[urllib_parse.urlparse(NEXT_URL_HAR).netloc],
    )
    def test_har_documented_slo_flow(self):
        """
        Client-level replay of the real SLO flow captured in the HAR file.

        Uses the actual RelayState pysaml2 generated ('id-CXP5...|timestamp|hmac')
        and the actual SAMLResponse the IdP returned. This proves that the opaque
        RelayState is NOT mistaken for a redirect URL, and that the session-based
        next_path mechanism (our fix) is the only route to the correct frontend
        redirect — even after auth.logout() flushes the session inside finish_logout.

        HAR flow:
          GET /saml2/logout/?next=https://kesaseteli.dev.hel.ninja/fi  →  302 to IdP
          GET /saml2/ls/?SAMLResponse=<real>&RelayState=id-CXP5...     →  302 to next_url
                                                                (broken: was 302 to /)
        """
        clear_url_caches()
        from django.contrib.auth import get_user_model

        User = get_user_model()  # noqa: N806
        user = User.objects.create_user(username="saml2test", password="x")
        client = Client()
        client.force_login(user)

        # Step 1: SP initiates SLO — our view stores next_url in session before
        # handing off to LogoutInitView (which needs real SAML config, so mock it).
        with mock.patch(
            "djangosaml2.views.LogoutInitView.get",
            return_value=HttpResponseRedirect(self.IDP_SLO_URL_HAR),
        ):
            client.get("/saml2/logout/", {"next": self.NEXT_URL_HAR})

        assert client.session["saml2_logout_next_path"] == self.NEXT_URL_HAR

        # Step 2: IdP sends back real SAMLResponse and echoes the opaque RelayState.
        # finish_logout calls auth.logout() which flushes the session — our fix pops
        # next_path before super() so it survives the flush.
        def flushing_finish_logout(req, response, **kwargs):
            req.session.clear()
            return HttpResponseRedirect("/")

        with mock.patch.object(
            HelsinkiSaml2LogoutServiceView,
            "get_state_client",
            return_value=(mock.MagicMock(), mock.MagicMock()),
        ):
            with mock.patch(
                "djangosaml2.views.finish_logout", side_effect=flushing_finish_logout
            ):
                response = client.get(
                    "/saml2/ls/",
                    {
                        "SAMLResponse": self.SAML_RESPONSE_HAR,
                        "RelayState": self.RELAY_STATE_HAR,
                    },
                )

        assert response.status_code == 302
        assert (
            response.url == self.NEXT_URL_HAR
        )  # not "/" (the pre-fix broken behavior)

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        LOGOUT_REDIRECT_URL="/",
        SAML_ALLOWED_HOSTS=[urllib_parse.urlparse(NEXT_URL_HAR).netloc],
    )
    def test_har_documented_slo_flow_with_lost_session(self):
        """
        Verify that redirection still works even if the session is lost,
        by relying on RelayState (which now contains the next URL).
        """
        clear_url_caches()
        client = Client()

        # Step 1: IdP sends back the URL in RelayState.
        # Even if the session is empty, djangosaml2's finish_logout should use RelayState.
        with mock.patch.object(
            HelsinkiSaml2LogoutServiceView,
            "get_state_client",
            return_value=(mock.MagicMock(), mock.MagicMock()),
        ):
            # We mock the standalone finish_logout function in djangosaml2.views
            # to return the fallback if no RelayState, or the RelayState itself
            # if it's provided (simulating djangosaml2 behavior).
            def finish_logout_mock(request, response):
                from djangosaml2.views import _get_next_path

                next_path = _get_next_path(request)
                return HttpResponseRedirect(next_path or "/")

            with mock.patch(
                "djangosaml2.views.finish_logout", side_effect=finish_logout_mock
            ):
                response = client.get(
                    "/saml2/ls/",
                    {
                        "SAMLResponse": self.SAML_RESPONSE_HAR,
                        "RelayState": self.NEXT_URL_HAR,  # URL is in RelayState!
                    },
                )

        assert response.status_code == 302
        assert response.url == self.NEXT_URL_HAR
