from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
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
    """

    @staticmethod
    def allow_empty_handler() -> bool:
        """
        Is an empty handler user allowed?
        """
        return settings.NEXT_PUBLIC_MOCK_FLAG

    @staticmethod
    def get_handler_users_queryset():
        """
        Queryset of the users who have permission to act as handlers for youth
        applications / youth summer vouchers.

        :return: All users if NEXT_PUBLIC_MOCK_FLAG setting is set, otherwise active
                 users who are staff or superuser users.
        """
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return get_user_model().objects.all()

        return get_user_model().objects.filter(
            Q(is_active=True) & (Q(is_staff=True) | Q(is_superuser=True))
        )

    @staticmethod
    def has_user_permission(user):
        """
        Does the user have permission to act as a handler for youth applications / youth
        summer vouchers?

        :return: True if NEXT_PUBLIC_MOCK_FLAG setting is set, or user is an active
                 staff or superuser user, otherwise False.
        """
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True

        return bool(user and user.is_active and (user.is_staff or user.is_superuser))

    def has_permission(self, request, view):
        """
        Does the request's user have permission to the given view?

        :return: True if NEXT_PUBLIC_MOCK_FLAG setting is set, or request has an active
                 staff or superuser user, otherwise False.
        """
        return HandlerPermission.has_user_permission(request.user)
