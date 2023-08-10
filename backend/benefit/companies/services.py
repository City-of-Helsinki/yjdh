from django.conf import settings
from django.http import Http404
from requests import HTTPError
from rest_framework.exceptions import APIException

from common.utils import update_object
from companies.models import Company
from shared.service_bus.service_bus_client import ServiceBusClient
from shared.yrtti.yrtti_client import YRTTIClient


def get_or_create_company_using_company_data(company_data: dict) -> Company:
    """
    Get or create a company instance using a dict of the company data.
    Then update the latest YTJ data to the Company model instance
    """
    if not company_data:
        raise APIException(
            "Could not handle the response from Palveluväylä and YRTTI API"
        )
    business_id = company_data.pop("business_id")
    company, _ = Company.objects.get_or_create(
        business_id=business_id,
        defaults={"company_form_code": company_data["company_form_code"]},
    )
    update_object(company, company_data)

    return company


def get_or_create_organisation_with_business_id(business_id: str) -> Company:
    try:
        organisation = get_or_create_organisation_with_business_id_via_service_bus(
            business_id
        )
    except HTTPError:
        organisation = get_or_create_association_with_business_id(business_id)
    if organisation:
        return organisation
    raise Http404("Organisation not found")


def get_or_create_organisation_with_business_id_via_service_bus(
    business_id: str,
) -> Company:
    """Create a company instance using the Palveluväylä integration."""

    sb_client = ServiceBusClient()
    company_data = sb_client.get_organisation_info_with_business_id(business_id)
    return get_or_create_company_using_company_data(company_data)


def get_or_create_association_with_business_id(business_id: str) -> Company:
    """Create a company instance using the Yrtti integration."""

    yrtti_client = YRTTIClient()
    association_data = yrtti_client.get_association_info_with_business_id(business_id)
    return get_or_create_company_using_company_data(association_data)


def search_organisations(search_term: str) -> list[dict]:
    """Search for organisations Service Bus (YTJ) and YRTTI and merge results."""

    sb_client = ServiceBusClient()
    company_data = sb_client.search_companies(search_term)
    association_data = []
    # Option to disable YRTTI as their test api has some difficulties
    if not settings.YRTTI_DISABLE:
        yrtti_client = YRTTIClient()
        association_data = yrtti_client.search_associations(search_term)
    merged_results = company_data + association_data
    results_without_duplicates = [
        dict(unique) for unique in {tuple(result.items()) for result in merged_results}
    ]
    return results_without_duplicates
