from typing import Optional

from django.contrib.auth import get_user_model

# TECHNICAL DEBT:
# Import using a private module i.e. one starting with a single underscore.
# "from helusers.oidc import ApiTokenAuthentication" lead to problems if
# django-helusers package's user model isn't used.
from helusers._oidc_auth_impl import ApiTokenAuthentication

from shared.oidc.mixins import ForceAmrClaimToListMixin

User = get_user_model()


class HelsinkiProfileApiTokenAuthentication(
    ForceAmrClaimToListMixin, ApiTokenAuthentication
):
    """
    Tunnistamo's "amr" claim is not always a list so using ForceAmrClaimToListMixin
    to force it to be a list in order to pass "amr" claim validation in authlib:
    https://github.com/lepture/authlib/blob/v1.2.0/authlib/oidc/core/claims.py#L101-L113
    """

    pass


def resolve_user(_, payload: dict) -> Optional["User"]:
    """
    User resolver function for django-helusers ApiTokenAuthentication.

    :param _: request
    :param payload: JWT token payload

    Configured using settings.OIDC_API_TOKEN_AUTH["USER_RESOLVER"], e.g.
        OIDC_API_TOKEN_AUTH = {
            ...
            "USER_RESOLVER": "shared.helsinki_profile.autentications.resolve_user"
            ...
        }
    """
    try:
        return User.objects.get(username=payload["sub"])
    except User.DoesNotExist:
        return None
