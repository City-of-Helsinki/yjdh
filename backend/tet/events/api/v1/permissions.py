from django.conf import settings
from django.http import HttpRequest
from rest_framework.permissions import BasePermission


class TetAPIPermission(BasePermission):
    """
    Permission to access the Linked Events API as authorized.

    There are three kinds of possible logins:

      1. Users logged in via AD belonging to a group listed in `settings.ADFS_CONTROLLER_GROUP_UUIDS`.
         This group should contain all City of Helsinki users needing to use this servicing.
         These users are logged in as staff users and should be allowed access to their own
         TET postings.
      2. Users logged in via suomi.fi (puolesta asiointi)
         The service works if we can find a business_id for the user and the user is allowed access to
         the postings of their company.
      3. Users logged in via AD NOT belonging to a group listed in `settings.ADFS_CONTROLLER_GROUP_UUIDS`.
         This could be anyone with a Microsoft account. The ADFS setup might prevent these logins,
         but we cannot be sure about this, so we need to check that not anyone is allowed to creating
         a TET posting as an employee of the city of Helsinki.

         This permission prevents case 3 from accessing the service.

         For cases 1 and 2, `ServiceClient` is responsible to further check the authorization
         based on user actions.
    """

    def has_permission(self, request: HttpRequest, view):
        # Allow all authenticated access when logins are mocked
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return bool(request.user)

        return bool(
            request.user
            and (
                (request.user.is_staff or request.user.is_superuser)
                or (request.session.get("eauth_id_token") is not None)
            )
        )
