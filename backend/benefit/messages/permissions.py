from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions

from messages.models import MessageType
from users.utils import get_company_from_request


class HasMessagePermission(permissions.BasePermission):
    message = _("You don't have permission to change this message")

    def has_object_permission(self, request, view, obj):
        if (
            settings.DISABLE_AUTHENTICATION
            or request.method in permissions.SAFE_METHODS
        ):
            return True
        # Updating message is not allowed for now
        if request.method == "PUT":
            return False
        # Handler can only delete handler message
        if request.user.is_handler():
            return obj.message_type != MessageType.APPLICANT_MESSAGE
        return obj.application.company == get_company_from_request(request)
