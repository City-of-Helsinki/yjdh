import base64
import hashlib
import hmac
from datetime import timedelta
from uuid import uuid4

import requests
from dateutil.parser import isoparse
from django.conf import settings
from django.http import HttpRequest
from django.utils import timezone


def get_userinfo(request: HttpRequest) -> dict:
    from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend

    access_token = request.session.get("oidc_access_token")
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.get_userinfo(access_token, None, None)


def refresh_hki_tokens(request: HttpRequest) -> dict:
    from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend

    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.refresh_tokens(request)


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


def request_organization_roles(request: HttpRequest) -> dict:
    request_id = uuid4()
    id_token = request.session.get("eauth_id_token")
    path = f"/service/ypa/api/organizationRoles/{id_token}?requestId={request_id}"
    organization_roles_endpoint = f"{settings.EAUTHORIZATIONS_BASE_URL}{path}"

    checksum_header = get_checksum_header(path)

    eauth_access_token = request.session.get("eauth_access_token")
    response = requests.get(
        organization_roles_endpoint,
        headers={
            "Authorization": f"Bearer {eauth_access_token}",
            "X-AsiointivaltuudetAuthorization": checksum_header,
        },
    )
    response.raise_for_status()
    org_roles = response.json()[0]
    if request:
        request.session["organization_roles"] = org_roles
    return org_roles


def get_organization_roles(request: HttpRequest) -> dict:
    """
    Docs (only in Finnish):
    Search for "Taulukossa 14"
    https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/592d774503f6d100018db5dd
    """
    org_roles = request.session.get("organization_roles")

    if not org_roles:
        org_roles = request_organization_roles(request)

    return org_roles


def store_token_info_in_session(request: HttpRequest, token_info: dict, prefix=""):
    session_dict = dict()

    if id_token := token_info.get("id_token"):
        session_dict[f"{prefix}_id_token"] = id_token

    if access_token := token_info.get("access_token"):
        session_dict[f"{prefix}_access_token"] = access_token

    if access_token_expires := token_info.get("expires_in"):
        session_dict[f"{prefix}_access_token_expires"] = (
            timezone.now()
            + timedelta(seconds=access_token_expires - 5)  # Add a bit of headroom
        ).isoformat()

    if refresh_token := token_info.get("refresh_token"):
        session_dict[f"{prefix}_refresh_token"] = refresh_token

    if refresh_token_expires := token_info.get("refresh_expires_in"):
        session_dict[f"{prefix}_refresh_token_expires"] = (
            timezone.now()
            + timedelta(seconds=refresh_token_expires - 5)  # Add a bit of headroom
        ).isoformat()

    request.session.update(session_dict)

    return session_dict


def store_token_info_in_oidc_session(request: HttpRequest, token_info: dict) -> dict:
    """Store token info in the session and return the values as dict."""
    return store_token_info_in_session(request, token_info, "oidc")


def store_token_info_in_eauth_session(
    request: HttpRequest,
    token_info: dict,
) -> dict:
    """Store token info in the session and return the values as dict."""
    return store_token_info_in_session(request, token_info, "eauth")


def is_active_oidc_access_token(request):
    access_token_expires = request.session.get("oidc_access_token_expires")
    if not access_token_expires:
        return False

    access_token_expires = isoparse(access_token_expires)
    if access_token_expires < timezone.now():
        return False

    return True


def is_active_oidc_refresh_token(request):
    refresh_token_expires = request.session.get("oidc_refresh_token_expires")
    if not refresh_token_expires:
        return False

    refresh_token_expires = isoparse(refresh_token_expires)
    if refresh_token_expires < timezone.now():
        return False

    return True
