import logging

import requests
from django.core.exceptions import SuspiciousOperation
from django.urls import reverse
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.utils import absolutify
from requests.exceptions import HTTPError

from shared.oidc.utils import (
    is_active_oidc_refresh_token,
    store_token_info_in_oidc_session,
)

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
                store_token_info_in_oidc_session(request, token_info)
                return user
            except SuspiciousOperation as exc:
                LOGGER.error("failed to get or create user: %s", exc)
                return None

        return None

    def refresh_tokens(self, request):
        """Refreshes the tokens of the oidc session of the user and return it."""

        if not is_active_oidc_refresh_token(request):
            raise SuspiciousOperation("Refresh token expired or does not exist")

        refresh_token = request.session.get("oidc_refresh_token")

        payload = {
            "client_id": self.OIDC_RP_CLIENT_ID,
            "client_secret": self.OIDC_RP_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        response = requests.post(
            self.OIDC_OP_TOKEN_ENDPOINT,
            data=payload,
            verify=self.get_settings("OIDC_VERIFY_SSL", True),
            timeout=self.get_settings("OIDC_TIMEOUT", None),
            proxies=self.get_settings("OIDC_PROXY", None),
        )
        response.raise_for_status()

        return store_token_info_in_oidc_session(request, response.json())
