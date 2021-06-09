from oidc.auth import HelsinkiOIDCAuthenticationBackend
from oidc.models import OIDCProfile


def get_userinfo(access_token: str) -> dict:
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.get_userinfo(access_token, None, None)


def refresh_hki_tokens(oidc_profile: OIDCProfile) -> OIDCProfile:
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    return auth_backend.refresh_tokens(oidc_profile)
