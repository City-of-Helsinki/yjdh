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
from shared.oidc.models import OIDCProfile
from shared.oidc.services import clear_oidc_profiles
from shared.oidc.utils import get_userinfo, refresh_hki_tokens

logger = logging.getLogger(__name__)


class HelsinkiOIDCAuthenticationCallbackView(OIDCAuthenticationCallbackView):
    """Override OIDC client authentication callback login success method"""

    def login_success(self):
        super().login_success()
        return HttpResponseRedirect(reverse("eauth_authentication_init"))


class HelsinkiOIDCLogoutView(OIDCLogoutView):
    """Override OIDCLogoutView to match the keycloak backchannel logout"""

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
            clear_oidc_profiles(oidc_profile)

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
