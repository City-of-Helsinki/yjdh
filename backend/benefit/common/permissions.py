from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from users.utils import get_company_from_request


class BFIsAuthenticated(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # FIXME: Remove this permission when FE implemented authentication
        if settings.DISABLE_AUTHENTICATION:
            return True
        return super().has_permission(request, view)


class BFIsApplicant(BFIsAuthenticated):
    def has_permission(self, request, view):
        # FIXME: Remove this permission when FE implemented authentication
        if settings.DISABLE_AUTHENTICATION:
            return True
        if request.user and request.user.is_staff:
            # Handlers are never applicants. This restriction is needed in order to limit
            # handler's access to draft applications.
            return False
        return super().has_permission(request, view)


class BFIsHandler(permissions.IsAdminUser):
    def has_permission(self, request, view):
        # FIXME: Remove this permission when FE implemented authentication
        if settings.DISABLE_AUTHENTICATION:
            return True
        return super().has_permission(request, view)


class TermsOfServiceAccepted(permissions.BasePermission):
    message = _("You have to accept Terms of Service before doing any action")

    def has_permission(self, request, view):
        if settings.DISABLE_AUTHENTICATION or settings.DISABLE_TOS_APPROVAL_CHECK:
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
