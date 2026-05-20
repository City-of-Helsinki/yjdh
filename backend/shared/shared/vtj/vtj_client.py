import uuid
from typing import Tuple

import requests
from django.conf import settings
from django.http import HttpRequest
from requests.exceptions import RequestException

from shared.vtj.signals import vtj_queried, vtj_query_failed


class VTJClient:
    """
    Client for VTJ / Väestötietojärjestelmä i.e. Finnish Population Information
    System.

    https://dvv.fi/en/population-information-system
    """

    DEFAULT_QUERY_TYPE = "PERUSSANOMA 1"

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
        return str(settings.VTJ_USERNAME or ""), str(settings.VTJ_PASSWORD or "")

    def _json(self, social_security_number, end_user: str) -> dict:
        return {
            "Henkilotunnus": social_security_number,
            "SoSoNimi": self.DEFAULT_QUERY_TYPE,
            "Loppukayttaja": end_user,
        }

    @property
    def _url(self) -> str:
        return str(settings.VTJ_PERSONAL_ID_QUERY_URL or "")

    @property
    def _timeout(self) -> int:
        return int(settings.VTJ_TIMEOUT or 30)

    def get_personal_info(
        self, social_security_number, end_user: str, **kwargs
    ) -> dict:
        request_id = str(uuid.uuid4())
        headers = kwargs.pop("headers", {})
        headers["X-Request-ID"] = request_id
        try:
            response = requests.post(
                self._url,
                auth=self._auth,
                json=self._json(social_security_number, end_user),
                timeout=self._timeout,
                headers=headers,
                **kwargs,
            )
            response.raise_for_status()
        except RequestException as e:
            vtj_query_failed.send(
                sender=self.__class__,
                end_user=end_user,
                social_security_number=social_security_number,
                error=e,
                request_id=request_id,
            )
            raise

        vtj_queried.send(
            sender=self.__class__,
            end_user=end_user,
            social_security_number=social_security_number,
            request_id=request_id,
        )
        return response.json()
