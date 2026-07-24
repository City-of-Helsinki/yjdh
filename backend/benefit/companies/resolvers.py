from requests.exceptions import RequestException
from suomifi_on_behalf import CompanyResolutionError

from companies.models import Company
from shared.service_bus.service_bus_client import ServiceBusClient
from shared.yrtti.yrtti_client import YRTTIClient


def _get_business_id(request) -> str:
    roles = request.session.get("organization_roles") or {}
    business_id = roles.get("identifier")
    if not business_id:
        raise CompanyResolutionError(
            "No business id ('identifier') in session organization_roles"
        )
    return business_id


def _company_to_dict(company: Company) -> dict:
    return {
        "name": company.name,
        "business_id": company.business_id,
        "company_form": company.company_form,
        "company_form_code": company.company_form_code,
        "industry": company.industry,
        "industry_code": company.industry_code,
        "street_address": company.street_address,
        "postcode": company.postcode,
        "city": company.city,
    }


class ServiceBusCompanyResolver:
    """Resolve company data from Palveluvayla / Service Bus (YTJ)."""

    def __call__(self, request) -> dict:
        business_id = _get_business_id(request)
        try:
            company_data = ServiceBusClient().get_organisation_info_with_business_id(
                business_id
            )
        except RequestException as e:
            raise CompanyResolutionError(str(e)) from e
        if not company_data:
            raise CompanyResolutionError(
                f"Service Bus returned no company for business id {business_id}"
            )
        return company_data


class YrttiCompanyResolver:
    """Resolve association data from YRTTI."""

    def __call__(self, request) -> dict:
        business_id = _get_business_id(request)
        try:
            association_data = YRTTIClient().get_association_info_with_business_id(
                business_id
            )
        except RequestException as e:
            raise CompanyResolutionError(str(e)) from e
        if not association_data:
            raise CompanyResolutionError(
                f"YRTTI returned no association for business id {business_id}"
            )
        return association_data


class DbCompanyResolver:
    """
    Return the company already stored in benefit's database.
    Raises CompanyResolutionError if the company doesn't exist in the database.

    Should be used as terminal fallback, i.e. after every other company resolver has
    failed.
    """

    def __call__(self, request) -> dict:
        business_id = _get_business_id(request)
        try:
            company = Company.objects.get(business_id=business_id)
        except Company.DoesNotExist as e:
            raise CompanyResolutionError(
                f"No stored company for business id {business_id}"
            ) from e
        return _company_to_dict(company)
