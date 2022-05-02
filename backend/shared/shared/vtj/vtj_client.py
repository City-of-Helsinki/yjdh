from typing import Tuple

import requests
from django.conf import settings


class VTJClient:
    """
    Client for VTJ / Väestötietojärjestelmä i.e. Finnish Population Information System.

    https://dvv.fi/en/population-information-system
    """

    def __init__(self):
        if not all([*self._auth, self._timeout, self._url]):
            raise ValueError("VTJ client settings not configured.")

    @property
    def _auth(self) -> Tuple[str, str]:
        return settings.VTJ_USERNAME, settings.VTJ_PASSWORD

    def _json(self, social_security_number) -> dict:
        return {
            "Henkilotunnus": social_security_number,
            "SoSoNimi": "PERUSSANOMA 1",
            "Loppukayttaja": "12345678912",
        }

    @property
    def _url(self):
        return settings.VTJ_PERSONAL_ID_QUERY_URL

    @property
    def _timeout(self) -> int:
        return settings.VTJ_TIMEOUT

    def get_personal_info(self, social_security_number, **kwargs) -> dict:
        response = requests.post(
            self._url,
            auth=self._auth,
            json=self._json(social_security_number),
            timeout=self._timeout,
            **kwargs
        )
        response.raise_for_status()
        return response.json()
