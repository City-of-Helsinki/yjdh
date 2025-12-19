from applications.enums import VtjTestCase
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_not_found_content,
)
import uuid
from typing import Tuple

import requests
from django.conf import settings
from django.http import HttpRequest


class VTJClient:
    """
    Client for VTJ / Väestötietojärjestelmä i.e. Finnish Population Information
    System.

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
            **kwargs,
        )
        response.raise_for_status()
        return response.json()


class VTJClientMock(VTJClient):

    @staticmethod
    def get_mocked_vtj_json_for_vtj_test_case(
        vtj_test_case, first_name, last_name, social_security_number
    ):
        if vtj_test_case == VtjTestCase.NOT_FOUND.value:
            return mock_vtj_person_id_query_not_found_content()
        elif vtj_test_case == VtjTestCase.NO_ANSWER.value:
            return None
        else:
            return mock_vtj_person_id_query_found_content(
                first_name=first_name,
                last_name=(
                    "VTJ-palvelun palauttama eri sukunimi"
                    if vtj_test_case == VtjTestCase.WRONG_LAST_NAME.value
                    else last_name
                ),
                social_security_number=social_security_number,
                is_alive=vtj_test_case != VtjTestCase.DEAD.value,
                is_home_municipality_helsinki=(
                    vtj_test_case == VtjTestCase.HOME_MUNICIPALITY_HELSINKI.value
                ),
            )

    def get_personal_info(self, social_security_number, end_user: str, is_vtj_test_case: bool = False, **kwargs) -> dict:
        # VTJ integration enabled and mocked
        if is_vtj_test_case:
            if self.vtj_test_case == VtjTestCase.NO_ANSWER.value:
                raise ReadTimeout()
            else:
                return VTJClientMock.get_mocked_vtj_json_for_vtj_test_case(
                    vtj_test_case=self.vtj_test_case,
                    first_name=self.first_name,
                    last_name=self.last_name,
                    social_security_number=self.social_security_number,
                )
        return mock_vtj_person_id_query_not_found_content()
        
def get_vtj_client():
    """
    Centralized place to decide which client to use based on environment.
    """
    if settings.NEXT_PUBLIC_DISABLE_VTJ:
        return None
        
    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return VTJClientMock()
        
    return VTJClient()