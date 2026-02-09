from typing import Optional

from django.http import HttpRequest
from rest_framework.permissions import BasePermission

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication
from companies.models import Company
from companies.services import get_or_create_company_using_organization_roles

ALLOWED_APPLICATION_VIEW_STATUSES = [
    EmployerApplicationStatus.DRAFT,
    EmployerApplicationStatus.SUBMITTED,
]

ALLOWED_APPLICATION_UPDATE_STATUSES = [
    EmployerApplicationStatus.DRAFT,
]


def get_user_company(request: HttpRequest) -> Optional[Company]:
    user_company = get_or_create_company_using_organization_roles(request)

    return user_company


def has_employer_application_permission(
    request: HttpRequest, employer_application: EmployerApplication
) -> bool:
    """
    Allow access only to DRAFT status employer applications of the user's company.
    """
    return (
        request.user.is_staff
        or request.user.is_superuser
        or (
            employer_application.company == get_user_company(request)
            and employer_application.status in ALLOWED_APPLICATION_VIEW_STATUSES
        )
    )


class EmployerApplicationPermission(BasePermission):
    """
    Permission check for employer applications.
    """

    def has_object_permission(self, request, view, obj):
        return has_employer_application_permission(request, obj)


class EmployerSummerVoucherPermission(BasePermission):
    """
    Permission check for employer summer vouchers.
    """

    def has_object_permission(self, request, view, obj):
        return has_employer_application_permission(request, obj.application)


class StaffPermission(BasePermission):
    """
    Permission check that allows only staff users.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff
