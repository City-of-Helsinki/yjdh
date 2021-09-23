from companies.models import Company
from django.conf import settings

from shared.oidc.utils import get_organization_roles


def get_request_user_from_context(serializer):
    request = serializer.context.get("request")
    if request:
        return request.user
    return None


def get_business_id_from_user(user):
    if user.is_authenticated:
        eauth_profile = user.oidc_profile.eauthorization_profile
        organization_roles = get_organization_roles(eauth_profile)
        return organization_roles.get("identifier")
    return None


def get_company_from_user(user):
    if settings.DISABLE_AUTHENTICATION:
        return Company.objects.all().order_by("name").first()

    if business_id := get_business_id_from_user(user):
        return Company.objects.filter(
            business_id=business_id
        ).first()  # unique constraint ensures at most one is returned
    else:
        return None
