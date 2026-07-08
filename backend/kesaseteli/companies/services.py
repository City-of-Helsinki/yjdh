import logging

import sentry_sdk
from django.conf import settings
from django.http import HttpRequest
from requests.exceptions import RequestException
from rest_framework.exceptions import NotFound

from applications.enums import OrganizationType
from common.tests.factories import CompanyFactory
from companies.models import Company
from companies.tests.data.company_data import DUMMY_ORG_ROLES
from shared.oidc.utils import get_organization_roles
from shared.ytj.exceptions import YTJNotFoundError, YTJParseError
from shared.ytj.ytj_client import YTJClient

LOGGER = logging.getLogger(__name__)


COMPANY_SAFE_DEFAULTS = {
    "company_form": "",
    "industry": "",
    "street_address": "",
    "postcode": "",
    "city": "",
}


def resolve_organization_type(company_form: str) -> str:
    """
    Map a YTJ company_form string to an OrganizationType enum value string.

    Uses case-insensitive substring matching against the Finnish form labels
    returned by the YTJ API.
    """
    form = (company_form or "").lower()
    if any(kw in form for kw in ("yhdistys", " ry", "ry ", "ry)")):
        return OrganizationType.ASSOCIATION.value
    if any(kw in form for kw in ("seurakunta", "kirkko")):
        return OrganizationType.PARISH.value
    return OrganizationType.COMPANY.value


def get_or_create_company_using_company_data(company_data: dict) -> Company:
    """
    Get or create a company instance using a dict of the company data and
    attach the ytj_data json for the instance.
    """
    # Normalize city name to Title Case (e.g. "Helsinki" instead of "HELSINKI")
    # to keep city values consistent in the database.
    if "city" in company_data and company_data["city"]:
        company_data["city"] = company_data["city"].title()

    # Use business_id as the primary lookup key to avoid duplicates if other
    # fields (like address) have changed in YTJ.
    business_id = company_data.pop("business_id")
    ytj_data = company_data.pop("ytj_json", {})

    defaults = {"name": "", "ytj_json": ytj_data} | company_data

    defaults.setdefault(
        "organization_type",
        resolve_organization_type(defaults.get("company_form", "")),
    )

    # Overwrite defaults only for missing or None values
    for key, value in COMPANY_SAFE_DEFAULTS.items():
        if defaults.get(key, None) is None:
            defaults[key] = value

    company, created = Company.objects.get_or_create(
        business_id=business_id, defaults=defaults
    )

    if created:
        LOGGER.info(
            f"Created company {company.name} ({company.business_id}) using YTJ data"
        )
    else:
        LOGGER.info(f"Found company {company.name} ({company.business_id})")
    return company


def get_or_create_company_from_ytj_api(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    ytj_client = YTJClient()

    ytj_data = ytj_client.get_company_info_with_business_id(business_id)
    company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

    company_data["ytj_json"] = ytj_data
    return get_or_create_company_using_company_data(company_data)


def get_or_create_company_with_name_and_business_id(
    name: str,
    business_id: str,
) -> Company:
    """
    Get or create a company instance using the company name and business_id.
    This is used as a fallback when YTJ data is not available.
    """
    LOGGER.info(
        f"Creating/getting company {name} ({business_id}) "
        "using fallback method (no YTJ data)"
    )
    company, _ = Company.objects.get_or_create(
        business_id=business_id,
        defaults={
            **COMPANY_SAFE_DEFAULTS,
            "name": name,
            "organization_type": resolve_organization_type(""),
        },
    )
    return company


def update_company_from_ytj(company: Company, raise_exception: bool = False) -> Company:
    """
    Fetch YTJ data for an existing Company and update its fields in-place.

    Returns the (refreshed) Company instance. Unless raise_exception is True, raises no
    exception on API failure — logs errors at WARNING/ERROR level instead, so callers
    are not disrupted.
    """
    try:
        ytj_client = YTJClient()
        ytj_data = ytj_client.get_company_info_with_business_id(company.business_id)
        company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

        # Explicitly assign and merge fields
        company.name = company_data.get("name") or company.name
        company.company_form = company_data.get("company_form") or company.company_form
        company.industry = company_data.get("industry") or company.industry
        company.street_address = (
            company_data.get("street_address") or company.street_address
        )
        company.postcode = company_data.get("postcode") or company.postcode

        # Normalize city name to Title Case (e.g. "Helsinki" instead of "HELSINKI")
        # to keep city values consistent in the database.
        city = company_data.get("city")
        company.city = city.title() if city else company.city

        company.organization_type = resolve_organization_type(company.company_form)
        company.ytj_json = ytj_data

        company.save(
            update_fields=[
                "name",
                "company_form",
                "industry",
                "street_address",
                "postcode",
                "city",
                "organization_type",
                "ytj_json",
                "modified_at",
            ]
        )
        LOGGER.info(f"Updated company {company.business_id} from YTJ")

    except YTJNotFoundError:
        # Expected business logic error: No need for Sentry, just log safely
        LOGGER.warning(f"YTJ not found for business_id: {company.business_id}.")
        if raise_exception:
            raise

    except YTJParseError as exc:
        # Unexpected data format: Log cleanly, send full traceback to Sentry
        LOGGER.error(
            f"YTJ parse error for business_id: {company.business_id}. "
            "Check Sentry for details."
        )
        if raise_exception:
            raise
        # Send to Sentry only if we swallow the exception locally
        sentry_sdk.capture_exception(exc)

    except RequestException as exc:
        # Network/API failure: Log cleanly, send full traceback to Sentry
        LOGGER.error(
            f"YTJ connection error for business_id: {company.business_id}. "
            "Check Sentry for details."
        )
        if raise_exception:
            raise
        # Send to Sentry only if we swallow the exception locally
        sentry_sdk.capture_exception(exc)

    return company


def create_mock_company_and_store_org_roles_in_session(request: HttpRequest) -> Company:
    # Creates and saves a mock company to the database
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


def handle_mock_company(request: HttpRequest) -> Company:
    org_roles = request.session.get("organization_roles")
    if not org_roles:
        company = create_mock_company_and_store_org_roles_in_session(request)
    else:
        business_id = org_roles.get("identifier")
        company = Company.objects.filter(business_id=business_id).first()
        if not company:
            company = create_mock_company_and_store_org_roles_in_session(request)

    LOGGER.info(
        f"Using mock company data: {company.name} ({company.business_id}). "
        f"Organization roles: {org_roles}"
    )
    return company


def get_or_create_company_using_organization_roles(
    request: HttpRequest,
) -> Company:
    """
    The flow will execute only step 1 or steps 2-5 if company does not exist in
    db.

    Steps:
    1. If mock flag is set, create a mock company and store dummy organization_roles in
       session.
    2. Looks for organization_roles in session. If missing fetches the company name and
       business id from suomi.fi eauthorizations API and stores them in session.
    3. Tries to fetch a company from database with the business id from the
       organization_roles session variable.
    4. If company is missing, fetch the company info
       (company_form, industry, street_address, postcode and city) from YTJ API.
    5. If company is missing, create a company to db with the fetched info. If company
       info is not found from YTJ API (no company found with the provided business id
       or the request limit of YTJ API has been met), the company is created only with
       the name and business id.
    """
    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return handle_mock_company(request)

    try:
        organization_roles = get_organization_roles(request)
    except RequestException as e:
        LOGGER.error(
            f"Unable to fetch organization roles from eauthorizations API: {e}"
        )
        raise NotFound(
            detail="Unable to fetch organization roles from eauthorizations API"
        )

    business_id = organization_roles.get("identifier")
    if not isinstance(business_id, str):
        LOGGER.error("Company identifier missing or invalid in organization roles")
        raise NotFound(detail="Company identifier missing from organization roles")

    company = Company.objects.filter(business_id=business_id).first()

    if not company:
        try:
            company = get_or_create_company_from_ytj_api(business_id)
        except YTJNotFoundError as e:
            LOGGER.warning(f"YTJ API error for business_id {business_id}: {e}")
        except RequestException as e:
            LOGGER.error(f"YTJ API connection error for business_id {business_id}: {e}")
        except YTJParseError as e:
            LOGGER.error(f"YTJ API parsing error for business_id {business_id}: {e}")

        # If fetching from YTJ failed, use the fallback method
        if not company:
            name = str(organization_roles.get("name") or "")
            company = get_or_create_company_with_name_and_business_id(name, business_id)

    return company
