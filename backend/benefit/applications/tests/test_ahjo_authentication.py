from datetime import datetime, timedelta

import pytest
import requests_mock
from django.core.exceptions import ImproperlyConfigured

from applications.models import AhjoSetting
from applications.services.ahjo_authentication import AhjoConnector, AhjoToken


@pytest.fixture
def ahjo_connector():
    return AhjoConnector()


@pytest.fixture
def token_response():
    return {
        "access_token": "access_token",
        "refresh_token": "refresh_token",
        "expires_in": "3600",
    }


def test_is_configured(ahjo_connector):
    ahjo_connector.AHJO_TOKEN_URL = "http://example.com/token"
    ahjo_connector.AHJO_CLIENT_ID = "client_id"
    ahjo_connector.AHJO_CLIENT_SECRET = "client_secret"
    ahjo_connector.AHJO_REDIRECT_URL = "http://example.com/redirect"
    assert ahjo_connector.is_configured() is True

    # Test with missing config options
    ahjo_connector.token_url = ""
    assert ahjo_connector.is_configured() is False


def test_get_new_token(ahjo_connector, token_response):
    # Test with valid auth code
    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token",
            json=token_response,
        )

        token = ahjo_connector.get_new_token("authcode123")
        assert isinstance(token.expires_in, datetime)
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"

    # Test with missing auth code
    with pytest.raises(ImproperlyConfigured):
        ahjo_connector.get_new_token("")


def test_refresh_token(ahjo_connector, token_response):
    # Test with valid refresh token
    AhjoSetting.objects.create(
        name="ahjo_access_token",
        data={
            "access_token": "access_token",
            "refresh_token": "refresh_token",
            "expires_in": datetime.now().isoformat(),
        },
    )
    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token",
            json=token_response,
        )

        token = ahjo_connector.refresh_token()
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"
        assert isinstance(token.expires_in, datetime)

    # Test with missing refresh token
    AhjoSetting.objects.all().delete()
    with pytest.raises(Exception):
        ahjo_connector.refresh_token()


def test_do_token_request(ahjo_connector: AhjoConnector, token_response):
    # Test with successful request

    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token", json=token_response
        )

        token = ahjo_connector.do_token_request({})
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"
        assert isinstance(token.expires_in, datetime)

        # Test with failed request
        m.post("https://johdontyopoytahyte.hel.fi/ids4/connect/token", status_code=400)
        with pytest.raises(Exception):
            ahjo_connector.do_token_request({})


def test_get_token_from_db(ahjo_connector: AhjoConnector):
    # Test with token in database
    AhjoSetting.objects.create(
        name="ahjo_access_token",
        data={
            "access_token": "access_token",
            "refresh_token": "refresh_token",
            "expires_in": datetime.now().isoformat(),
        },
    )
    token = ahjo_connector.get_token_from_db()
    assert token.access_token == "access_token"
    assert token.refresh_token == "refresh_token"
    assert isinstance(token.expires_in, datetime)
    assert isinstance(token, AhjoToken)

    # Test with no token in database
    AhjoSetting.objects.all().delete()
    token = ahjo_connector.get_token_from_db()
    assert token is None


def test_check_if_token_is_expired(ahjo_connector: AhjoConnector):
    # Test with expired token
    expires_in = datetime.now() - timedelta(hours=1)
    assert ahjo_connector._check_if_token_is_expired(expires_in) is True

    # Test with valid token
    expires_in = datetime.now() + timedelta(hours=1)
    assert ahjo_connector._check_if_token_is_expired(expires_in) is False


def test_set_or_update_token(ahjo_connector: AhjoConnector):
    # Test with new token
    token = AhjoToken(
        access_token="access_token",
        refresh_token="refresh_token",
        expires_in=datetime.now() + timedelta(hours=1),
    )
    ahjo_connector.set_or_update_token(token)
    assert AhjoSetting.objects.filter(name="ahjo_access_token").exists() is True
    assert AhjoSetting.objects.get(name="ahjo_access_token").data == {
        "access_token": "access_token",
        "refresh_token": "refresh_token",
        "expires_in": token.expires_in.isoformat(),
    }

    # Test with existing token
    token = AhjoToken(
        access_token="new_access_token",
        refresh_token="new_refresh_token",
        expires_in=datetime.now() + timedelta(hours=1),
    )
    ahjo_connector.set_or_update_token(token)
    assert AhjoSetting.objects.filter(name="ahjo_access_token").count() == 1
    assert AhjoSetting.objects.get(name="ahjo_access_token").data == {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token",
        "expires_in": token.expires_in.isoformat(),
    }


def test_convert_expires_in_to_datetime(ahjo_connector):
    # Test with valid input
    expires_in = "3600"
    expiry_datetime = ahjo_connector.convert_expires_in_to_datetime(expires_in)
    assert isinstance(expiry_datetime, datetime)
    assert expiry_datetime > datetime.now()

    # Test with invalid input
    with pytest.raises(ValueError):
        ahjo_connector.convert_expires_in_to_datetime("invalid_input")
