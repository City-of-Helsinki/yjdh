"""
Contents copied from tet.tet.views. More info there.
As kesaseteli doesn't use helusers package, kesaseteli tests fail when these put
under shared code, that's why copied.
"""
from typing import Optional

from django.contrib.auth import get_user_model
from helusers._oidc_auth_impl import ApiTokenAuthentication

from shared.oidc.mixins import ForceAmrClaimToListMixin

User = get_user_model()


class HelsinkiProfileApiTokenAuthentication(
    ForceAmrClaimToListMixin, ApiTokenAuthentication
):
    pass


def resolve_user(_, payload: dict) -> Optional["User"]:
    try:
        return User.objects.get(username=payload["sub"])
    except User.DoesNotExist:
        return None
