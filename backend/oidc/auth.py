import logging
from datetime import timedelta

import requests
from django.core.exceptions import SuspiciousOperation
from django.urls import reverse
from django.utils import timezone
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.utils import absolutify

from oidc.services import update_or_create_oidc_profile

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

    def store_token_info(self, user, token_info):
        """Store token info in the OIDCProfile model and return the model instance."""
        defaults = {}

        if id_token := token_info.get("id_token"):
            defaults["id_token"] = id_token

        if access_token := token_info.get("access_token"):
            defaults["access_token"] = access_token

        if access_token_expires := token_info.get("expires_in"):
            defaults["access_token_expires"] = timezone.now() + timedelta(
                seconds=access_token_expires
            )

        if refresh_token := token_info.get("refresh_token"):
            defaults["refresh_token"] = refresh_token

        if refresh_token_expires := token_info.get("refresh_expires_in"):
            defaults["refresh_token_expires"] = timezone.now() + timedelta(
                seconds=refresh_token_expires
            )

        oidc_profile = update_or_create_oidc_profile(user, defaults)
        return oidc_profile

    def authenticate(self, request, **kwargs):
        """Authenticates a user based on the OIDC code flow."""

        self.request = request
        if not self.request:
            return None

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
        token_info = self.get_token(token_payload)
        id_token = token_info.get("id_token")
        access_token = token_info.get("access_token")

        # Validate the token
        payload = self.verify_token(id_token, nonce=nonce)

        if payload:
            try:
                user = self.get_or_create_user(access_token, id_token, payload)
                self.store_token_info(user, token_info)
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

        return self.store_token_info(oidc_profile.user, response.json())
