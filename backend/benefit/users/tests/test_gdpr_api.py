import datetime
import json
from typing import Optional

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from helusers.settings import api_token_auth_settings
from jose import jwt

from users.models import format_date

from .keys import rsa_key

User = get_user_model()


def extract_value(gdpr_api_response: dict, key: str) -> Optional[str]:
    """Extract value from GDPR API response."""
    user: dict = gdpr_api_response["children"]
    return next((item["value"] for item in user if item["key"] == key), None)


def get_api_token_for_user_with_scopes(user, scopes: list, requests_mock):
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
        "sub": str(user.username),
        "aud": audience,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        auth_field: scopes,
    }
    encoded_jwt = jwt.encode(
        jwt_data, key=rsa_key.private_key_pem, algorithm=rsa_key.jose_algorithm
    )

    requests_mock.get(config_url, json=configuration)
    requests_mock.get(jwks_url, json=keys)

    auth_header = f"{api_token_auth_settings.AUTH_SCHEME} {encoded_jwt}"

    return auth_header


def test_get_profile_data_from_gdpr_api(gdpr_api_client, user, requests_mock):
    """Test that the profile data is valid."""
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_QUERY_SCOPE], requests_mock
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    response_dict = json.loads(response.content)
    assert response.status_code == 200
    assert extract_value(response_dict, "FIRST_NAME") == user.first_name
    assert extract_value(response_dict, "LAST_NAME") == user.last_name
    assert extract_value(response_dict, "EMAIL") == user.email
    assert extract_value(response_dict, "DATE_JOINED") == format_date(
        user.date_joined  # type: ignore
    )
    assert extract_value(response_dict, "LAST_LOGIN") == format_date(
        user.last_login  # type: ignore
    )


def test_delete_profile_data_from_gdpr_api(gdpr_api_client, user, requests_mock):
    """Test that the profile data is deleted."""
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_DELETE_SCOPE], requests_mock
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.delete(
        reverse("gdpr_v1", kwargs={"uuid": user.username})
    )
    assert response.status_code == 204
    with pytest.raises(User.DoesNotExist):
        User.objects.get(username=user.username)
