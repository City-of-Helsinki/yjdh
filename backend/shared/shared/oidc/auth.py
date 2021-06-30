import logging

import requests
from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.urls import reverse
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.utils import absolutify
from requests.exceptions import HTTPError
from rest_framework.authentication import SessionAuthentication

from shared.oidc.services import store_token_info_in_oidc_profile

LOGGER = logging.getLogger(__name__)


class HelsinkiOIDCAuthenticationBackend(OIDCAuthenticationBackend):
    """Override Mozilla Django OIDC authentication."""

    def verify_claims(self, claims):
        """Override the original verify_claims method because it verifies the claim from the email and
        email is not a mandatory field for suomi.fi authentication."""
        return True

    def filter_users_by_claims(self, claims):
        """Return all users matching the specified username (sub)."""
        username = claims.get("sub")
        if not username:
            return self.UserModel.objects.none()
        return self.UserModel.objects.filter(username__iexact=username)

    def create_user(self, claims):
        """Return object for a newly created user account. Takte the values from the userinfo fields"""
        return self.UserModel.objects.create_user(
            username=claims.get("sub"),
            first_name=claims.get("given_name"),
            last_name=claims.get("family_name"),
            email=claims.get("email"),
        )

    def authenticate(self, request, **kwargs):
        """Authenticates a user based on the OIDC code flow."""

        if not request:
            return None

        self.request = request

        state = self.request.GET.get("state")
        code = self.request.GET.get("code")
        nonce = kwargs.pop("nonce", None)

        if not code or not state:
            return None

        reverse_url = self.get_settings(
            "OIDC_AUTHENTICATION_CALLBACK_URL", "oidc_authentication_callback"
        )

        token_payload = {
            "client_id": self.OIDC_RP_CLIENT_ID,
            "client_secret": self.OIDC_RP_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": absolutify(self.request, reverse(reverse_url)),
        }

        # Get the token
        try:
            token_info = self.get_token(token_payload)
        except HTTPError:
            return None
        id_token = token_info.get("id_token")
        access_token = token_info.get("access_token")

        # Validate the token
        payload = self.verify_token(id_token, nonce=nonce)

        if payload:
            try:
                user = self.get_or_create_user(access_token, id_token, payload)
                store_token_info_in_oidc_profile(user, token_info)
                return user
            except SuspiciousOperation as exc:
                LOGGER.warning("failed to get or create user: %s", exc)
                return None

        return None

    def refresh_tokens(self, oidc_profile):
        """Refreshes the tokens of the OIDCProfile instance of the user and return it."""

        if not oidc_profile.is_active_refresh_token:
            raise SuspiciousOperation("Refresh token expired")

        payload = {
            "client_id": self.OIDC_RP_CLIENT_ID,
            "client_secret": self.OIDC_RP_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": oidc_profile.refresh_token,
        }

        response = requests.post(
            self.OIDC_OP_TOKEN_ENDPOINT,
            data=payload,
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        response.raise_for_status()

        return store_token_info_in_oidc_profile(oidc_profile.user, response.json())


class EAuthRestAuthentication(SessionAuthentication):
    def authenticate(self, request):
        user_auth_tuple = super().authenticate(request)

        if not user_auth_tuple:
            return None

        if getattr(settings, "MOCK_FLAG", None):
            from shared.oidc.models import EAuthorizationProfile, OIDCProfile
            from shared.oidc.tests.factories import (
                EAuthorizationProfileFactory,
                OIDCProfileFactory,
            )

            try:
                oidc_profile = OIDCProfile.objects.get(user=user_auth_tuple[0])
            except OIDCProfile.DoesNotExist:
                oidc_profile = OIDCProfileFactory(user=user_auth_tuple[0])

            try:
                EAuthorizationProfile.objects.get(oidc_profile=oidc_profile)
            except EAuthorizationProfile.DoesNotExist:
                EAuthorizationProfileFactory(oidc_profile=oidc_profile)

            return user_auth_tuple

        user, auth = user_auth_tuple

        if not (
            hasattr(user, "oidc_profile")
            and hasattr(user.oidc_profile, "eauthorization_profile")
            and user.oidc_profile.eauthorization_profile.id_token
            and user.oidc_profile.eauthorization_profile.access_token
        ):
            return None

        return user, auth
