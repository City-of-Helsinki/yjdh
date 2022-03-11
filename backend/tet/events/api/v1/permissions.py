from rest_framework.permissions import BasePermission


class TetAdminPermission(BasePermission):
    """
    Permission check for managing city TET postings.
    """

    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))
