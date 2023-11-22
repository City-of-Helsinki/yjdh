import uuid
from unittest.mock import patch

import pytest
import requests
import requests_mock
from django.urls import reverse

from applications.enums import AhjoStatus
from applications.services.ahjo_integration import (
    do_ahjo_request_with_json_payload,
    prepare_headers,
)


def test_prepare_headers(settings):
    settings.API_BASE_URL = "http://test.com"
    access_token = "test_token"
    application_uuid = uuid.uuid4()

    headers = prepare_headers(access_token, application_uuid)

    url = reverse("ahjo_callback_url", kwargs={"uuid": str(application_uuid)})
    expected_headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/hal+json",
        "X-CallbackURL": f"{settings.API_BASE_URL}{url}",
    }

    assert headers == expected_headers


def test_do_ahjo_request_with_json_payload_success(
    decided_application, ahjo_open_case_payload
):
    url = "http://test.com"
    headers = {"Authorization": "Bearer test"}

    with requests_mock.Mocker() as m:
        m.post(f"{url}/cases", text="data")
        do_ahjo_request_with_json_payload(
            url, headers, ahjo_open_case_payload, decided_application
        )
    decided_application.refresh_from_db()
    assert (
        decided_application.ahjo_status.latest().status
        == AhjoStatus.REQUEST_TO_OPEN_CASE_SENT
    )


@patch("applications.services.ahjo_integration.LOGGER")
def test_http_error(mock_logger, decided_application, ahjo_open_case_payload):
    url = "http://mockedurl.com"
    headers = {}
    data = ahjo_open_case_payload
    application = decided_application

    with requests_mock.Mocker() as m:
        m.post(f"{url}/cases", status_code=400)
        do_ahjo_request_with_json_payload(url, headers, data, application)

        mock_logger.error.assert_called()


@patch("applications.services.ahjo_integration.LOGGER")
def test_network_error(mock_logger, decided_application, ahjo_open_case_payload):
    url = "http://mockedurl.com"
    headers = {}
    data = ahjo_open_case_payload
    application = decided_application

    with requests_mock.Mocker() as m:
        m.post(f"{url}/cases", exc=requests.exceptions.ConnectionError)
        do_ahjo_request_with_json_payload(url, headers, data, application)

        mock_logger.error.assert_called()


@patch("applications.services.ahjo_integration.LOGGER")
def test_other_exception(mock_logger, decided_application, ahjo_open_case_payload):
    url = "http://mockedurl.com"
    headers = {}
    data = ahjo_open_case_payload
    application = decided_application

    with requests_mock.Mocker() as m:
        m.post(f"{url}/cases", exc=Exception("Some error"))
        do_ahjo_request_with_json_payload(url, headers, data, application)

        mock_logger.error.assert_called()
