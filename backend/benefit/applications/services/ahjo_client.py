import json
import logging
import uuid
from dataclasses import dataclass, field
from typing import Tuple, Union

import requests
from django.conf import settings
from django.urls import reverse

from applications.enums import AhjoRequestType, AhjoStatus as AhjoStatusEnum
from applications.models import Application
from applications.services.ahjo_authentication import AhjoToken, InvalidTokenException

LOGGER = logging.getLogger(__name__)

API_CASES_BASE = "/cases"


@dataclass
class AhjoRequest:
    application: Application
    request_type = AhjoRequestType
    url_base: str = field(
        default_factory=lambda: f"{settings.AHJO_REST_API_URL}{API_CASES_BASE}"
    )
    lang: str = "fi"

    def __str__(self):
        return (
            f"Request of type {self.request_type} for application {self.application.id}"
        )

    def api_url(self) -> str:
        if not self.application.calculation.handler.ad_username:
            raise MissingHandlerIdError(
                f"Application {self.application.id} handler does not have an ad_username"
            )
        if not self.application.ahjo_case_id:
            raise MissingAhjoCaseIdError("Application does not have an Ahjo case id")
        return f"{self.url_base}/{self.application.ahjo_case_id}/records"


@dataclass
class AhjoOpenCaseRequest(AhjoRequest):
    """Request to open a case in Ahjo."""

    request_type = AhjoRequestType.OPEN_CASE
    result_status = AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT
    request_method = "POST"

    def api_url(self) -> str:
        if not self.application.calculation.handler.ad_username:
            raise MissingHandlerIdError(
                f"Application {self.application.id} handler does not have an ad_username"
            )
        return self.url_base


@dataclass
class AhjoDecisionProposalRequest(AhjoRequest):
    """Request to send a decision proposal to Ahjo."""

    request_type = AhjoRequestType.SEND_DECISION_PROPOSAL
    result_status = AhjoStatusEnum.DECISION_PROPOSAL_SENT
    request_method = "POST"


@dataclass
class AhjoUpdateRecordsRequest(AhjoRequest):
    """Request to update records in Ahjo."""

    request_type = AhjoRequestType.UPDATE_APPLICATION
    result_status = AhjoStatusEnum.UPDATE_REQUEST_SENT
    request_method = "PUT"


@dataclass
class AhjoAddRecordsRequest(AhjoRequest):
    """Request to add new attachment records to Ahjo."""

    request_type = AhjoRequestType.ADD_RECORDS
    request_method = "POST"


@dataclass
class AhjoDeleteCaseRequest(AhjoRequest):
    """Request to delete an application in Ahjo."""

    request_type = AhjoRequestType.DELETE_APPLICATION
    result_status = AhjoStatusEnum.DELETE_REQUEST_SENT
    request_method: str = "DELETE"
    reason: str = "applicationretracted"

    def api_url(self) -> str:
        if not self.application.calculation.handler.ad_username:
            raise MissingHandlerIdError(
                f"Application {self.application.id} handler does not have an ad_username"
            )
        if not self.application.ahjo_case_id:
            raise MissingAhjoCaseIdError("Application does not have an Ahjo case id")
        # Remove /records from the url, as it is not needed for delete requests
        url = super().api_url().replace("/records", "")
        draftsman_id = self.application.calculation.handler.ad_username
        return f"{url}?draftsmanid={draftsman_id}&reason={self.reason}&apireqlang={self.lang}"


class AhjoApiClientException(Exception):
    pass


class MissingAhjoCaseIdError(AhjoApiClientException):
    pass


class MissingHandlerIdError(AhjoApiClientException):
    pass


class AhjoApiClient:
    def __init__(self, ahjo_token: AhjoToken, ahjo_request: AhjoRequest) -> None:
        self._timeout = settings.AHJO_REQUEST_TIMEOUT
        self._ahjo_token = None
        self.ahjo_token = ahjo_token
        self._request = ahjo_request

    @property
    def ahjo_token(self) -> AhjoToken:
        return self._ahjo_token

    @ahjo_token.setter
    def ahjo_token(self, token: AhjoToken) -> None:
        if not isinstance(token, AhjoToken):
            raise InvalidTokenException("Invalid token, not an instance of AhjoToken")
        if not token.access_token or not token.expires_in or not token.refresh_token:
            raise InvalidTokenException("Invalid token, token is missing data")
        self._ahjo_token = token

    def prepare_ahjo_headers(self) -> dict:
        """Prepare the headers for the Ahjo given Ahjo request type.
        The headers are used to authenticate the request to Ahjo and register a callback address.
        """
        url = reverse(
            "ahjo_callback_url",
            kwargs={
                "request_type": self._request.request_type,
                "uuid": str(self._request.application.id),
            },
        )

        return {
            "Authorization": f"Bearer {self.ahjo_token.access_token}",
            "Accept": "application/hal+json",
            "X-CallbackURL": f"{settings.API_BASE_URL}{url}",
            "Content-Type": "application/json",
        }

    def send_request_to_ahjo(
        self,
        data: Union[dict, None] = None,
    ) -> Union[Tuple[Application, str], None]:
        """Send a request to Ahjo.
        The request can be either opening a new case (POST),
        updating the records of an existing case (PUT),
        sending a decision proposal (POST)or deleting an application (DELETE).
        Returns a tuple of the application and the request id given by Ahjo if the request was successful.
        """

        try:
            method = self._request.request_method
            headers = self.prepare_ahjo_headers()
            data = json.dumps(data)
            api_url = self._request.api_url()
            response = requests.request(
                method,
                api_url,
                headers=headers,
                timeout=self._timeout,
                data=data,
            )
            response.raise_for_status()

            if response.ok:
                LOGGER.debug(f"Request {self._request} to Ahjo was successful.")
                return self._request.application, response.text
            return self._request.application, str(uuid.uuid4())
        except MissingHandlerIdError as e:
            LOGGER.error(f"Missing handler id: {e}")
        except MissingAhjoCaseIdError as e:
            LOGGER.error(f"Missing Ahjo case id: {e}")
        except requests.exceptions.HTTPError as e:
            LOGGER.error(
                f"A HTTP error occurred while sending {self._request} to Ahjo: {e}"
            )
        except requests.exceptions.RequestException as e:
            LOGGER.error(
                f"A network error occurred while sending {self._request} to Ahjo: {e}"
            )
        except AhjoApiClientException as e:
            LOGGER.error(
                f"An error occurred while sending {self._request} to Ahjo: {e}"
            )
        return None, None
