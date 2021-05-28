import logging

import requests
from django.conf import settings
from django.contrib import auth
from django.core.exceptions import SuspiciousOperation
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.generic import View
from mozilla_django_oidc.views import OIDCLogoutView
from requests.exceptions import HTTPError

from oidc.auth import HelsinkiOIDCAuthenticationBackend
from oidc.models import OIDCProfile
from oidc.services import clear_oidc_profiles

logger = logging.getLogger(__name__)


class HelsinkiOIDCLogoutView(OIDCLogoutView):
    """Override OIDCLogoutView to match the keycloak backchannel logout"""

    def get(self, request):
        if request.user.is_authenticated:
            try:
                oidc_profile = request.user.oidc_profile
            except OIDCProfile.DoesNotExist:
                auth.logout(request)
                return HttpResponseRedirect(self.redirect_url)

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
            clear_oidc_profiles(oidc_profile)

        return HttpResponseRedirect(self.redirect_url)


class HelsinkiOIDCUserInfoView(View):
    """Gets the userinfo from OP"""

    http_method_names = ["get"]

    def get_userinfo(self, access_token, auth_backend):
        response = auth_backend.get_userinfo(access_token, None, None)
        return JsonResponse(response)

    def get(self, request):
        response = HttpResponse("Unauthorized", status=401)

        if request.user.is_authenticated:
            try:
                auth_backend = HelsinkiOIDCAuthenticationBackend()

                oidc_profile = request.user.oidc_profile
                if not oidc_profile.is_active_access_token:
                    oidc_profile = auth_backend.refresh_tokens(oidc_profile)

                response = self.get_userinfo(oidc_profile.access_token, auth_backend)
            except (HTTPError, SuspiciousOperation, OIDCProfile.DoesNotExist):
                auth.logout(request)
        return response
