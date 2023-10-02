from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, Union

import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from applications.models import AhjoSetting


@dataclass
class AhjoToken:
    access_token: str = ""
    refresh_token: str = ""
    expires_in: datetime = datetime.now()


class AhjoConnector:
    def __init__(self, requests_module: requests.Session = requests) -> None:
        self.requests_module: requests = requests_module
        self.token_url: str = settings.AHJO_TOKEN_URL
        self.client_id: str = settings.AHJO_CLIENT_ID
        self.client_secret: str = settings.AHJO_CLIENT_SECRET
        self.redirect_uri: str = settings.AHJO_REDIRECT_URL

        self.grant_type_for_auth_token: str = "authorization_code"
        self.grant_type_for_refresh_token: str = "refresh_token"
        self.headers: Dict[str, str] = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        self.timout: int = 10

    def is_configured(self) -> bool:
        """Check if all required config options are set"""
        if (
            not self.token_url
            or not self.client_id
            or not self.client_secret
            or not self.redirect_uri
        ):
            return False

        return True

    def get_access_token(self, auth_code: str) -> AhjoToken:
        """Get access token from db first, then from Ahjo if not found or expired"""
        token = self.get_token_from_db()
        if token and not self._check_if_token_is_expired(token.expires_in):
            return token
        else:
            return self.get_new_token(auth_code)

    def get_new_token(self, auth_code: str) -> AhjoToken:
        """Retrieve the initial access token from Ahjo API using the auth code,
        this is only used when getting the initial token or when the token has expired.
        """
        if not auth_code:
            raise Exception("No auth code")
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": self.grant_type_for_auth_token,
            "code": auth_code,
            "redirect_uri": self.redirect_uri,
        }
        return self.do_token_request(payload)

    def refresh_token(self) -> AhjoToken:
        """Refresh access token from Ahjo API using the refresh token of an existing token.
        This should be used by, for example, a cron job to keep the token up to date.
        """
        token = self.get_token_from_db()
        if not token.refresh_token:
            raise Exception("No refresh token")

        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": self.grant_type_for_refresh_token,
            "refresh_token": token.refresh_token,
        }

        return self.do_token_request(payload)

    def do_token_request(self, payload: Dict[str, str]) -> AhjoToken:
        # Make the POST request
        response = self.requests_module.post(
            self.token_url, headers=self.headers, data=payload, timeout=self.timout
        )

        # Check if the request was successful
        if response.status_code == 200:
            # Extract the access token from the JSON response
            access_token = response.json().get("access_token", "")
            expires_in = response.json().get("expires_in", "")
            refresh_token = response.json().get("refresh_token", "")
            expiry_datetime = self.convert_expires_in_to_datetime(expires_in)

            token = AhjoToken(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expiry_datetime,
            )
            self.set_or_update_token(token)
            return token
        else:
            raise Exception(
                f"Failed to get or refresh token: {response.status_code} {response.content.decode()}"
            )

    def get_token_from_db(self) -> Union[AhjoToken, None]:
        """Get token from AhjoSetting table"""
        try:
            token_data = AhjoSetting.objects.get(name="ahjo_access_token").data
            access_token = token_data.get("access_token", "")
            refresh_token = token_data.get("refresh_token", "")
            expires_in = token_data.get("expires_in", "")
            return AhjoToken(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=datetime.fromisoformat(expires_in),
            )
        except ObjectDoesNotExist:
            return None

    def _check_if_token_is_expired(self, expires_in: datetime) -> bool:
        """Check if access token is expired"""
        return expires_in < datetime.now()

    def set_or_update_token(
        self,
        token: AhjoToken,
    ) -> None:
        """Save or update token data to AhjoSetting table"""

        access_token_data = {
            "access_token": token.access_token,
            "refresh_token": token.refresh_token,
            "expires_in": token.expires_in.isoformat(),
        }

        AhjoSetting.objects.update_or_create(
            name="ahjo_access_token", defaults={"data": access_token_data}
        )

    def convert_expires_in_to_datetime(self, expires_in: str) -> datetime:
        """Convert expires_in seconds to datetime"""
        return datetime.now() + timedelta(seconds=int(expires_in))
