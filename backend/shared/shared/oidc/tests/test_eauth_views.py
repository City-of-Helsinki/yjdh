import re
from unittest import mock

import pytest
from django.conf import settings
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from freezegun import freeze_time

from shared.oidc.tests.factories import OIDCProfileFactory
from shared.oidc.utils import get_checksum_header, get_organization_roles


@freeze_time("2017-02-09T10:29:42.09")
@override_settings(
    EAUTHORIZATIONS_CLIENT_ID="ed4b7ae7",
    EAUTHORIZATIONS_CLIENT_SECRET="3ba56df8-88b8-4805-9b04-2f8e7a61",
    MOCK_FLAG=False,
)
def test_get_checksum_header():
    """
    Docs (only in Finnish):
    Search for "Tarkistesumman laskemiseen toteutetun funktion verifiointi":
    https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/5a781dc75cb4f10dde9735e4

    Checksum verification:
    path = "/service/hpa/user/register/ed4b7ae7/080297-915A?requestId=02fd35dc-99e6-477b-b6e2-03f02cbf3666"
    client_id = "ed4b7ae7"
    client_secret = "3ba56df8-88b8-4805-9b04-2f8e7a61"
    time_stamp = "2017-02-09T10:29:42.090000+00:00"
    __________________
    Result:
    ed4b7ae7 2017-02-09T10:29:42.090000+00:00 GeRKoGmGd0RFk33s2vNHutJf/TrEdwSM2Vb7qWXLESY=
    """
    path = "/service/hpa/user/register/ed4b7ae7/080297-915A?requestId=02fd35dc-99e6-477b-b6e2-03f02cbf3666"
    checksum = get_checksum_header(path)

    assert (
        checksum
        == "ed4b7ae7 2017-02-09T10:29:42.090000+00:00 GeRKoGmGd0RFk33s2vNHutJf/TrEdwSM2Vb7qWXLESY="
    )


@pytest.mark.django_db
@override_settings(
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    LOGIN_REDIRECT_URL="http://example.com/success",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
    MOCK_FLAG=False,
)
def test_get_organization_roles(requests_mock, eauthorization_profile):
    organization_roles_json = [
        {
            "name": "Activenakusteri Oy",
            "identifier": "7769480-5",
            "complete": True,
            "roles": ["NIMKO"],
        }
    ]

    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, json=organization_roles_json)

    organization_roles = get_organization_roles(eauthorization_profile)

    assert organization_roles["name"] == organization_roles_json[0]["name"]
    assert organization_roles["identifier"] == organization_roles_json[0]["identifier"]


@pytest.mark.django_db
@override_settings(
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
    MOCK_FLAG=False,
)
def test_eauth_authentication_init_view(requests_mock, user_client, user):
    OIDCProfileFactory(user=user)

    register_user_info = {
        "sessionId": "test_session",
        "userId": "test_user",
    }

    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, json=register_user_info)

    authentication_url = reverse("eauth_authentication_init")

    userinfo = {
        "national_id_num": "210281-9988",
    }

    with mock.patch(
        "shared.oidc.views.eauth_views.get_userinfo", return_value=userinfo
    ):
        response = user_client.get(authentication_url)

    assert response.status_code == 302
    assert settings.EAUTHORIZATIONS_BASE_URL in response.url
    assert "test_user" in response.url


@pytest.mark.django_db
@override_settings(
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    LOGIN_REDIRECT_URL="http://example.com/success",
    MOCK_FLAG=False,
)
def test_eauth_callback_view(requests_mock, user_client, user):
    oidc_profile = OIDCProfileFactory(user=user)

    token_info = {
        "access_token": "test2",
        "expires_in": 600,
        "refresh_token": "test3",
    }
    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.post(matcher, json=token_info)

    callback_url = f"{reverse('eauth_authentication_callback')}?code=test"
    response = user_client.get(callback_url)

    assert response.status_code == 302
    assert response.url == settings.LOGIN_REDIRECT_URL

    oidc_profile.refresh_from_db()
    eauth_profile = oidc_profile.eauthorization_profile

    access_token_expires = timezone.now() + timezone.timedelta(seconds=600)
    assert eauth_profile.access_token == "test2"
    assert eauth_profile.refresh_token == "test3"
    assert abs(
        eauth_profile.access_token_expires - access_token_expires
    ) < timezone.timedelta(seconds=10)
