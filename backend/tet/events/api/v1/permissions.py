from rest_framework.permissions import BasePermission


class TetAdminPermission(BasePermission):
    """
    Permission check for managing city TET postings.
    """

    def has_permission(self, request, view):
        user = request.user
        return user.is_staff or user.is_superuser
