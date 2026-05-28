import base64
import sys
import types
import urllib.parse as urllib_parse
import zlib
from unittest import mock

import pytest
from django.conf import settings
from django.http import HttpResponseRedirect
from django.test import Client, RequestFactory, override_settings
from django.urls import clear_url_caches, path
from django.utils.module_loading import import_string

from shared.suomi_fi.tests.mock_data import (
    EXPECTED_DECODED_SAML_RESPONSE_LOGIN_HAR,
    EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR,
    NEXT_URL_HAR,
    RELAY_STATE_LOGOUT_HAR,
)
from shared.suomi_fi.views import (
    RELAY_STATE_PARAM,
    HelsinkiSaml2LogoutServiceView,
    HelsinkiSaml2LogoutView,
    SuomiFiAssertionConsumerServiceView,
)


def encode_saml(xml_string, compress=True):
    """
    Encode a SAML XML string using Base64 and optionally Zlib compression.
    Matches the format used by Suomi.fi / pysaml2.
    """
    if compress:
        # compress() returns a zlib-wrapped string with a 2-byte header and 4-byte checksum.
        # pysaml2 (and Suomi.fi) expects raw DEFLATE without these wrappers.
        return base64.b64encode(
            zlib.compress(xml_string.encode(), level=-1)[2:-4]
        ).decode()
    return base64.b64encode(xml_string.encode()).decode()


@pytest.mark.django_db
class TestSuomiFiViews:
    def test_handle_acs_failure_with_relay_state(self):
        """
        Verify that handle_acs_failure redirects to the RelayState URL
        if it is present and safe.
        """
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
        """
        Verify that handle_acs_failure delegates to the parent class handler
        when no RelayState is present.
        """
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
        """
        Verify that HelsinkiSaml2LogoutView correctly extracts the 'next' parameter
        from the query string.
        """
        factory = RequestFactory()
        next_url = "/dashboard"
        request = factory.get("/saml2/logout/", {"next": next_url})
        request.session = {}
        request.saml_session = {}

        view = HelsinkiSaml2LogoutView()

        # Mock super().get to avoid full logout initiation
        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            view.get(request)

        assert view.next_path == next_url

    def test_handle_unsupported_slo_exception_redirects_to_next(self):
        """
        Verify that handle_unsupported_slo_exception redirects to next_path
        if next_path is safe.
        """
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
        """
        Verify that handle_unsupported_slo_exception delegates to the parent class handler
        if next_path is unsafe.
        """
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
        """
        Verify that HelsinkiSaml2LogoutView stashes next_path in the session
        during SLO initiation.
        """
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"
        request = factory.get("/saml2/logout/", {"next": next_url})
        request.session = {}
        request.saml_session = {}

        view = HelsinkiSaml2LogoutView()

        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ) as mock_is_safe_redirect_url:
                view.get(request)

        mock_is_safe_redirect_url.assert_called_with(
            request, next_url, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )

        assert request.saml_session.get("saml2_logout_next_path") == next_url

    @override_settings(LOGOUT_REDIRECT_URL="/")
    def test_logout_service_view_redirects_to_next_after_session_flush(self):
        """
        Verify that next_path is correctly retrieved and used for redirection
        even after djangosaml2/auth flushes the session in finish_logout.
        """
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"
        request = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request.session = {}
        request.saml_session = {"saml2_logout_next_path": next_url}

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
        """
        Verify that HelsinkiSaml2LogoutServiceView falls back to LOGOUT_REDIRECT_URL
        if the stashed next_path is unsafe.
        """
        factory = RequestFactory()
        next_url = "https://malicious.com"
        request = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request.session = {}
        request.saml_session = {"saml2_logout_next_path": next_url}

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
        Verify the mock-level end-to-end flow: initiation stashes next_path, and
        the callback successfully retrieves it post-session-flush.
        """
        factory = RequestFactory()
        next_url = "https://kesaseteli.dev.hel.ninja/fi"

        # Step 1: initiation stores next_url in session
        request_init = factory.get("/saml2/logout/", {"next": next_url})
        request_init.session = {}
        request_init.saml_session = {}
        view_init = HelsinkiSaml2LogoutView()
        with mock.patch("djangosaml2.views.LogoutInitView.get", return_value=None):
            with mock.patch(
                "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
            ):
                view_init.get(request_init)
        assert request_init.saml_session.get("saml2_logout_next_path") == next_url

        # Step 2: IdP sends SAMLResponse back; finish_logout flushes session
        request_ls = factory.get(
            "/saml2/ls/", {"SAMLResponse": "foo", "RelayState": "bar"}
        )
        request_ls.session = {}
        request_ls.saml_session = dict(request_init.saml_session)

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
        """
        Verify that HelsinkiSaml2LogoutView uses the safe 'next' URL as RelayState
        to ensure it survives session flushes or cookie loss.
        """
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

    def test_post_login_hook_saves_national_id_num_to_session(self):
        """
        Verify that post_login_hook extracts the Finnish national identification
        number from SAML attributes ('ava') and stashes it in request.saml_session.
        """
        factory = RequestFactory()
        request = factory.post("/saml2/acs/")
        request.saml_session = {}

        view = SuomiFiAssertionConsumerServiceView()
        view.request = request

        session_info = {"ava": {"nationalIdentificationNumber": ["123456-789A"]}}

        with mock.patch(
            "djangosaml2.views.AssertionConsumerServiceView.post_login_hook"
        ) as mock_super:
            view.post_login_hook(request, mock.MagicMock(), session_info)
            mock_super.assert_called_once()

        assert request.saml_session.get("national_id_num") == "123456-789A"

    def test_custom_redirect_stores_safe_relay_state_in_session(self):
        """
        Verify that custom_redirect stashes a safe RelayState URL in request.session
        and redirects to the eAuthorizations initiation view.
        """
        factory = RequestFactory()
        request = factory.post("/saml2/acs/")
        request.session = {}

        view = SuomiFiAssertionConsumerServiceView()
        view.request = request

        relay_state = "https://yjdh-kesaseteli.api.dev.hel.ninja/dashboard"

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
        ) as mock_is_safe:
            with mock.patch(
                "shared.suomi_fi.views.reverse",
                return_value="/oidc/eauthorizations/init/",
            ):
                redirect_url = view.custom_redirect(None, relay_state, {})

        mock_is_safe.assert_called_with(
            request, relay_state, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        )
        assert redirect_url == "/oidc/eauthorizations/init/"
        assert request.session.get("eauth_next_url") == relay_state

    def test_custom_redirect_does_not_store_unsafe_relay_state(self):
        """
        Verify that custom_redirect rejects and does not stash unsafe RelayState URLs.
        """
        factory = RequestFactory()
        request = factory.post("/saml2/acs/")
        request.session = {}

        view = SuomiFiAssertionConsumerServiceView()
        view.request = request

        relay_state = "https://malicious.com"

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=False
        ):
            with mock.patch(
                "shared.suomi_fi.views.reverse",
                return_value="/oidc/eauthorizations/init/",
            ):
                view.custom_redirect(None, relay_state, {})

        assert "eauth_next_url" not in request.session

    def test_custom_redirect_prevents_redirect_loop(self):
        """
        Verify that custom_redirect rejects storing the eAuthorizations initiation URL
        itself to prevent infinite redirect loops.
        """
        factory = RequestFactory()
        request = factory.post("/saml2/acs/")
        request.session = {}

        view = SuomiFiAssertionConsumerServiceView()
        view.request = request

        relay_state = "/oidc/eauthorizations/init/"

        with mock.patch(
            "shared.suomi_fi.views.is_safe_redirect_url", return_value=True
        ):
            with mock.patch(
                "shared.suomi_fi.views.reverse",
                return_value="/oidc/eauthorizations/init/",
            ):
                view.custom_redirect(None, relay_state, {})

        assert "eauth_next_url" not in request.session


@pytest.mark.django_db
class TestSuomiFiViewsLogoutHARIntegration:
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

    NEXT_URL_HAR = NEXT_URL_HAR

    # Real RelayState from HAR — pysaml2's opaque ID, never a URL.
    # Format: [request_id]|[timestamp]|[hmac_signature]
    # - request_id: matches InResponseTo in the LogoutResponse
    # - timestamp: 1778586633 (2026-05-12 11:50:33 UTC)
    RELAY_STATE_HAR = RELAY_STATE_LOGOUT_HAR

    # Mock IdP SLO URL used in the HAR flow
    IDP_SLO_URL_HAR = "https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO"

    _MIDDLEWARE_WITH_SAML = settings.MIDDLEWARE + [
        "djangosaml2.middleware.SamlSessionMiddleware"
    ]

    def test_saml_response_har_decoded_content(self):
        """
        Test that EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR encodes and decodes correctly
        """
        encoded = encode_saml(EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR)
        saml_response_xml = zlib.decompress(
            base64.b64decode(encoded), -zlib.MAX_WBITS
        ).decode()
        assert saml_response_xml == EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        LOGOUT_REDIRECT_URL=NEXT_URL_HAR + "-fallback",
        SAML_ALLOWED_HOSTS=[urllib_parse.urlparse(NEXT_URL_HAR).netloc],
        MIDDLEWARE=_MIDDLEWARE_WITH_SAML,
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
        """
        clear_url_caches()
        from django.contrib.auth import get_user_model

        User = get_user_model()  # noqa: N806
        user = User.objects.create_user(username="saml2test", password="x")
        client = Client()
        client.force_login(user)

        # SP initiates SLO — our view stores next_url in session before
        # handing off to LogoutInitView (which needs real SAML config, so mock it).
        with mock.patch(
            "djangosaml2.views.LogoutInitView.get",
            return_value=HttpResponseRedirect(self.IDP_SLO_URL_HAR),
        ):
            client.get("/saml2/logout/", {"next": self.NEXT_URL_HAR})

        saml_cookie = client.cookies.get(settings.SAML_SESSION_COOKIE_NAME)
        assert saml_cookie is not None, "SamlSessionMiddleware did not set cookie"
        session_store = import_string(settings.SESSION_ENGINE).SessionStore
        saml_session = session_store(saml_cookie.value)
        assert saml_session["saml2_logout_next_path"] == self.NEXT_URL_HAR

        # Step 2: IdP sends back real SAMLResponse and echoes the opaque RelayState.
        # Here we do NOT mock finish_logout. The real finish_logout will run,
        # logging out the user, clearing the session, and returning a redirect to
        # "/" because LOGOUT_REDIRECT_URL is off-domain.
        saml_response_logout_har_encoded = encode_saml(
            EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR
        )

        with mock.patch.object(
            HelsinkiSaml2LogoutServiceView,
            "get_state_client",
            return_value=(mock.MagicMock(), mock.MagicMock()),
        ):
            response = client.get(
                "/saml2/ls/",
                {
                    "SAMLResponse": saml_response_logout_har_encoded,
                    "RelayState": self.RELAY_STATE_HAR,
                },
            )

        assert response.status_code == 302
        assert response.url == self.NEXT_URL_HAR

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        LOGOUT_REDIRECT_URL=NEXT_URL_HAR + "-fallback",
        SAML_ALLOWED_HOSTS=[urllib_parse.urlparse(NEXT_URL_HAR).netloc],
        MIDDLEWARE=_MIDDLEWARE_WITH_SAML,
    )
    def test_har_documented_slo_flow_fallback_to_safe_logout_redirect_url(self):
        """
        Verify that even if next URL is not provided in the request,
        the view still redirects to the safe LOGOUT_REDIRECT_URL fallback.
        """
        clear_url_caches()
        from django.contrib.auth import get_user_model

        User = get_user_model()  # noqa: N806
        user = User.objects.create_user(username="saml2test_fallback", password="x")
        client = Client()
        client.force_login(user)

        # Step 1: SP initiates SLO without "next" param.
        with mock.patch(
            "djangosaml2.views.LogoutInitView.get",
            return_value=HttpResponseRedirect(self.IDP_SLO_URL_HAR),
        ):
            client.get("/saml2/logout/")

        # Session does not have next_path.
        saml_cookie = client.cookies.get(settings.SAML_SESSION_COOKIE_NAME)
        if saml_cookie:
            session_store = import_string(settings.SESSION_ENGINE).SessionStore
            saml_session = session_store(saml_cookie.value)
            assert "saml2_logout_next_path" not in saml_session

        # Step 2: IdP sends back SAMLResponse.
        saml_response_logout_har_encoded = encode_saml(
            EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR
        )

        with mock.patch.object(
            HelsinkiSaml2LogoutServiceView,
            "get_state_client",
            return_value=(mock.MagicMock(), mock.MagicMock()),
        ):
            response = client.get(
                "/saml2/ls/",
                {
                    "SAMLResponse": saml_response_logout_har_encoded,
                    "RelayState": self.RELAY_STATE_HAR,
                },
            )

        assert response.status_code == 302
        assert response.url == self.NEXT_URL_HAR + "-fallback"

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        LOGOUT_REDIRECT_URL=NEXT_URL_HAR + "-fallback",
        SAML_ALLOWED_HOSTS=[urllib_parse.urlparse(NEXT_URL_HAR).netloc],
        MIDDLEWARE=_MIDDLEWARE_WITH_SAML,
    )
    def test_har_documented_slo_flow_with_lost_session_redirects_to_fallback(self):
        """
        Verify that if the session is lost (so stashed next_path is gone),
        the view still redirects to the safe LOGOUT_REDIRECT_URL fallback.
        """
        clear_url_caches()
        client = Client()

        saml_response_logout_har_encoded = encode_saml(
            EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR
        )

        with mock.patch.object(
            HelsinkiSaml2LogoutServiceView,
            "get_state_client",
            return_value=(mock.MagicMock(), mock.MagicMock()),
        ):
            response = client.get(
                "/saml2/ls/",
                {
                    "SAMLResponse": saml_response_logout_har_encoded,
                    "RelayState": self.RELAY_STATE_HAR,
                },
            )

        assert response.status_code == 302
        assert response.url == self.NEXT_URL_HAR + "-fallback"


@pytest.mark.django_db
class TestSuomiFiViewsLoginHARIntegration:
    """
    Integration tests using the Django Client to verify the end-to-end SAML login flow.
    """

    _SAML_TEST_URLCONF = "_shared_suomi_fi_login_test_urlconf"
    _saml_url_module = types.ModuleType(_SAML_TEST_URLCONF)
    _saml_url_module.urlpatterns = [
        path(
            "saml2/acs/",
            SuomiFiAssertionConsumerServiceView.as_view(),
            name="saml2_acs",
        ),
        path(
            "oidc/eauthorizations/init/",
            lambda r: None,
            name="eauth_authentication_init",
        ),
    ]
    sys.modules[_SAML_TEST_URLCONF] = _saml_url_module

    RELAY_STATE_HAR = "/oidc/eauthorizations/authenticate/"

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        SAML_ALLOWED_HOSTS=[
            urllib_parse.urlparse("https://yjdh-kesaseteli.api.dev.hel.ninja").netloc
        ],
    )
    def test_har_documented_login_flow(self):
        """
        Client-level replay of the real Login flow captured in the HAR file.
        """
        clear_url_caches()
        client = Client()

        saml_response_login_har_encoded = encode_saml(
            EXPECTED_DECODED_SAML_RESPONSE_LOGIN_HAR, compress=False
        )

        # Mock the post method of the ACS view to avoid real SAML validation
        # but still trigger our custom post_login_hook and custom_redirect.
        def mock_post(view_instance, request, *args, **kwargs):
            # Simulate a successful login by injecting the session data
            # that pysaml2 would normally extract from the response.
            request.session["nationalIdentificationNumber"] = "123456-789A"
            url = view_instance.custom_redirect(None, self.RELAY_STATE_HAR, {"ava": {}})
            return HttpResponseRedirect(url)

        with mock.patch(
            "djangosaml2.views.AssertionConsumerServiceView.post", new=mock_post
        ):
            response = client.post(
                "/saml2/acs/",
                {
                    "SAMLResponse": saml_response_login_har_encoded,
                    "RelayState": self.RELAY_STATE_HAR,
                },
            )

        assert response.status_code == 302
        assert response.url == "/oidc/eauthorizations/init/"

        assert client.session.get("eauth_next_url") == self.RELAY_STATE_HAR

    @override_settings(
        ROOT_URLCONF=_SAML_TEST_URLCONF,
        SAML_ALLOWED_HOSTS=[
            urllib_parse.urlparse("https://yjdh-kesaseteli.api.dev.hel.ninja").netloc
        ],
    )
    def test_har_documented_login_failure(self):
        """
        Client-level replay of a failed ACS flow (e.g. user cancelled at Suomi.fi)
        """
        clear_url_caches()
        client = Client()

        def mock_post(view_instance, request, *args, **kwargs):
            return view_instance.handle_acs_failure(request, status=403)

        saml_response_login_har_encoded = encode_saml(
            EXPECTED_DECODED_SAML_RESPONSE_LOGIN_HAR, compress=False
        )

        with mock.patch(
            "djangosaml2.views.AssertionConsumerServiceView.post", new=mock_post
        ):
            response = client.post(
                "/saml2/acs/",
                {
                    "SAMLResponse": saml_response_login_har_encoded,
                    "RelayState": self.RELAY_STATE_HAR,
                },
            )

        assert response.status_code == 302
        assert response.url == self.RELAY_STATE_HAR
