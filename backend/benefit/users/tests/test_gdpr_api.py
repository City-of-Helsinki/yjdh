import datetime

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from helusers.settings import api_token_auth_settings
from jose import jwt

from shared.common.tests.factories import HelsinkiProfileUserFactory
from users.models import format_date

from .keys import rsa_key

User = get_user_model()


def get_api_token_for_user_with_scopes(user, scopes: list, requests_mock):
    """Build a proper auth token with desired scopes."""
    audience = api_token_auth_settings.AUDIENCE
    issuer = api_token_auth_settings.ISSUER
    config_url = f"{issuer}/.well-known/openid-configuration"
    jwks_url = f"{issuer}/protocol/openid-connect/certs"

    configuration = {
        "issuer": issuer,
        "jwks_uri": jwks_url,
    }

    keys = {"keys": [rsa_key.public_key_jwk]}

    now = datetime.datetime.now()
    expire = now + datetime.timedelta(days=14)

    jwt_data = {
        "iss": issuer,
        "aud": audience,
        "sub": str(user.username),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "authorization": {"permissions": [{"scopes": scopes}]},
    }
    encoded_jwt = jwt.encode(
        jwt_data, key=rsa_key.private_key_pem, algorithm=rsa_key.jose_algorithm
    )

    requests_mock.get(config_url, json=configuration)
    requests_mock.get(jwks_url, json=keys)

    auth_header = f"{api_token_auth_settings.AUTH_SCHEME} {encoded_jwt}"

    return auth_header


@pytest.mark.django_db
def test_get_profile_data_from_gdpr_api(gdpr_api_client, requests_mock):
    user = HelsinkiProfileUserFactory()
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_QUERY_SCOPE], requests_mock
    )
    valid_response = {
        "key": "USER",
        "children": [
            {"key": "FIRST_NAME", "value": user.first_name},
            {"key": "LAST_NAME", "value": user.last_name},
            {"key": "EMAIL", "value": user.email},
            {"key": "DATE_JOINED", "value": format_date(user.date_joined)},  # type: ignore
            {"key": "LAST_LOGIN", "value": format_date(user.last_login)},  # type: ignore
        ],
    }
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.get(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": user.username})
    )
    assert response.status_code == 200
    assert response.json() == valid_response


@pytest.mark.django_db
def test_delete_profile_data_from_gdpr_api(gdpr_api_client, requests_mock):
    user = HelsinkiProfileUserFactory()
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_DELETE_SCOPE], requests_mock
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.delete(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": user.username})
    )
    assert response.status_code == 204
    with pytest.raises(User.DoesNotExist):
        User.objects.get(username=user.username)


@pytest.mark.django_db
def test_gdpr_api_requires_authentication(gdpr_api_client):
    user = HelsinkiProfileUserFactory()
    response = gdpr_api_client.get(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": user.username})
    )
    assert response.status_code == 401

    response = gdpr_api_client.delete(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": user.username})
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_user_can_only_access_their_own_profile(gdpr_api_client, requests_mock):
    user = HelsinkiProfileUserFactory()
    auth_header = get_api_token_for_user_with_scopes(
        user,
        [settings.GDPR_API_QUERY_SCOPE, settings.GDPR_API_DELETE_SCOPE],
        requests_mock,
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)

    another_user = HelsinkiProfileUserFactory()
    response = gdpr_api_client.get(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": another_user.username})
    )
    assert response.status_code == 403

    response = gdpr_api_client.delete(
        reverse("helsinki_gdpr:gdpr_v1", kwargs={"pk": another_user.username})
    )
    assert response.status_code == 403
