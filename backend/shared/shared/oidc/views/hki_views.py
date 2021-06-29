import logging

import requests
from django.conf import settings
from django.contrib import auth
from django.core.exceptions import SuspiciousOperation
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.generic import View
from mozilla_django_oidc.views import OIDCAuthenticationCallbackView, OIDCLogoutView
from requests.exceptions import HTTPError

from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend
from shared.oidc.models import OIDCProfile
from shared.oidc.services import clear_eauthorization_profiles, clear_oidc_profiles
from shared.oidc.utils import get_userinfo, refresh_hki_tokens

logger = logging.getLogger(__name__)


class HelsinkiOIDCAuthenticationCallbackView(OIDCAuthenticationCallbackView):
    """Override OIDC client authentication callback login success method"""

    def login_success(self):
        super().login_success()
        return HttpResponseRedirect(reverse("eauth_authentication_init"))


class HelsinkiOIDCLogoutView(OIDCLogoutView):
    """Override OIDCLogoutView to match the keycloak backchannel logout"""

    def clear_user_sessions(self, oidc_profile):
        eauthorization_profile = getattr(oidc_profile, "eauthorization_profile", None)

        clear_oidc_profiles(oidc_profile)
        if eauthorization_profile:
            clear_eauthorization_profiles(eauthorization_profile)

    def post(self, request):
        if request.user.is_authenticated:
            try:
                oidc_profile = request.user.oidc_profile
            except OIDCProfile.DoesNotExist:
                auth.logout(request)
                return HttpResponse("OK", status=200)

            payload = {
                "id_token_hint": oidc_profile.id_token,
                "refresh_token": oidc_profile.refresh_token,
                "client_id": settings.OIDC_RP_CLIENT_ID,
                "client_secret": settings.OIDC_RP_CLIENT_SECRET,
            }

            response = requests.post(
                settings.OIDC_OP_LOGOUT_ENDPOINT,
                data=payload,
                verify=self.get_settings("OIDC_VERIFY_SSL", True),
                timeout=self.get_settings("OIDC_TIMEOUT", None),
                proxies=self.get_settings("OIDC_PROXY", None),
            )

            try:
                response.raise_for_status()
            except HTTPError as e:
                logger.error(str(e))

            auth.logout(request)
            self.clear_user_sessions(oidc_profile)

        return HttpResponse("OK", status=200)


class HelsinkiOIDCUserInfoView(View):
    """Gets the userinfo from OP"""

    http_method_names = ["get"]

    def get_userinfo(self, access_token):
        response = get_userinfo(access_token)
        return JsonResponse(response)

    def get(self, request):
        response = HttpResponse("Unauthorized", status=401)

        if request.user.is_authenticated:
            try:
                oidc_profile = request.user.oidc_profile
                if not oidc_profile.is_active_access_token:
                    oidc_profile = refresh_hki_tokens(oidc_profile)

                response = self.get_userinfo(oidc_profile.access_token)
            except (HTTPError, SuspiciousOperation, OIDCProfile.DoesNotExist):
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
            logger.debug("Incorrect backchannel logout_token: sub")
            raise SuspiciousOperation("Incorrect logout_token: sub")

        events = logout_token.get("events")
        try:
            if (
                not events
                or "http://schemas.openid.net/event/backchannel-logout"
                not in events.keys()
            ):
                logger.debug("Incorrect backchannel logout_token: events")
                raise SuspiciousOperation("Incorrect logout_token: events")
        except AttributeError:
            logger.debug("Incorrect backchannel logout_token: events")
            raise SuspiciousOperation("Incorrect logout_token: events")

        if logout_token.get("nonce"):
            logger.debug("Incorrect backchannel logout_token: nonce")
            raise SuspiciousOperation("Incorrect logout_token: nonce")

    def clear_user_sessions(self, user):
        oidc_profile = getattr(user, "oidc_profile", None)
        if oidc_profile:
            eauthorization_profile = getattr(
                oidc_profile, "eauthorization_profile", None
            )

            clear_oidc_profiles(oidc_profile)
            if eauthorization_profile:
                clear_eauthorization_profiles(eauthorization_profile)

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
                logger.warning(
                    f"Login failed: Multiple users found with the given 'sub' claim: {claims.get('sub', None)}"
                )
                return HttpResponse(
                    "Multiple users found with the given 'sub' claim",
                    status=400,
                )
            else:
                logger.warning(
                    f"Login failed: No user with sub {claims.get('sub', None)} found"
                )
                return HttpResponse(
                    "No users found with the given 'sub' claim", status=400
                )

            return HttpResponse("OK", status=200)

        return HttpResponse("No logout token found in the request payload", status=400)
