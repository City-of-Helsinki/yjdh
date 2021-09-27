from django.conf import settings
from rest_framework.permissions import IsAuthenticated


class BFIsAuthenticated(IsAuthenticated):
    def has_permission(self, request, view):
        # FIXME: Remove this permission when FE implemented authentication
        if settings.DISABLE_AUTHENTICATION:
            return True
        return super().has_permission(request, view)
