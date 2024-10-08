from datetime import datetime, timezone
from unittest.mock import patch

import pytest
import requests
import requests_mock
from django.urls import reverse

from applications.enums import AhjoRequestType, AhjoStatus as AhjoStatusEnum
from applications.models import AhjoStatus
from applications.services.ahjo_authentication import AhjoToken, InvalidTokenException
from applications.services.ahjo_client import (
    AhjoAddRecordsRequest,
    AhjoApiClient,
    AhjoApiClientException,
    AhjoDecisionDetailsRequest,
    AhjoDecisionProposalRequest,
    AhjoDeleteCaseRequest,
    AhjoOpenCaseRequest,
    AhjoSubscribeDecisionRequest,
    AhjoUpdateRecordsRequest,
    MissingHandlerIdError,
)

API_CASES_BASE = "/cases"


@pytest.fixture
def dummy_token():
    return AhjoToken(
        access_token="test",
        expires_in=3600,
        refresh_token="test",
        created_at=datetime.now(timezone.utc),
    )


@pytest.fixture
def ahjo_open_case_request(application_with_ahjo_case_id):
    return AhjoOpenCaseRequest(application_with_ahjo_case_id)


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method, callback_route",
    [
        (AhjoOpenCaseRequest, AhjoRequestType.OPEN_CASE, "POST", "ahjo_callback_url"),
        (
            AhjoDecisionProposalRequest,
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            "POST",
            "ahjo_callback_url",
        ),
        (
            AhjoUpdateRecordsRequest,
            AhjoRequestType.UPDATE_APPLICATION,
            "PUT",
            "ahjo_callback_url",
        ),
        (
            AhjoDeleteCaseRequest,
            AhjoRequestType.DELETE_APPLICATION,
            "DELETE",
            "ahjo_callback_url",
        ),
        (
            AhjoAddRecordsRequest,
            AhjoRequestType.ADD_RECORDS,
            "POST",
            "ahjo_callback_url",
        ),
        (
            AhjoSubscribeDecisionRequest,
            AhjoRequestType.SUBSCRIBE_TO_DECISIONS,
            "POST",
            "",
        ),
        (AhjoDecisionDetailsRequest, AhjoRequestType.GET_DECISION_DETAILS, "GET", ""),
    ],
)
def test_ahjo_requests(
    ahjo_request_class,
    application_with_ahjo_case_id,
    callback_route,
    dummy_token,
    request_type,
    request_method,
    settings,
):
    application = application_with_ahjo_case_id
    handler = application.calculation.handler
    handler.ad_username = "test"
    handler.save()
    settings.API_BASE_URL = "http://test.com"

    request = ahjo_request_class(application)
    assert request.application == application
    assert request.request_type == request_type
    assert request.request_method == request_method
    assert request.url_base == f"{settings.AHJO_REST_API_URL}"
    assert request.lang == "fi"
    assert str(request) == f"Request of type {request_type}"

    if request.request_type == AhjoRequestType.OPEN_CASE:
        assert request.api_url() == f"{settings.AHJO_REST_API_URL}{API_CASES_BASE}"

    elif request.request_type in [
        AhjoRequestType.SEND_DECISION_PROPOSAL,
        AhjoRequestType.UPDATE_APPLICATION,
        AhjoRequestType.ADD_RECORDS,
    ]:
        assert (
            request.api_url()
            == f"{settings.AHJO_REST_API_URL}{API_CASES_BASE}/{application.ahjo_case_id}/records"
        )

    elif request.request_type == AhjoRequestType.DELETE_APPLICATION:
        draftsman_id = application.calculation.handler.ad_username
        reason = request.reason
        url = f"{settings.AHJO_REST_API_URL}{API_CASES_BASE}/{application.ahjo_case_id}"
        assert (
            request.api_url()
            == f"{url}?draftsmanid={draftsman_id}&reason={reason}&apireqlang={request.lang}"
        )
    elif request.request_type == AhjoRequestType.SUBSCRIBE_TO_DECISIONS:
        assert request.api_url() == f"{settings.AHJO_REST_API_URL}/decisions/subscribe"

    elif request.request_type == AhjoRequestType.GET_DECISION_DETAILS:
        assert (
            request.api_url()
            == f"{settings.AHJO_REST_API_URL}/decisions/{application.ahjo_case_id}"
        )

    client = AhjoApiClient(dummy_token, request)

    if request.request_type not in [
        AhjoRequestType.SUBSCRIBE_TO_DECISIONS,
        AhjoRequestType.GET_DECISION_DETAILS,
    ]:
        url = reverse(
            callback_route,
            kwargs={
                "request_type": request.request_type,
                "uuid": str(application.id),
            },
        )

        assert client.prepare_ahjo_headers() == {
            "Authorization": f"Bearer {dummy_token.access_token}",
            "Accept": "application/hal+json",
            "X-CallbackURL": f"{settings.API_BASE_URL}{url}",
            "Content-Type": "application/json",
        }
    else:
        assert client.prepare_ahjo_headers() == {
            "Authorization": f"Bearer {dummy_token.access_token}",
            "Content-Type": "application/json",
        }

    with requests_mock.Mocker() as m:
        m.register_uri(
            request.request_method, request.api_url(), text="ahjoRequestGuid"
        )
        client.send_request_to_ahjo({"foo": "bar"})
        assert m.called


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method, previous_status",
    [
        (
            AhjoOpenCaseRequest,
            AhjoRequestType.OPEN_CASE,
            "POST",
            AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
        ),
        (
            AhjoDecisionProposalRequest,
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            "POST",
            AhjoStatusEnum.CASE_OPENED,
        ),
        (
            AhjoUpdateRecordsRequest,
            AhjoRequestType.UPDATE_APPLICATION,
            "PUT",
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
        ),
        (
            AhjoDeleteCaseRequest,
            AhjoRequestType.DELETE_APPLICATION,
            "DELETE",
            AhjoStatusEnum.CASE_OPENED,
        ),
        (
            AhjoAddRecordsRequest,
            AhjoRequestType.ADD_RECORDS,
            "POST",
            AhjoStatusEnum.CASE_OPENED,
        ),
        (
            AhjoSubscribeDecisionRequest,
            AhjoRequestType.SUBSCRIBE_TO_DECISIONS,
            "POST",
            AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
        ),
        (
            AhjoDecisionDetailsRequest,
            AhjoRequestType.GET_DECISION_DETAILS,
            "GET",
            AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO,
        ),
    ],
)
@patch("applications.services.ahjo_client.LOGGER")
def test_requests_exceptions(
    mock_logger,
    application_with_ahjo_case_id,
    decided_application,
    ahjo_request_class,
    dummy_token,
    request_type,
    request_method,
    previous_status,
):
    application = decided_application
    ahjo_request_without_ad_username = ahjo_request_class(application)

    AhjoStatus.objects.create(application=application, status=previous_status)

    if isinstance(ahjo_request_without_ad_username, AhjoDeleteCaseRequest):
        with pytest.raises(MissingHandlerIdError):
            ahjo_request_without_ad_username.api_url()

    with pytest.raises(InvalidTokenException):
        AhjoApiClient(ahjo_token="foo", ahjo_request=ahjo_request_without_ad_username)

    with pytest.raises(InvalidTokenException):
        AhjoApiClient(
            ahjo_token=AhjoToken(access_token=None),
            ahjo_request=ahjo_request_without_ad_username,
        )

    handler = application.calculation.handler
    handler.ad_username = "test"
    handler.save()

    configured_request = ahjo_request_class(application)

    client = AhjoApiClient(dummy_token, configured_request)

    with requests_mock.Mocker() as m:
        # an example of a real validation error response from ahjo
        validation_error = [
            {"message": "/Title: does not match the regex pattern [a-zA-Z0-9åäöÅÄÖ]+"},
            {
                "message": "/Records/0/SecurityReasons/0: does not match the regex pattern [a-zA-Z0-9åäöÅÄÖ]+"
            },
        ]
        m.register_uri(
            configured_request.request_method,
            configured_request.api_url(),
            status_code=400,
            json=validation_error,
        )
        client.send_request_to_ahjo()
        mock_logger.error.assert_called()
        assert (
            application.ahjo_status.latest().validation_error_from_ahjo
            == validation_error
        )

    exception = requests.exceptions.RequestException
    with requests_mock.Mocker() as m:
        m.register_uri(
            configured_request.request_method,
            configured_request.api_url(),
            exc=exception,
        )
        client.send_request_to_ahjo()
        mock_logger.error.assert_called()

    exception = AhjoApiClientException
    with requests_mock.Mocker() as m:
        m.register_uri(
            configured_request.request_method,
            configured_request.api_url(),
            exc=exception,
        )
        client.send_request_to_ahjo()
        mock_logger.error.assert_called()
