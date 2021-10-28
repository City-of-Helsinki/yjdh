from companies.models import Company
from companies.services import get_or_create_company_with_business_id
from django.conf import settings

from shared.oidc.utils import get_organization_roles


def get_request_user_from_context(serializer):
    request = serializer.context.get("request")
    if request:
        return request.user
    return None


def get_business_id_from_user(user, request=None):
    if user.is_authenticated:
        eauth_profile = user.oidc_profile.eauthorization_profile
        organization_roles = get_organization_roles(eauth_profile, request)
        return organization_roles.get("identifier")
    return None


def get_company_from_user(user, request=None):
    if settings.DISABLE_AUTHENTICATION:
        return Company.objects.all().order_by("name").first()

    if business_id := get_business_id_from_user(user, request):
        try:
            return Company.objects.get(
                business_id=business_id
            )  # unique constraint ensures at most one is returned
        except Company.DoesNotExist:
            # In case we cannot find the Company in DB, try to query it from 3rd party source
            # This should cover the case when first applicant of company log in because his company
            # hasn't been created yet
            return get_or_create_company_with_business_id(business_id)
    else:
        return None
