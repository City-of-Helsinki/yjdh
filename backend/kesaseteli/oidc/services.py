from datetime import timedelta
from typing import Union

from django.db.models import QuerySet
from django.utils import timezone

from oidc.models import EAuthorizationProfile, OIDCProfile


def update_or_create_oidc_profile(user, defaults) -> OIDCProfile:
    oidc_profile, _ = OIDCProfile.objects.update_or_create(
        user=user,
        defaults=defaults,
    )
    return oidc_profile


def clear_oidc_profiles(
    oidc_profiles: Union[OIDCProfile, "QuerySet[OIDCProfile]"]
) -> None:
    oidc_profiles.delete()


def clear_eauthorization_profiles(
    eauthorization_profiles: "QuerySet[EAuthorizationProfile]",
) -> None:
    eauthorization_profiles.delete()


def store_token_info_in_oidc_profile(user, token_info):
    """Store token info in the OIDCProfile model and return the model instance."""
    defaults = {}

    if id_token := token_info.get("id_token"):
        defaults["id_token"] = id_token

    if access_token := token_info.get("access_token"):
        defaults["access_token"] = access_token

    if access_token_expires := token_info.get("expires_in"):
        defaults["access_token_expires"] = timezone.now() + timedelta(
            seconds=access_token_expires
        )

    if refresh_token := token_info.get("refresh_token"):
        defaults["refresh_token"] = refresh_token

    if refresh_token_expires := token_info.get("refresh_expires_in"):
        defaults["refresh_token_expires"] = timezone.now() + timedelta(
            seconds=refresh_token_expires
        )

    oidc_profile = update_or_create_oidc_profile(user, defaults)
    return oidc_profile
