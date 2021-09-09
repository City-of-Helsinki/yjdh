from datetime import timedelta
from typing import Union

from django.db.models import QuerySet
from django.utils import timezone

from shared.oidc.models import EAuthorizationProfile, OIDCProfile


def create_oidc_profile(user, defaults: dict) -> OIDCProfile:
    if getattr(user, "oidc_profile", None):
        user.oidc_profile.delete()
    oidc_profile = OIDCProfile.objects.create(
        user=user,
        **defaults,
    )
    return oidc_profile


def clear_oidc_profiles(
    oidc_profiles: Union[OIDCProfile, "QuerySet[OIDCProfile]"]
) -> None:
    oidc_profiles.delete()


def clear_eauthorization_profiles(
    eauthorization_profiles: Union[
        EAuthorizationProfile, "QuerySet[EAuthorizationProfile]"
    ],
) -> None:
    eauthorization_profiles.delete()


def clear_user_sessions(user):
    oidc_profile = getattr(user, "oidc_profile", None)
    if oidc_profile:
        eauthorization_profile = getattr(oidc_profile, "eauthorization_profile", None)

        clear_oidc_profiles(oidc_profile)
        if eauthorization_profile:
            clear_eauthorization_profiles(eauthorization_profile)


def get_defaults(token_info: dict):
    defaults = {}

    if id_token := token_info.get("id_token"):
        defaults["id_token"] = id_token

    if access_token := token_info.get("access_token"):
        defaults["access_token"] = access_token

    if access_token_expires := token_info.get("expires_in"):
        defaults["access_token_expires"] = timezone.now() + timedelta(
            seconds=access_token_expires - 5  # Add a bit of headroom
        )

    if refresh_token := token_info.get("refresh_token"):
        defaults["refresh_token"] = refresh_token

    if refresh_token_expires := token_info.get("refresh_expires_in"):
        defaults["refresh_token_expires"] = timezone.now() + timedelta(
            seconds=refresh_token_expires - 5  # Add a bit of headroom
        )
    return defaults


def store_token_info_in_oidc_profile(user, token_info):
    """Store token info in the OIDCProfile model and return the model instance."""
    defaults = get_defaults(token_info)

    oidc_profile = create_oidc_profile(user, defaults)
    return oidc_profile


def update_or_create_eauth_profile(
    oidc_profile: OIDCProfile, defaults: dict
) -> EAuthorizationProfile:
    eauth_profile, _ = EAuthorizationProfile.objects.update_or_create(
        oidc_profile=oidc_profile,
        defaults=defaults,
    )
    return eauth_profile


def store_token_info_in_eauth_profile(
    oidc_profile: OIDCProfile,
    token_info: dict,
    company_business_id: str = "",
) -> EAuthorizationProfile:
    """Store token info in the EAuthorizationProfile model and return the model instance."""
    defaults = get_defaults(token_info)

    if company_business_id:
        defaults["company_business_id"] = company_business_id

    eauth_profile = update_or_create_eauth_profile(oidc_profile, defaults)
    return eauth_profile
