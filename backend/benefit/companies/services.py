from common.utils import update_object
from companies.models import Company

from shared.service_bus.service_bus_client import ServiceBusClient
from shared.yrtti.yrtti_client import YRTTIClient
from shared.ytj.ytj_client import YTJClient


def get_or_create_company_using_company_data(company_data: dict) -> Company:
    """
    Get or create a company instance using a dict of the company data.
    Then update the latest YTJ data to the Company model instance
    """
    business_id = company_data.pop("business_id")
    company, _ = Company.objects.get_or_create(business_id=business_id)
    update_object(company, company_data)

    return company


def get_or_create_organisation_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the Palveluvayla integration.
    """
    sb_client = ServiceBusClient()

    sb_data = sb_client.get_organisation_info_with_business_id(business_id)
    company_data = sb_client.get_organisation_data_from_service_bus_data(sb_data)

    return get_or_create_company_using_company_data(company_data)


def get_or_create_company_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    ytj_client = YTJClient()

    ytj_data = ytj_client.get_company_info_with_business_id(business_id)
    company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

    return get_or_create_company_using_company_data(company_data)


def get_or_create_association_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    YTJ_client = YRTTIClient()

    YTJ_data = YTJ_client.get_association_info_with_business_id(business_id)
    company_data = YTJ_client.get_association_data_from_YTJ_data(YTJ_data)

    return get_or_create_company_using_company_data(company_data)
