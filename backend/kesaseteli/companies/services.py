import logging

from django.conf import settings
from requests.exceptions import HTTPError
from rest_framework.exceptions import NotFound
from shared.oidc.models import EAuthorizationProfile
from shared.oidc.utils import get_organization_roles
from shared.ytj.ytj_client import YTJClient

from common.tests.factories import CompanyFactory
from companies.models import Company

LOGGER = logging.getLogger(__name__)


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
    ytj_client = YTJClient()

    ytj_data = ytj_client.get_company_info_with_business_id(business_id)
    company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

    return get_or_create_company_using_company_data(company_data, ytj_data)


def get_or_create_company_with_name_and_business_id(
    name: str,
    business_id: str,
) -> Company:
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
    """
    The flow will execute only step 1 or steps 1-4 if company does not exist in db.

    Steps:
    1. Tries to fetch the company from database.
    2. If not found, fetches the company name and business id from suomi.fi eauthorizations API.
    3. The company info (company_form, industry, street_address, postcode and city) is then fetched
    from YTJ API.
    4. Create a company to db with the fetched info. If company info is not found from YTJ API (no company found with
    the provided business id or the request limit of YTJ API has been met), the company is created only with the name
    and business id.
    """
    company = getattr(eauth_profile, "company", None)

    if not company:
        if settings.MOCK_FLAG:
            company = CompanyFactory(eauth_profile=eauth_profile)
        else:
            try:
                organization_roles = get_organization_roles(eauth_profile)
            except HTTPError:
                raise NotFound(
                    detail="Unable to fetch organization roles from eauthorizations API"
                )

            business_id = organization_roles.get("identifier")

            company = Company.objects.filter(business_id=business_id).first()

            if not company or not company.ytj_json:
                try:
                    company = get_or_create_company_from_ytj_api(business_id)
                except ValueError:
                    raise NotFound(detail="Could not handle the response from YTJ API")
                except HTTPError:
                    LOGGER.warning(
                        f"YTJ API is under heavy load or no company found with the given business id: {business_id}"
                    )
                    name = organization_roles.get("name")
                    company = get_or_create_company_with_name_and_business_id(
                        name, business_id
                    )

            company.eauth_profile = eauth_profile
            company.save()

    return company
