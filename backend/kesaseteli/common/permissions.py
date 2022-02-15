from django.conf import settings
from rest_framework.permissions import BasePermission


class DenyAll(BasePermission):
    """
    Deny all access (the opposite of AllowAny).
    """

    def has_permission(self, request, view):
        return False


class HandlerPermission(BasePermission):
    """
    Does the user have permission to act as a handler for youth applications /
    youth summer vouchers?

    NOTE: This depends on the user's staff status being equal to its controller status
    which should have been updated by HelsinkiAdfsAuthCodeBackend.authenticate function.

    :return: True if NEXT_PUBLIC_MOCK_FLAG setting is set, or request has an active
    staff or superuser user, otherwise False.
    """

    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True

        return bool(
            request.user
            and request.user.is_active
            and (request.user.is_staff or request.user.is_superuser)
        )
