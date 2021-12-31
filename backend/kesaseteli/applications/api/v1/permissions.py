from typing import Optional

from django.http import HttpRequest
from rest_framework.permissions import BasePermission

from applications.enums import ApplicationStatus
from applications.models import EmployerApplication
from companies.models import Company
from companies.services import get_or_create_company_using_organization_roles

ALLOWED_APPLICATION_VIEW_STATUSES = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.SUBMITTED,
]

ALLOWED_APPLICATION_UPDATE_STATUSES = [
    ApplicationStatus.DRAFT,
]


def get_user_company(request: HttpRequest) -> Optional[Company]:
    user_company = get_or_create_company_using_organization_roles(request)

    return user_company


def has_employer_application_permission(
    request: HttpRequest, employer_application: EmployerApplication
) -> bool:
    """
    Allow access only for DRAFT status employer applications of the user & company.
    """
    user = request.user

    if user.is_staff or user.is_superuser:
        return True

    user_company = get_user_company(request)

    if (
        employer_application.company == user_company
        and employer_application.user == user
        and employer_application.status in ALLOWED_APPLICATION_VIEW_STATUSES
    ):
        return True
    return False


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
