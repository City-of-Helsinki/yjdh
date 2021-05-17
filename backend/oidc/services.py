from oidc.models import OIDCProfile


def update_or_create_oidc_profile(user, defaults) -> OIDCProfile:
    oidc_profile, _ = OIDCProfile.objects.update_or_create(
        user=user,
        defaults=defaults,
    )
    return oidc_profile


def clear_oidc_profile(oidc_profile: OIDCProfile) -> None:
    OIDCProfile.objects.filter(id=oidc_profile.id).update(
        id_token="",
        access_token="",
        access_token_expires=None,
        refresh_token="",
        refresh_token_expires=None,
    )
