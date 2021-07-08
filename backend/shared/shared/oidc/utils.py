import base64
import hashlib
import hmac
from uuid import uuid4

import requests
from django.conf import settings
from django.utils import timezone

from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend
from shared.oidc.models import EAuthorizationProfile, OIDCProfile


def get_userinfo(access_token: str) -> dict:
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.get_userinfo(access_token, None, None)


def refresh_hki_tokens(oidc_profile: OIDCProfile) -> OIDCProfile:
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.refresh_tokens(oidc_profile)


def get_checksum_header(path: str) -> str:
    """
    suomi.fi has a custom checksum that needs to be added for the requests.
    Docs (only in Finnish):
    Search for "4.3 Tarkistesumman laskeminen" and :
    https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/5a781dc75cb4f10dde9735e4
    """
    timestamp = timezone.now().isoformat()
    message = f"{path} {timestamp}"

    byte_secret = settings.EAUTHORIZATIONS_CLIENT_SECRET.encode()
    byte_message = message.encode()

    hash_result = hmac.new(byte_secret, byte_message, hashlib.sha256)
    checksum = base64.b64encode(hash_result.digest()).decode()
    return f"{settings.EAUTHORIZATIONS_CLIENT_ID} {timestamp} {checksum}"


def get_organization_roles(eauth_profile: EAuthorizationProfile) -> dict:
    """
    Docs (only in Finnish):
    Search for "Taulukossa 14"
    https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/592d774503f6d100018db5dd
    """
    request_id = uuid4()
    path = f"/service/ypa/api/organizationRoles/{eauth_profile.id_token}?requestId={request_id}"
    organization_roles_endpoint = f"{settings.EAUTHORIZATIONS_BASE_URL}{path}"

    checksum_header = get_checksum_header(path)

    response = requests.get(
        organization_roles_endpoint,
        headers={
            "Authorization": f"Bearer {eauth_profile.access_token}",
            "X-AsiointivaltuudetAuthorization": checksum_header,
        },
    )
    response.raise_for_status()
    return response.json()[0]
