import datetime
import json
from unittest import TestCase
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from helusers.settings import api_token_auth_settings
from jose import jwt

from applications.tests.factories import ApplicationFactory
from shared.common.tests.factories import UserFactory

from .keys import rsa_key

User = get_user_model()


def get_api_token_for_user_with_scopes(user, scopes, requests_mock):
    """Build a proper auth token with desired scopes."""

    audience = api_token_auth_settings.AUDIENCE
    issuer = api_token_auth_settings.ISSUER
    auth_field = api_token_auth_settings.API_AUTHORIZATION_FIELD
    config_url = f"{issuer}/.well-known/openid-configuration"
    jwks_url = f"{issuer}/jwks"
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
        auth_field: scopes,
    }
    encoded_jwt = jwt.encode(
        jwt_data, key=rsa_key.private_key_pem, algorithm=rsa_key.jose_algorithm
    )

    requests_mock.get(config_url, json=configuration)
    requests_mock.get(jwks_url, json=keys)
    auth_header = f"{api_token_auth_settings.AUTH_SCHEME} {encoded_jwt}"
    return auth_header


@override_settings(GDPR_API_QUERY_SCOPE="helsinkilisa.gdprquery")
def test_get_profile_information_from_gdpr_api(api_client, requests_mock, settings):
    user = UserFactory(username=uuid4())

    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_QUERY_SCOPE], requests_mock
    )

    api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))

    resp = json.loads(response.content)
    assert response.status_code == 200
