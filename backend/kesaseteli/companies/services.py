from django.http import Http404
from requests.exceptions import HTTPError

from companies.models import Company
from companies.ytj.ytj_client import YTJClient
from oidc.models import EAuthorizationProfile
from oidc.utils import get_organization_roles


def get_or_create_company_using_company_data(
    company_data: dict, ytj_data: dict
) -> Company:
    """
    Get or create a company instance using a dict of the company data and attach the ytj_data json
    for the instance.
    """
    company, _ = Company.objects.get_or_create(
        **company_data, defaults={"ytj_json": ytj_data}
    )
    return company


def get_or_create_company_from_ytj_api(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    try:
        return Company.objects.get(business_id=business_id)
    except Company.DoesNotExist:
        ytj_client = YTJClient()

        ytj_data = ytj_client.get_company_info_with_business_id(business_id)
        company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

        return get_or_create_company_using_company_data(company_data, ytj_data)


def get_or_create_company_with_name_and_business_id(
    name: str, business_id: str
) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    """
    Get or create a company instance using a dict of the company data and attach the ytj_data json
    for the instance.
    """
    company, _ = Company.objects.get_or_create(
        name=name,
        business_id=business_id,
    )
    return company


def get_or_create_company_from_eauth_profile(
    eauth_profile: EAuthorizationProfile,
) -> Company:
    try:
        organization_roles = get_organization_roles(eauth_profile)
    except HTTPError:
        raise Http404("Unable to fetch organization roles from eauthorizations API")

    business_id = organization_roles.get("identifier")

    try:
        company = get_or_create_company_from_ytj_api(business_id)
    except ValueError:
        raise Http404("Could not handle the response from YTJ API")
    except HTTPError:
        name = organization_roles.get("name")
        company = get_or_create_company_with_name_and_business_id(name, business_id)

    return company
