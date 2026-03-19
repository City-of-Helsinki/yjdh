from unittest import mock

import pytest
from django.contrib.sessions.middleware import SessionMiddleware
from django.http import HttpResponse
from django.test import RequestFactory, override_settings

from shared.oidc.views.hki_views import HelsinkiOIDCAuthenticationCallbackView


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    OIDC_OP_AUTHORIZATION_ENDPOINT="http://example.com/auth",
)
def test_hki_callback_transfers_oidc_next_url():
    """
    Test that the custom `HelsinkiOIDCAuthenticationCallbackView` transfers
    the natively captured `oidc_login_next` (from mozilla_django_oidc) into
    `eauth_next_url` for the eAuthorizations flow to consume.
    """
    # Mocking that the upstream logic successfully ran and stored oidc_login_next
    factory = RequestFactory()
    req = factory.get("/")
    middleware = SessionMiddleware(lambda request: HttpResponse())
    middleware.process_request(req)
    req.session.save()
    req.session["oidc_login_next"] = "https://localhost:3000/employer"

    # To keep the test simple without huge OIDC handshake mocks, we directly instantiate the view.
    view = HelsinkiOIDCAuthenticationCallbackView()

    view.user = mock.Mock()
    view.request = req

    with mock.patch("mozilla_django_oidc.views.auth.login"):
        response = view.login_success()

    assert response.status_code == 302
    assert req.session.get("eauth_next_url") == "https://localhost:3000/employer"
