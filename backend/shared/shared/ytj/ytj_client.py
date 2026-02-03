import requests
from django.conf import settings

from shared.ytj.exceptions import YTJNotFoundError
from shared.ytj.ytj_dataclasses import YTJCompany


class YTJClient:
    """
    https://avoindata.prh.fi/opendata-ytj-api/v3/
    """

    def __init__(self):
        if not all([settings.YTJ_BASE_URL, settings.YTJ_TIMEOUT]):
            raise ValueError("YTJ client settings not configured.")

    def _get(self, url: str, **kwargs) -> dict:
        response = requests.get(url, timeout=settings.YTJ_TIMEOUT, **kwargs)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def get_company_data_from_ytj_data(ytj_data: dict) -> dict:
        """
        Get the required company fields from YTJ data.
        """
        if not ytj_data or "companies" not in ytj_data or not ytj_data["companies"]:
            raise YTJNotFoundError("No companies found in YTJ data")

        # Parse first company
        company = YTJCompany.from_json(ytj_data["companies"][0])

        return {
            "name": company.name,
            "business_id": company.business_id_value,
            "company_form": company.company_form,
            "industry": company.industry,
            **company.address,
        }

    def get_company_info_with_business_id(self, business_id: str, **kwargs) -> dict:
        # V3 uses query parameters
        company_info_url = f"{settings.YTJ_BASE_URL}/companies"
        params = {"businessId": business_id}
        kwargs.update({"params": params})

        ytj_data = self._get(company_info_url, **kwargs)

        if not ytj_data.get("companies"):
            raise YTJNotFoundError(
                f"No company found in YTJ for business ID: {business_id}"
            )

        return ytj_data
