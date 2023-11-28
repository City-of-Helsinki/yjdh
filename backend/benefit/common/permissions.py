from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

from shared.oidc.utils import get_organization_roles
from users.utils import get_company_from_request


class BFIsAuthenticated(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True
        return super().has_permission(request, view)


class BFIsApplicant(BFIsAuthenticated):
    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True
        if request.user and request.user.is_staff:
            # Handlers are never applicants. This restriction is needed in order to limit
            # handler's access to draft applications.
            return False
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True

        if request.resolver_match.view_name == "applications.api.v1.views.PrintDetail":
            user_org_roles = get_organization_roles(request)
            trustee_for_business_id = user_org_roles.get("identifier")
            return trustee_for_business_id == obj.company.business_id
        return super().has_object_permission(request, view, obj)


class BFIsHandler(permissions.IsAdminUser):
    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return True
        return super().has_permission(request, view)


class TermsOfServiceAccepted(permissions.BasePermission):
    message = _("You have to accept Terms of Service before doing any action")

    def has_permission(self, request, view):
        if settings.NEXT_PUBLIC_MOCK_FLAG or settings.DISABLE_TOS_APPROVAL_CHECK:
            return True
        user = request.user
        # Checking the session first before querying the database
        tos_accepted_session = request.session.get(
            settings.TERMS_OF_SERVICE_SESSION_KEY, None
        )
        if user.is_authenticated and (tos_accepted_session or user.is_handler()):
            return True
        else:
            from terms.models import TermsOfServiceApproval

            company = get_company_from_request(request)
            if not company:
                # company deleted from the db? Whatever has happened, applicant can't
                # proceed without a company.
                raise PermissionDenied(_("Company information is not available"))
            return not TermsOfServiceApproval.terms_approval_needed(user, company)


class SafeListPermission(permissions.BasePermission):
    """
    Ensure the request's IP address is on the safe list configured in Django settings.
    """

    message = _("Your IP address is not on the safe list.")

    def has_permission(self, request, view):
        remote_addr = request.META["REMOTE_ADDR"]
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            # disable safe list check in mock mode
            return True

        for valid_ip in settings.REST_SAFE_LIST_IPS:
            if remote_addr == valid_ip:
                return True
        return False
