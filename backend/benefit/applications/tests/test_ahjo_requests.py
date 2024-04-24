from datetime import datetime, timezone
from unittest.mock import patch

import pytest
import requests
import requests_mock
from django.urls import reverse

from applications.enums import AhjoRequestType
from applications.services.ahjo_authentication import AhjoToken, InvalidTokenException
from applications.services.ahjo_client import (
    AhjoAddRecordsRequest,
    AhjoApiClient,
    AhjoApiClientException,
    AhjoDecisionProposalRequest,
    AhjoDeleteCaseRequest,
    AhjoOpenCaseRequest,
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
def application_with_ahjo_case_id(decided_application):
    decided_application.ahjo_case_id = "12345"
    decided_application.save()
    return decided_application


@pytest.fixture
def ahjo_open_case_request(application_with_ahjo_case_id):
    return AhjoOpenCaseRequest(application_with_ahjo_case_id)


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method",
    [
        (AhjoOpenCaseRequest, AhjoRequestType.OPEN_CASE, "POST"),
        (AhjoDecisionProposalRequest, AhjoRequestType.SEND_DECISION_PROPOSAL, "POST"),
        (AhjoUpdateRecordsRequest, AhjoRequestType.UPDATE_APPLICATION, "PUT"),
        (AhjoDeleteCaseRequest, AhjoRequestType.DELETE_APPLICATION, "DELETE"),
        (AhjoAddRecordsRequest, AhjoRequestType.ADD_RECORDS, "POST"),
    ],
)
def test_ahjo_requests(
    ahjo_request_class,
    application_with_ahjo_case_id,
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
    assert request.url_base == f"{settings.AHJO_REST_API_URL}{API_CASES_BASE}"
    assert request.lang == "fi"
    assert (
        str(request)
        == f"Request of type {request_type} for application {application.id}"
    )
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

    client = AhjoApiClient(dummy_token, request)

    url = reverse(
        "ahjo_callback_url",
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

    with requests_mock.Mocker() as m:
        m.register_uri(
            request.request_method, request.api_url(), text="ahjoRequestGuid"
        )
        client.send_request_to_ahjo({"foo": "bar"})
        assert m.called


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method",
    [
        (AhjoOpenCaseRequest, AhjoRequestType.OPEN_CASE, "POST"),
        (AhjoDecisionProposalRequest, AhjoRequestType.SEND_DECISION_PROPOSAL, "POST"),
        (AhjoUpdateRecordsRequest, AhjoRequestType.UPDATE_APPLICATION, "PUT"),
        (AhjoDeleteCaseRequest, AhjoRequestType.DELETE_APPLICATION, "DELETE"),
        (AhjoAddRecordsRequest, AhjoRequestType.ADD_RECORDS, "POST"),
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
):
    application = decided_application
    ahjo_request_without_ad_username = ahjo_request_class(application)

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
        m.register_uri(
            configured_request.request_method,
            configured_request.api_url(),
            status_code=400,
        )
        client.send_request_to_ahjo()
        mock_logger.error.assert_called()

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
