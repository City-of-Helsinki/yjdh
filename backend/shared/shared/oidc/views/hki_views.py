import logging
from urllib.parse import urlencode, urljoin

from django.conf import settings
from django.contrib import auth
from django.contrib.sessions.models import Session
from django.core.exceptions import SuspiciousOperation
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.generic import View
from mozilla_django_oidc.views import (
    OIDCAuthenticationCallbackView,
    OIDCAuthenticationRequestView,
)
from requests.exceptions import HTTPError

from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend
from shared.oidc.utils import (
    get_userinfo,
    is_active_oidc_access_token,
    refresh_hki_tokens,
)

logger = logging.getLogger(__name__)


class HelsinkiOIDCAuthenticationRequestView(OIDCAuthenticationRequestView):
    """Override OIDC client authentication request get method"""

    def get(self, request):
        lang = request.GET.get("lang")
        if not lang:
            lang = "fi"

        response_redirect = super().get(request)
        response = HttpResponseRedirect(f"{response_redirect.url}&ui_locales={lang}")
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang, httponly=True)

        return response


class HelsinkiOIDCAuthenticationCallbackView(OIDCAuthenticationCallbackView):
    """Override OIDC client authentication callback login success method"""

    def login_success(self):
        super().login_success()
        return HttpResponseRedirect(reverse("eauth_authentication_init"))

    def login_failure(self):
        url, error_path = self.failure_url.rsplit("/", 1)

        lang = self.request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        if lang:
            url = f"{url}/{lang}/{error_path}"

        return HttpResponseRedirect(url)


class HelsinkiOIDCLogoutView(View):
    """
    Initiate logout process with Keycloak.
    Use GET request like e.g. Django auth logout does."""

    http_method_names = ["get"]

    def get(self, request):
        if request.user.is_authenticated:
            if not request.session.get("oidc_id_token"):
                auth.logout(request)
                return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)

            params = {
                "id_token_hint": request.session.get("oidc_id_token"),
                "post_logout_redirect_uri": settings.OIDC_OP_LOGOUT_CALLBACK_URL,
            }

            query = urlencode(params)
            redirect_url = urljoin(settings.OIDC_OP_LOGOUT_ENDPOINT, "?" + query)
            auth.logout(request)
            return HttpResponseRedirect(redirect_url)
        else:
            # user is already logged out, inform them about the fact
            HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)


class HelsinkiOIDCLogoutCallbackView(View):
    """This callback is called after the suomi.fi logout has been performed at the city profile"""

    http_method_names = ["get"]

    def get(self, request):
        # As of 2021-12, the city profile does not provide any error/status codes along with the
        # callback. If such parameters are added in the future, we would handle them here.
        # Now we just assume that the logout has been done successfully and redirect to
        # the logout landing URL in the frontend.
        return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)


class HelsinkiOIDCUserInfoView(View):
    """Gets the userinfo from OP"""

    http_method_names = ["get"]

    def get_userinfo(self, request):
        response = get_userinfo(request)
        userinfo = {
            "given_name": response.get("given_name", ""),
            "family_name": response.get("family_name", ""),
            "name": response.get("name", ""),
        }
        return JsonResponse(userinfo)

    def get(self, request):
        response = HttpResponse("Unauthorized", status=401)

        if request.user.is_authenticated:
            try:
                access_token = request.session.get("oidc_access_token")

                if not access_token:
                    raise SuspiciousOperation("User has no hki profile access token")

                if not is_active_oidc_access_token(request):
                    refresh_hki_tokens(request)

                response = self.get_userinfo(request)
            except (HTTPError, SuspiciousOperation):
                auth.logout(request)
        return response


class HelsinkiOIDCBackchannelLogoutView(View):
    """
    Backchannel logout endpoint that can be called by helsinki profiili

    # noqa
    Docs: https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/1209040912/SSO+session+handling#About-backchannel-logout-requests
    """

    http_method_names = ["post"]

    def validate_logout_claims(self, logout_token):
        if not logout_token.get("sub"):
            logger.error("Incorrect backchannel logout_token: sub")
            raise SuspiciousOperation("Incorrect logout_token: sub")

        events = logout_token.get("events")
        try:
            if (
                not events
                or "http://schemas.openid.net/event/backchannel-logout"
                not in events.keys()
            ):
                logger.error("Incorrect backchannel logout_token: events")
                raise SuspiciousOperation("Incorrect logout_token: events")
        except AttributeError:
            logger.error("Incorrect backchannel logout_token: events")
            raise SuspiciousOperation("Incorrect logout_token: events")

        if logout_token.get("nonce"):
            logger.error("Incorrect backchannel logout_token: nonce")
            raise SuspiciousOperation("Incorrect logout_token: nonce")

    def clear_user_sessions(self, user):
        for session in Session.objects.all():
            session_data = session.get_decoded()
            if str(user.pk) == str(session_data.get("_auth_user_id")):
                session.delete()

    def post(self, request):
        logout_token = request.POST.get("logout_token", None)

        if logout_token:
            auth_backend = HelsinkiOIDCAuthenticationBackend()
            try:
                claims = auth_backend.verify_token(logout_token)
                self.validate_logout_claims(claims)
            except SuspiciousOperation as e:
                return HttpResponse(e, status=400)

            users = auth_backend.filter_users_by_claims(claims)

            if len(users) == 1:
                user = users.first()
                self.clear_user_sessions(user)

            elif len(users) > 1:
                # In the rare case that two user accounts have the same email address,
                # bail. Randomly selecting one seems really wrong.
                logger.error(
                    f"Login failed: Multiple users found with the given 'sub' claim: {claims.get('sub', None)}"
                )
                return HttpResponse(
                    "Multiple users found with the given 'sub' claim",
                    status=400,
                )
            else:
                logger.error(
                    f"Login failed: No user with sub {claims.get('sub', None)} found"
                )
                return HttpResponse(
                    "No users found with the given 'sub' claim", status=400
                )

            return HttpResponse("OK", status=200)

        return HttpResponse("No logout token found in the request payload", status=400)
