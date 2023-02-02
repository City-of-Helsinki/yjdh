from django.conf import settings
from helsinki_gdpr.views import GDPRScopesPermission


class BFGDPRScopesPermission(GDPRScopesPermission):
    """
    Override as in our case User model is directly <GDPR_API_MODEL>.
    GDPRScopesPermission assumes that it's <GDPR_API_MODEL>.user.
    Overriding also to add NEXT_PUBLIC_MOCK_FLAG option.
    """

    def has_permission(self, request, view):
        # if settings.NEXT_PUBLIC_MOCK_FLAG:
            # return True
        return super().has_permission(request, view)

    def has_object_permission(self, request, _, obj):
        # if settings.NEXT_PUBLIC_MOCK_FLAG:
            # return True
        if obj:
            return request.user == obj
        return False
