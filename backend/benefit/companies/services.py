from requests import HTTPError
from shared.service_bus.service_bus_client import ServiceBusClient
from shared.yrtti.yrtti_client import YRTTIClient

from common.utils import update_object
from companies.models import Company


def get_or_create_company_using_company_data(company_data: dict) -> Company:
    """
    Get or create a company instance using a dict of the company data.
    Then update the latest YTJ data to the Company model instance
    """
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
        # Using ServiceBus, it's guarantee to find company, but not association, so if the first request return 404,
        # try again with YRTTI API
        organisation = get_or_create_association_with_business_id(business_id)
    return organisation


def get_or_create_organisation_with_business_id_via_service_bus(
    business_id: str,
) -> Company:
    """
    Create a company instance using the Palveluväylä integration.
    """
    sb_client = ServiceBusClient()

    sb_data = sb_client.get_organisation_info_with_business_id(business_id)
    company_data = sb_client.get_organisation_data_from_service_bus_data(sb_data)

    return get_or_create_company_using_company_data(company_data)


def get_or_create_association_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    yrtti_client = YRTTIClient()

    yrtti_data = yrtti_client.get_association_info_with_business_id(business_id)
    company_data = yrtti_client.get_association_data_from_yrtti_data(yrtti_data)

    return get_or_create_company_using_company_data(company_data)
