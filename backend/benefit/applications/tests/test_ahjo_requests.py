from datetime import timedelta
from unittest.mock import patch

import pytest
import requests
import requests_mock
from django.urls import reverse
from django.utils import timezone

from applications.enums import AhjoRequestType, AhjoStatus as AhjoStatusEnum
from applications.models import AhjoSetting, AhjoStatus
from applications.services.ahjo_authentication import AhjoToken, InvalidTokenException
from applications.services.ahjo_client import (
    AhjoAddRecordsRequest,
    AhjoApiClient,
    AhjoApiClientException,
    AhjoDecisionDetailsRequest,
    AhjoDecisionMakerRequest,
    AhjoDecisionProposalRequest,
    AhjoDeleteCaseRequest,
    AhjoOpenCaseRequest,
    AhjoSubscribeDecisionRequest,
    AhjoUpdateRecordsRequest,
    MissingHandlerIdError,
)

API_CASES_BASE = "/cases"


@pytest.fixture
def ahjo_open_case_request(application_with_ahjo_case_id):
    return AhjoOpenCaseRequest(application_with_ahjo_case_id)


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method, url_part",
    [
        (
            AhjoSubscribeDecisionRequest,
            AhjoRequestType.SUBSCRIBE_TO_DECISIONS,
            "POST",
            "/decisions/subscribe",
        ),
        (
            AhjoDecisionMakerRequest,
            AhjoRequestType.GET_DECISION_MAKER,
            "GET",
            "/agents/decisionmakers?start=",
        ),
    ],
)
def test_ahjo_requests_without_application(
    ahjo_request_class,
    request_type,
    request_method,
    url_part,
    settings,
    non_expired_token,
):
    AhjoSetting.objects.create(name="ahjo_org_identifier", data={"id": "1234567-8"})
    settings.API_BASE_URL = "http://test.com"
    request_instance = ahjo_request_class()

    assert request_instance.request_type == request_type
    assert request_instance.request_method == request_method
    assert request_instance.url_base == f"{settings.AHJO_REST_API_URL}"
    assert request_instance.lang == "fi"
    assert str(request_instance) == f"Request of type {request_type}"

    assert f"{settings.AHJO_REST_API_URL}{url_part}" in request_instance.api_url()

    client = AhjoApiClient(non_expired_token, request_instance)

    with requests_mock.Mocker() as m:
        m.register_uri(
            request_instance.request_method,
            request_instance.api_url(),
            text="ahjoRequestGuid",
        )
        client.send_request_to_ahjo({"foo": "bar"})
        assert m.called


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method, callback_route, ahjo_status_after_request",
    [
        (
            AhjoOpenCaseRequest,
            AhjoRequestType.OPEN_CASE,
            "POST",
            "ahjo_callback_url",
            AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
        ),
        (
            AhjoDecisionProposalRequest,
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            "POST",
            "ahjo_callback_url",
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
        ),
        (
            AhjoUpdateRecordsRequest,
            AhjoRequestType.UPDATE_APPLICATION,
            "PUT",
            "ahjo_callback_url",
            AhjoStatusEnum.UPDATE_REQUEST_SENT,
        ),
        (
            AhjoDeleteCaseRequest,
            AhjoRequestType.DELETE_APPLICATION,
            "DELETE",
            "ahjo_callback_url",
            AhjoStatusEnum.DELETE_REQUEST_SENT,
        ),
        (
            AhjoAddRecordsRequest,
            AhjoRequestType.ADD_RECORDS,
            "POST",
            "ahjo_callback_url",
            AhjoStatusEnum.NEW_RECORDS_REQUEST_SENT,
        ),
        (
            AhjoDecisionDetailsRequest,
            AhjoRequestType.GET_DECISION_DETAILS,
            "GET",
            "",
            AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT,
        ),
    ],
)
def test_ahjo_application_requests(
    ahjo_request_class,
    application_with_ahjo_case_id,
    callback_route,
    non_expired_token,
    request_type,
    request_method,
    settings,
    ahjo_status_after_request,
):
    application = application_with_ahjo_case_id
    ahjo_status = AhjoStatus.objects.create(
        application=application, status=AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO
    )

    ahjo_status.created_at = timezone.now() - timedelta(days=5)
    ahjo_status.save()

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

    elif request.request_type == AhjoRequestType.GET_DECISION_DETAILS:
        assert (
            request.api_url()
            == f"{settings.AHJO_REST_API_URL}/decisions/{application.ahjo_case_id}"
        )

    client = AhjoApiClient(non_expired_token, request)

    if request.request_type not in [
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
            "Authorization": f"Bearer {non_expired_token.access_token}",
            "Accept": "application/hal+json",
            "X-CallbackURL": f"{settings.API_BASE_URL}{url}",
            "Content-Type": "application/json",
        }
    else:
        assert client.prepare_ahjo_headers() == {
            "Authorization": f"Bearer {non_expired_token.access_token}",
            "Content-Type": "application/json",
        }

    with requests_mock.Mocker() as m:
        m.register_uri(
            request.request_method, request.api_url(), text="ahjoRequestGuid"
        )
        client.send_request_to_ahjo({"foo": "bar"})
        assert m.called
        application.refresh_from_db()
        assert (
            application.ahjo_status.latest().status == ahjo_status_after_request.value
        )


@pytest.mark.parametrize(
    "ahjo_request_class, request_type, request_method, previous_status",
    [
        (
            AhjoOpenCaseRequest,
            AhjoRequestType.OPEN_CASE,
            "POST",
            AhjoStatusEnum.REQUEST_TO_OPEN_CASE_SENT,
        ),
        (
            AhjoDecisionProposalRequest,
            AhjoRequestType.SEND_DECISION_PROPOSAL,
            "POST",
            AhjoStatusEnum.DECISION_PROPOSAL_SENT,
        ),
        (
            AhjoUpdateRecordsRequest,
            AhjoRequestType.UPDATE_APPLICATION,
            "PUT",
            AhjoStatusEnum.UPDATE_REQUEST_SENT,
        ),
        (
            AhjoDeleteCaseRequest,
            AhjoRequestType.DELETE_APPLICATION,
            "DELETE",
            AhjoStatusEnum.DELETE_REQUEST_SENT,
        ),
        (
            AhjoAddRecordsRequest,
            AhjoRequestType.ADD_RECORDS,
            "POST",
            AhjoStatusEnum.NEW_RECORDS_REQUEST_SENT,
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
            AhjoStatusEnum.DECISION_DETAILS_REQUEST_SENT,
        ),
    ],
)
@patch("applications.services.ahjo_client.LOGGER")
def test_requests_exceptions(
    mock_logger,
    application_with_ahjo_case_id,
    decided_application,
    ahjo_request_class,
    non_expired_token,
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

    client = AhjoApiClient(non_expired_token, configured_request)

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
        ahjo_status = application.ahjo_status.latest()
        assert ahjo_status.status == previous_status
        assert ahjo_status.validation_error_from_ahjo is not None

        for validation_error in validation_error:
            assert f"{validation_error}" in ahjo_status.validation_error_from_ahjo

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
