from unittest import mock

import pytest
from django.http import HttpResponseRedirect
from django.test import RequestFactory

from shared.suomi_fi.views import (
    RELAY_STATE_PARAM,
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
        ):
            response = view.handle_acs_failure(request)

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
        ):
            response = view.handle_unsupported_slo_exception(
                request, Exception("SLO not supported")
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
        ):
            with mock.patch(
                "djangosaml2.views.LogoutInitView.handle_unsupported_slo_exception"
            ) as mock_super:
                view.handle_unsupported_slo_exception(
                    request, Exception("SLO not supported")
                )
                mock_super.assert_called_once()
