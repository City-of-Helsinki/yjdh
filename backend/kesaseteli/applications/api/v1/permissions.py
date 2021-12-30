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


def has_application_permission(
    request: HttpRequest, application: EmployerApplication
) -> bool:
    """
    Allow access only for DRAFT status applications of the user & company.
    """
    user = request.user

    if user.is_staff or user.is_superuser:
        return True

    user_company = get_user_company(request)

    if (
        application.company == user_company
        and application.user == user
        and application.status in ALLOWED_APPLICATION_VIEW_STATUSES
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


class StaffPermission(BasePermission):
    """
    Permission check for summer vouchers.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff
