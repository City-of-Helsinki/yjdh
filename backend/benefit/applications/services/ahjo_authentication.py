from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Dict, Union

import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ObjectDoesNotExist

from applications.models import AhjoSetting
from applications.services.ahjo.exceptions import (
    AhjoTokenExpiredError,
    AhjoTokenRetrievalError,
)

AUTH_TOKEN_GRANT_TYPE = "authorization_code"
REFRESH_TOKEN_GRANT_TYPE = "refresh_token"
REFRESH_TOKEN_EXPIRES_IN = 1296000  # 15 days


@dataclass
class AhjoToken:
    access_token: str = ""
    refresh_token: str = ""
    expires_in: int = REFRESH_TOKEN_EXPIRES_IN  # 15 days
    created_at: datetime = (None,)

    def expiry_datetime(self) -> datetime:
        return self.created_at + timedelta(seconds=int(self.expires_in))

    def has_expired(self) -> bool:
        return self.expiry_datetime() < datetime.now(timezone.utc)

    def __str__(self) -> str:
        return f"Ahjo access token, refresh_token expiry date: {self.expiry_datetime()}"


class AhjoConnector:
    def __init__(self) -> None:
        self.token_url: str = settings.AHJO_TOKEN_URL
        self.client_id: str = settings.AHJO_CLIENT_ID
        self.client_secret: str = settings.AHJO_CLIENT_SECRET
        self.redirect_uri: str = settings.AHJO_REDIRECT_URL

        self.grant_type_for_auth_token: str = AUTH_TOKEN_GRANT_TYPE
        self.grant_type_for_refresh_token: str = REFRESH_TOKEN_GRANT_TYPE
        self.headers: Dict[str, str] = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        self.timeout: int = 60

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

    def get_initial_token(self) -> AhjoToken:
        """Retrieve the initial access token from Ahjo API using the auth code,
        this is only used when getting and setting the initial token manually.
        If the initial token fails for some reason, a new ahjo_code must be saved into django.
        """  # noqa: E501
        try:
            auth_code = AhjoSetting.objects.get(name="ahjo_code")

            payload = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": self.grant_type_for_auth_token,
                "code": auth_code.data.get("code", ""),
                "redirect_uri": self.redirect_uri,
            }
            return self.do_token_request(payload)
        except ObjectDoesNotExist:
            raise ImproperlyConfigured("No auth code found in the database")

    def refresh_token(self) -> AhjoToken:
        """Refresh access token from Ahjo API using the refresh token of an existing token.
        This should be used by, for example, a cron job to keep the token up to date.
        """  # noqa: E501
        token = self.get_token_from_db()

        if not token.refresh_token:
            raise ImproperlyConfigured("No refresh token configured")

        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": self.grant_type_for_refresh_token,
            "refresh_token": token.refresh_token,
        }

        return self.do_token_request(payload)

    def do_token_request(self, payload: Dict[str, str]) -> Union[AhjoToken, None]:
        # Make the POST request
        try:
            response = requests.post(
                self.token_url, headers=self.headers, data=payload, timeout=self.timeout
            )
        except requests.exceptions.RequestException as e:
            raise AhjoTokenRetrievalError(
                f"Failed to get or refresh token from Ahjo: {e}"
            )

        # Check if the request was successful
        if response.status_code == 200:
            # Extract the access token from the JSON response
            access_token = response.json().get("access_token", "")
            refresh_token = response.json().get("refresh_token", "")

            token_from_api = AhjoToken(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=REFRESH_TOKEN_EXPIRES_IN,
            )

            return self.create_token(token_from_api)
        else:
            raise AhjoTokenRetrievalError(
                f"Failed to retrieve or refresh token: {response.status_code}"
                f" {response.content.decode()}"
            )

    def get_token_from_db(self) -> Union[AhjoToken, None]:
        """Get token from AhjoSetting table"""
        try:
            token = AhjoSetting.objects.get(name="ahjo_access_token")
            ahjo_token = AhjoToken(
                access_token=token.data.get("access_token", ""),
                refresh_token=token.data.get("refresh_token", ""),
                expires_in=token.data.get("expires_in", ""),
                created_at=token.created_at,
            )
            if ahjo_token.has_expired():
                raise AhjoTokenExpiredError(
                    f"Ahjo access token has expired in {ahjo_token.expiry_datetime()}"
                )
            return ahjo_token
        except ObjectDoesNotExist:
            raise ImproperlyConfigured("No access token found in the database")

    def create_token(
        self,
        token: AhjoToken,
    ) -> AhjoToken:
        """Save or update token data to AhjoSetting table"""

        access_token_data = {
            "access_token": token.access_token,
            "refresh_token": token.refresh_token,
            "expires_in": token.expires_in,
        }

        # Delete old access token if it exists, so that only one token is stored and
        # there will be
        # no need to calculate the expiry time of the token from the modified_at field
        AhjoSetting.objects.filter(name="ahjo_access_token").delete()

        token_setting = AhjoSetting.objects.create(
            name="ahjo_access_token", data=access_token_data
        )

        return AhjoToken(
            access_token=token_setting.data.get("access_token", ""),
            refresh_token=token_setting.data.get("refresh_token", ""),
            expires_in=token_setting.data.get("expires_in", ""),
            created_at=token_setting.created_at,
        )
