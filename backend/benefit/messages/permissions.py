from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions
from users.utils import get_company_from_request


class IsMessageAuthor(permissions.BasePermission):
    message = _("You don't have permission to change this message")

    def has_object_permission(self, request, view, obj):
        if (
            settings.DISABLE_AUTHENTICATION
            or request.method in permissions.SAFE_METHODS
        ):
            return True
        if request.user.is_handler():
            return obj.sender == request.user
        return obj.application.company == get_company_from_request(request)
