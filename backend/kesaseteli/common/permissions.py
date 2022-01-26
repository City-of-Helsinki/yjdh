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
    """

    def has_permission(self, request, view):
        # TODO: Implement
        return True
