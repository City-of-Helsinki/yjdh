from rest_framework.permissions import BasePermission

from applications.enums import ApplicationStatus

ALLOWED_APPLICATION_STATUSES = [
    ApplicationStatus.DRAFT,
]


def has_application_permission(request, application):
    """
    Allow access only for DRAFT status applications of the user & company.
    """
    user = request.user

    if not getattr(user, "oidc_profile", None):
        return False

    eauth_profile = user.oidc_profile.eauthorization_profile
    user_company = getattr(eauth_profile, "company", None)

    if (
        application.company == user_company
        and application.user == user
        and application.status in ALLOWED_APPLICATION_STATUSES
    ):
        return True
    return False


class ApplicationPermission(BasePermission):
    """
    Permission check for applications.
    """

    def has_object_permission(self, request, view, obj):
        return has_application_permission(request, obj)


class SummerVoucherPermission(BasePermission):
    """
    Permission check for summer vouchers.
    """

    def has_object_permission(self, request, view, obj):
        return has_application_permission(request, obj.application)
