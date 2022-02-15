from django.conf import settings
from rest_framework.permissions import BasePermission


class DenyAll(BasePermission):
    """
    Deny all access (the opposite of AllowAny).
    """

    def has_permission(self, request, view):
        return False


class IsHandler(BasePermission):
    """
    Is the user a youth application / youth summer voucher handler?

    NOTE: If NEXT_PUBLIC_MOCK_FLAG is set then everyone is a handler.
    """

    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True

        # TODO: Implement
        return False
