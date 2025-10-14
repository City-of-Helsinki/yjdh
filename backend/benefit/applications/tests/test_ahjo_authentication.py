from datetime import datetime, timedelta, timezone

import pytest
import requests_mock
from django.core.exceptions import ImproperlyConfigured

from applications.models import AhjoSetting
from applications.services.ahjo_authentication import (
    AhjoConnector,
    AhjoToken,
    AhjoTokenExpiredError,
    AhjoTokenRetrievalError,
)

TOKEN_EXPIRY_SECONDS = 30000


@pytest.fixture
def ahjo_connector():
    return AhjoConnector()


@pytest.fixture
def token_response():
    return {
        "access_token": "access_token",
        "refresh_token": "refresh_token",
        "expires_in": TOKEN_EXPIRY_SECONDS,
    }


@pytest.fixture
def expired_token():
    return AhjoToken(
        access_token="access_token",
        refresh_token="refresh_token",
        expires_in=TOKEN_EXPIRY_SECONDS,
        created_at=datetime.now(timezone.utc) - timedelta(hours=22),
    )


@pytest.fixture
def ahjo_setting():
    return AhjoSetting.objects.create(
        name="ahjo_access_token",
        data={
            "access_token": "access_token",
            "refresh_token": "refresh_token",
            "expires_in": TOKEN_EXPIRY_SECONDS,
        },
    )


@pytest.fixture
def ahjo_code():
    return AhjoSetting.objects.create(
        name="ahjo_code",
        data={
            "code": "auth_code",
        },
    )


def test_is_configured(ahjo_connector):
    ahjo_connector.AHJO_TOKEN_URL = "http://example.com/token"
    ahjo_connector.AHJO_CLIENT_ID = "client_id"
    ahjo_connector.AHJO_CLIENT_SECRET = "client_secret"
    ahjo_connector.AHJO_REDIRECT_URL = "http://example.com/redirect"
    assert ahjo_connector.is_configured() is True

    # Test with missing config options
    ahjo_connector.token_url = ""
    assert ahjo_connector.is_configured() is False


@pytest.mark.django_db
def test_get_new_token(ahjo_connector, ahjo_code, token_response):
    # Test with valid auth code
    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token",
            json=token_response,
        )

        token = ahjo_connector.get_initial_token()
        assert isinstance(token, AhjoToken)
        assert isinstance(token.expires_in, int)
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"

    # Test with missing auth code
    AhjoSetting.objects.all().delete()

    with pytest.raises(ImproperlyConfigured):
        ahjo_connector.get_initial_token()


@pytest.mark.django_db
def test_refresh_token(ahjo_connector, ahjo_setting, token_response):
    # Test with valid refresh token

    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token",
            json=token_response,
        )

        token = ahjo_connector.refresh_token()
        assert isinstance(token, AhjoToken)
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"
        assert isinstance(token.expires_in, int)

    # Test with missing refresh token
    AhjoSetting.objects.all().delete()
    with pytest.raises(ImproperlyConfigured):
        ahjo_connector.refresh_token()


@pytest.mark.django_db
def test_refresh_expired_token(ahjo_connector, ahjo_setting, token_response):
    # Test with valid refresh token
    ahjo_setting.created_at = datetime.now(timezone.utc) - timedelta(hours=22)
    ahjo_setting.save()
    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token",
            json=token_response,
        )

    with pytest.raises(AhjoTokenExpiredError):
        ahjo_connector.refresh_token()


@pytest.mark.django_db
def test_do_token_request(ahjo_connector: AhjoConnector, token_response):
    # Test with successful request

    with requests_mock.Mocker() as m:
        m.post(
            "https://johdontyopoytahyte.hel.fi/ids4/connect/token", json=token_response
        )

        token = ahjo_connector.do_token_request({})
        assert isinstance(token, AhjoToken)
        assert token.access_token == "access_token"
        assert token.refresh_token == "refresh_token"
        assert isinstance(token.expires_in, int)

        # Test with failed request
        m.post("https://johdontyopoytahyte.hel.fi/ids4/connect/token", status_code=400)
        with pytest.raises(AhjoTokenRetrievalError):
            ahjo_connector.do_token_request({})


@pytest.mark.django_db
def test_get_token_from_db(ahjo_connector: AhjoConnector, ahjo_setting):
    token = ahjo_connector.get_token_from_db()
    assert isinstance(token, AhjoToken)
    assert token.access_token == "access_token"
    assert token.refresh_token == "refresh_token"
    assert isinstance(token.expires_in, int)
    assert isinstance(token.created_at, datetime)
    assert isinstance(token, AhjoToken)

    # Test with no token in database
    AhjoSetting.objects.all().delete()
    with pytest.raises(ImproperlyConfigured):
        token = ahjo_connector.get_token_from_db()


def test_check_if_token_is_expired(expired_token, non_expired_token):
    # Test with expired token
    assert expired_token.has_expired() is True

    # Test with valid token
    assert non_expired_token.has_expired() is False


@pytest.mark.django_db
def test_create_token(ahjo_connector: AhjoConnector, non_expired_token):
    # Test with new token
    token_to_create = AhjoToken(
        access_token="access_token",
        refresh_token="refresh_token",
        expires_in=TOKEN_EXPIRY_SECONDS,
    )
    created_token = ahjo_connector.create_token(token_to_create)
    assert isinstance(created_token, AhjoToken)

    assert AhjoSetting.objects.filter(name="ahjo_access_token").exists() is True
    token_from_db = AhjoSetting.objects.get(name="ahjo_access_token")

    assert created_token.access_token == token_to_create.access_token
    assert created_token.refresh_token == token_to_create.refresh_token
    assert created_token.expires_in == token_to_create.expires_in
    assert created_token.created_at == token_from_db.created_at
