import logging

from django.conf import settings
from django.http import HttpRequest
from requests.exceptions import RequestException
from rest_framework.exceptions import NotFound
from shared.oidc.utils import get_organization_roles
from shared.ytj.ytj_client import YTJClient

from common.tests.factories import CompanyFactory
from companies.models import Company
from companies.tests.data.company_data import DUMMY_ORG_ROLES

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


def create_mock_company_and_store_org_roles_in_session(request: HttpRequest):
    company = CompanyFactory()
    org_roles = dict(DUMMY_ORG_ROLES)
    org_roles.update(
        {
            "name": company.name,
            "identifier": company.business_id,
        }
    )
    request.session["organization_roles"] = org_roles

    return company


def handle_mock_company(request: HttpRequest):
    org_roles = request.session.get("organization_roles")
    if not org_roles:
        company = create_mock_company_and_store_org_roles_in_session(request)
    else:
        business_id = org_roles.get("identifier")
        company = Company.objects.filter(business_id=business_id).first()
        if not company:
            company = create_mock_company_and_store_org_roles_in_session(request)

    return company


def get_or_create_company_using_organization_roles(request: HttpRequest) -> Company:
    """
    The flow will execute only step 1 or steps 2-5 if company does not exist in db.

    Steps:
    1. If mock flag is set, create a mock company and store dummy organization_roles in session.
    2. Looks for organization_roles in session. If missing fetches the company name and business id from suomi.fi
    eauthorizations API and stores them in session.
    3. Tries to fetch a company from database with the business id from the organization_roles session variable.
    4. If company is missing, fetch the company info
    (company_form, industry, street_address, postcode and city) from YTJ API.
    5. If company is missing, create a company to db with the fetched info. If company info is not found from YTJ API
    (no company found with the provided business id or the request limit of YTJ API has been met), the company is
    created only with the name and business id.
    """
    if settings.MOCK_FLAG:
        return handle_mock_company(request)

    try:
        organization_roles = get_organization_roles(request)
    except RequestException:
        raise NotFound(
            detail="Unable to fetch organization roles from eauthorizations API"
        )

    business_id = organization_roles.get("identifier")

    company = Company.objects.filter(business_id=business_id).first()

    if not company:
        try:
            company = get_or_create_company_from_ytj_api(business_id)
        except ValueError:
            raise NotFound(detail="Could not handle the response from YTJ API")
        except RequestException:
            LOGGER.warning(
                f"YTJ API is under heavy load or no company found with the given business id: {business_id}"
            )
            name = organization_roles.get("name")
            company = get_or_create_company_with_name_and_business_id(name, business_id)

    return company
