from typing import Union

from django.conf import settings
from django.contrib.auth.models import AbstractUser, AnonymousUser

from companies.models import Company
from companies.services import get_or_create_organisation_with_business_id
from shared.oidc.utils import get_organization_roles


def set_mock_user_name(
    user: Union[AbstractUser, AnonymousUser]
) -> Union[AbstractUser, AnonymousUser]:
    """
    Set mock user name for user and return the user.
    """
    user.first_name = "Test"
    user.last_name = "User"
    return user


def get_request_user_from_context(serializer):
    request = serializer.context.get("request")
    if request:
        return request.user
    return None


def get_business_id_from_request(request):
    if request and request.user and request.user.is_authenticated:
        organization_roles = get_organization_roles(request)
        return organization_roles.get("identifier")
    return None


def get_company_from_request(request):
    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return Company.objects.all().order_by("name").first()

    if business_id := get_business_id_from_request(request):
        try:
            return Company.objects.get(
                business_id=business_id
            )  # unique constraint ensures at most one is returned
        except Company.DoesNotExist:
            # In case we cannot find the Company in DB, try to query it from 3rd party source
            # This should cover the case when first applicant of company log in because his company
            # hasn't been created yet
            return get_or_create_organisation_with_business_id(business_id)
    else:
        return None
