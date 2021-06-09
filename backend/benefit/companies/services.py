from common.utils import update_object
from companies.models import Company

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


def get_or_create_company_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    ytj_client = YTJClient()

    ytj_data = ytj_client.get_company_info_with_business_id(business_id)
    company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

    return get_or_create_company_using_company_data(company_data)
