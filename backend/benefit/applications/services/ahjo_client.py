import json
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Union

import requests
from django.conf import settings
from django.urls import reverse

from applications.enums import AhjoRequestType, AhjoStatus as AhjoStatusEnum
from applications.models import AhjoSetting, AhjoStatus, Application
from applications.services.ahjo_error_writer import AhjoErrorWriter
from applications.services.ahjo.exceptions import (
    AhjoApiClientException,
    InvalidAhjoTokenException,
    MissingAhjoCaseIdError,
    MissingHandlerIdError,
    MissingOrganizationIdentifier,
)
from applications.services.ahjo_authentication import AhjoToken

LOGGER = logging.getLogger(__name__)

API_CASES_BASE = "/cases"


@dataclass
class AhjoRequest:
    request_type = AhjoRequestType
    application: Optional[Application] = None

    lang: str = "fi"
    url_base: str = field(default_factory=lambda: settings.AHJO_REST_API_URL)

    @property
    def has_application(self) -> bool:
        return self.application is not None

    def __str__(self):
        return f"Request of type {self.request_type}"

    def api_url(self) -> str:
        if not self.application.calculation.handler.ad_username:
            raise MissingHandlerIdError(
                f"Application {self.application.id} handler does not have an ad_username"
            )
        if not self.application.ahjo_case_id:
            raise MissingAhjoCaseIdError("Application does not have an Ahjo case id")
        return (
            f"{self.url_base}{API_CASES_BASE}/{self.application.ahjo_case_id}/records"
        )


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
        return f"{self.url_base}{API_CASES_BASE}"


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
    result_status = AhjoStatusEnum.NEW_RECORDS_REQUEST_SENT


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
        url = f"{self.url_base}{API_CASES_BASE}/{self.application.ahjo_case_id}"
        draftsman_id = self.application.calculation.handler.ad_username
        return f"{url}?draftsmanid={draftsman_id}&reason={self.reason}&apireqlang={self.lang}"


@dataclass
class AhjoSubscribeDecisionRequest(AhjoRequest):
    """Request to subscribe to a decision in Ahjo."""

    application = None
    request_type = AhjoRequestType.SUBSCRIBE_TO_DECISIONS
    request_method = "POST"

    def api_url(self) -> str:
        return f"{self.url_base}/decisions/subscribe"


class AhjoDecisionDetailsRequest(AhjoRequest):
    """Request to get a decision detail from Ahjo."""

    request_type = AhjoRequestType.GET_DECISION_DETAILS
    result_status = AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT
    request_method = "GET"

    def api_url(self) -> str:
        if not self.application.ahjo_case_id:
            raise MissingAhjoCaseIdError("Application does not have an Ahjo case id")
        return f"{self.url_base}/decisions/{self.application.ahjo_case_id}"


class AhjoDecisionMakerRequest(AhjoRequest):
    """Request to get a decision maker from Ahjo."""

    application = None
    request_type = AhjoRequestType.GET_DECISION_MAKER
    request_method = "GET"

    @staticmethod
    def org_identifier() -> str:
        try:
            return AhjoSetting.objects.get(name="ahjo_org_identifier").data["id"]
        except AhjoSetting.DoesNotExist:
            raise MissingOrganizationIdentifier(
                "No organization identifier found in the database."
            )

    def api_url(self) -> str:
        return f"{self.url_base}/agents/decisionmakers?start={self.org_identifier()}"


class AhjoApiClient:
    def __init__(self, ahjo_token: AhjoToken, ahjo_request: AhjoRequest) -> None:
        self._timeout = settings.AHJO_REQUEST_TIMEOUT
        self._ahjo_token = None
        self.ahjo_token = ahjo_token
        self._request = ahjo_request

    @property
    def ahjo_token(self) -> AhjoToken:
        return self._ahjo_token

    @property
    def request(self) -> AhjoRequest:
        return self._request

    @ahjo_token.setter
    def ahjo_token(self, token: AhjoToken) -> None:
        if not isinstance(token, AhjoToken):
            raise InvalidAhjoTokenException(
                "Invalid token, not an instance of AhjoToken"
            )
        if not token.access_token or not token.expires_in or not token.refresh_token:
            raise InvalidAhjoTokenException("Invalid token, token is missing data")
        self._ahjo_token = token

    def prepare_ahjo_headers(self) -> dict:
        """Prepare the headers for the Ahjo given Ahjo request type.
        The headers are used to authenticate the request to Ahjo and register a callback address.
        If the request is a subscription request, the headers are prepared \
        without a callback address in the JSON payload and the Accept and X-CallbackURL headers \
        are not needed.
        """

        headers_dict = {
            "Authorization": f"Bearer {self.ahjo_token.access_token}",
            "Content-Type": "application/json",
        }
        # Other request types than GET_DECISION_DETAILS and
        # SUBSCRIBE_TO_DECISIONS, GET_DECISION_MAKER require a callback url

        if self._request.request_type not in [
            AhjoRequestType.GET_DECISION_DETAILS,
            AhjoRequestType.SUBSCRIBE_TO_DECISIONS,
            AhjoRequestType.GET_DECISION_MAKER,
        ]:
            url = reverse(
                "ahjo_callback_url",
                kwargs={
                    "request_type": self._request.request_type,
                    "uuid": str(self._request.application.id),
                },
            )
            headers_dict["Accept"] = "application/hal+json"
            headers_dict["X-CallbackURL"] = f"{settings.API_BASE_URL}{url}"

        return headers_dict

    def send_request_to_ahjo(
        self,
        data: Union[dict, None] = None,
    ) -> Union[Tuple[Application, str], Tuple[Application, List], None]:
        """Send a request to Ahjo.
        The request can be either opening a new case (POST),
        updating the records of an existing case (PUT),
        sending a decision proposal (POST)or deleting an application (DELETE).

        Returns a tuple of the application and the response content,
        which can be the id given by Ahjo or a JSON list depending on the request type.
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
            # Create new ahjo status or update the last ahjo_status if a similar status exists,
            # which means that this is a retry
            if hasattr(self._request, "result_status") and self._request.result_status:
                AhjoStatus.objects.update_or_create(
                    application=self._request.application,
                    status=self._request.result_status,
                )

            response.raise_for_status()

            if response.ok:
                # Other requests return a text response
                if self._request.request_type not in [
                    AhjoRequestType.GET_DECISION_DETAILS,
                    AhjoRequestType.GET_DECISION_MAKER,
                ]:
                    LOGGER.debug(f"Request {self._request} to Ahjo was successful.")
                    return self._request.application, response.text
                else:
                    return self._request.application, response.json()
        except MissingHandlerIdError as e:
            error_message = f"Missing handler id for application {self.request.application.application_number}: {e}"
            LOGGER.error(error_message)
            self.write_error_to_ahjo_status(error_message)
        except MissingAhjoCaseIdError as e:
            error_message = f"Missing Ahjo case id for application {self.request.application.application_number}: {e}"
            LOGGER.error(error_message)
            self.write_error_to_ahjo_status(error_message)
        except requests.exceptions.HTTPError as e:
            self.handle_http_error(e)
        except requests.exceptions.RequestException as e:
            error_message = (
                f"A network error occurred while sending {self._request} to Ahjo: {e}"
            )
            self.write_error_to_ahjo_status(error_message)
            LOGGER.error(error_message)
        except AhjoApiClientException as e:
            LOGGER.error(
                f"An error occurred while sending {self._request} to Ahjo: {e}"
            )
        return None, None

    def handle_http_error(self, e: requests.exceptions.HTTPError) -> None:
        """Handle HTTP errors that occur when sending a request to Ahjo.
        Also log any validation errors received from Ahjo.
        """
        error_response = e.response
        try:
            error_json = error_response.json()
        except json.JSONDecodeError:
            error_json = None

        if hasattr(self._request, "application"):
            application_number = self._request.application.application_number

            error_message = self.format_error_message(e, application_number)

        else:
            error_message = self.format_error_message(e)

        if error_json:
            error_message += f" Error message: {error_json}"
            self.write_error_to_ahjo_status(error_message)

        LOGGER.error(error_message)

    def format_error_message(
        self,
        e: Union[requests.exceptions.HTTPError, requests.exceptions.RequestException],
        application_number: Union[int, None] = None,
    ) -> str:
        return f"A HTTP or network error occurred while sending {self.request} for application \
    {application_number} to Ahjo: {e}"

    def write_error_to_ahjo_status(self, error_message: str) -> None:
        """Write the error message to the Ahjo status of the application for all requests that have an application.
        The DecisionMaker request does not have an application, so it does not have an Ahjo status.
        """
        if self.request.has_application:
            AhjoErrorWriter.write_to_validation_error(
                self.request.application, error_message
            )
