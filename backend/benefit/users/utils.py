from shared.oidc.utils import get_organization_roles


def get_business_id_from_user(user):
    if user.is_authenticated:
        eauth_profile = user.oidc_profile.eauthorization_profile
        organization_roles = get_organization_roles(eauth_profile)
        return organization_roles.get("identifier")
    return None
