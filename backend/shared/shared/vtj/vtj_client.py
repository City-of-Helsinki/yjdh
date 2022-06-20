import uuid
from typing import Tuple

import requests
from django.conf import settings
from django.http import HttpRequest


class VTJClient:
    """
    Client for VTJ / Väestötietojärjestelmä i.e. Finnish Population Information System.

    https://dvv.fi/en/population-information-system
    """

    def __init__(self):
        if not all([*self._auth, self._timeout, self._url]):
            raise ValueError("VTJ client settings not configured.")

    @staticmethod
    def get_end_user(request: HttpRequest) -> str:
        """
        Get end user for request.

        NOTE: request.user.username should be a UUID value for users logged in using the
              city of Helsinki's AD.

        :return: "" if request has no user, otherwise request.user.username if the
                 username represents a UUID or str(request.user.pk) if it doesn't.
        """
        if request.user:
            username = request.user.username
            try:
                uuid.UUID(username)
            except (AttributeError, TypeError, ValueError):
                return str(request.user.pk)
            return username
        return ""

    @property
    def _auth(self) -> Tuple[str, str]:
        return settings.VTJ_USERNAME, settings.VTJ_PASSWORD

    def _json(self, social_security_number, end_user: str) -> dict:
        return {
            "Henkilotunnus": social_security_number,
            "SoSoNimi": "PERUSSANOMA 1",
            "Loppukayttaja": end_user,
        }

    @property
    def _url(self):
        return settings.VTJ_PERSONAL_ID_QUERY_URL

    @property
    def _timeout(self) -> int:
        return settings.VTJ_TIMEOUT

    def get_personal_info(
        self, social_security_number, end_user: str, **kwargs
    ) -> dict:
        response = requests.post(
            self._url,
            auth=self._auth,
            json=self._json(social_security_number, end_user),
            timeout=self._timeout,
            **kwargs
        )
        response.raise_for_status()
        return response.json()
