from companies.models import Company
from companies.ytj.ytj_client import YTJClient


def get_or_create_company_using_company_data(
    company_data: dict, ytj_data: dict
) -> Company:
    """
    Get or create a company instance using a dict of the company data and attach the ytj_data json
    for the instance.
    """
    company, created = Company.objects.get_or_create(
        **company_data, defaults={"ytj_json": ytj_data}
    )
    return company


def get_or_create_company_with_business_id(business_id: str) -> Company:
    """
    Create a company instance using the YTJ integration.
    """
    ytj_client = YTJClient()

    ytj_data = ytj_client.get_company_info_with_business_id(business_id)
    company_data = ytj_client.get_company_data_from_ytj_data(ytj_data)

    return get_or_create_company_using_company_data(company_data, ytj_data)
