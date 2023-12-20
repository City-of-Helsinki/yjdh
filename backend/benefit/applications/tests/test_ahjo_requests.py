from unittest.mock import patch

import pytest
import requests
import requests_mock
from django.conf import settings
from django.urls import reverse

from applications.enums import AhjoRequestType, AhjoStatus
from applications.services.ahjo_integration import prepare_headers, send_request_to_ahjo


@pytest.fixture
def application_with_ahjo_case_id(decided_application):
    decided_application.ahjo_case_id = "12345"
    decided_application.save()
    return decided_application


@pytest.mark.parametrize(
    "request_type",
    [
        (AhjoRequestType.OPEN_CASE,),
        (AhjoRequestType.DELETE_APPLICATION,),
    ],
)
def test_prepare_headers(settings, request_type, decided_application):
    settings.API_BASE_URL = "http://test.com"
    access_token = "test_token"

    url = reverse(
        "ahjo_callback_url",
        kwargs={"request_type": request_type, "uuid": decided_application.id},
    )

    headers = prepare_headers(access_token, decided_application, request_type)

    expected_headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/hal+json",
        "X-CallbackURL": f"{settings.API_BASE_URL}{url}",
    }

    assert headers == expected_headers


@pytest.mark.parametrize(
    "request_type, request_url, ahjo_status",
    [
        (
            AhjoRequestType.OPEN_CASE,
            f"{settings.AHJO_REST_API_URL}/cases",
            AhjoStatus.REQUEST_TO_OPEN_CASE_SENT,
        ),
        (
            AhjoRequestType.DELETE_APPLICATION,
            f"{settings.AHJO_REST_API_URL}/cases/12345",
            AhjoStatus.DELETE_REQUEST_SENT,
        ),
    ],
)
def test_send_request_to_ahjo(
    request_type,
    request_url,
    ahjo_status,
    application_with_ahjo_case_id,
    ahjo_open_case_payload,
):
    headers = {"Authorization": "Bearer test"}

    with requests_mock.Mocker() as m:
        if request_type == AhjoRequestType.OPEN_CASE:
            m.post(request_url, text="data")
        elif request_type == AhjoRequestType.DELETE_APPLICATION:
            m.delete(request_url)
        send_request_to_ahjo(
            request_type, headers, application_with_ahjo_case_id, ahjo_open_case_payload
        )
        assert m.called

    application_with_ahjo_case_id.refresh_from_db()
    assert application_with_ahjo_case_id.ahjo_status.latest().status == ahjo_status


@patch("applications.services.ahjo_integration.LOGGER")
def test_http_error(mock_logger, application_with_ahjo_case_id):
    headers = {}

    with requests_mock.Mocker() as m, pytest.raises(requests.exceptions.HTTPError):
        m.post(f"{settings.AHJO_REST_API_URL}/cases", status_code=400)
        send_request_to_ahjo(
            AhjoRequestType.OPEN_CASE, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()

    with requests_mock.Mocker() as m, pytest.raises(requests.exceptions.HTTPError):
        m.delete(f"{settings.AHJO_REST_API_URL}/cases/12345", status_code=400)
        send_request_to_ahjo(
            AhjoRequestType.DELETE_APPLICATION, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()


@patch("applications.services.ahjo_integration.LOGGER")
def test_network_error(mock_logger, application_with_ahjo_case_id):
    headers = {}
    exception = requests.exceptions.ConnectionError

    with requests_mock.Mocker() as m, pytest.raises(exception):
        m.post(f"{settings.AHJO_REST_API_URL}/cases", exc=exception)
        send_request_to_ahjo(
            AhjoRequestType.OPEN_CASE, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()

    with requests_mock.Mocker() as m, pytest.raises(exception):
        m.delete(f"{settings.AHJO_REST_API_URL}/cases/12345", exc=exception)
        send_request_to_ahjo(
            AhjoRequestType.DELETE_APPLICATION, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()


@patch("applications.services.ahjo_integration.LOGGER")
def test_other_error(mock_logger, application_with_ahjo_case_id):
    headers = {}

    with requests_mock.Mocker() as m, pytest.raises(Exception):
        m.post(f"{settings.AHJO_REST_API_URL}/cases", exc=Exception)
        send_request_to_ahjo(
            AhjoRequestType.OPEN_CASE, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()

    with requests_mock.Mocker() as m, pytest.raises(Exception):
        m.delete(f"{settings.AHJO_REST_API_URL}/cases/12345", exc=Exception)
        send_request_to_ahjo(
            AhjoRequestType.DELETE_APPLICATION, headers, application_with_ahjo_case_id
        )

        assert m.called
        mock_logger.error.assert_called()
