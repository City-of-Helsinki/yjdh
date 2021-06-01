import requests
from django.conf import settings


class YTJClient:
    """
    https://avoindata.prh.fi/
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
        # Address of type 1 is the visiting address
        company_address = next(
            (x for x in ytj_data["addresses"] if x["type"] == 1), None
        )

        if not company_address:
            # A fallback if address of type 1 does not exist
            company_address = next(
                (x for x in ytj_data["addresses"] if x["type"] == 2), None
            )

        if not company_address:
            raise ValueError("Company address missing from YTJ data")

        # Get the Finnish name of the business line
        company_industry = next(
            (x for x in ytj_data["businessLines"] if x["language"] == "FI"), None
        )

        if not company_industry:
            raise ValueError("Company industry missing from YTJ data")

        company_data = {
            "name": ytj_data["name"],
            "business_id": ytj_data["businessId"],
            "company_form": ytj_data["companyForm"],
            "industry": company_industry["name"],
            "street_address": company_address["street"],
            "postcode": company_address["postCode"],
            "city": company_address["city"],
        }

        return company_data

    def get_company_info_with_business_id(self, business_id: str, **kwargs) -> dict:
        company_info_url = f"{settings.YTJ_BASE_URL}/{business_id}"

        ytj_data = self._get(company_info_url, **kwargs)

        company_result = ytj_data["results"][0]
        business_details = self._get(company_result["bisDetailsUri"])

        company_result["businessLines"] = business_details["results"][0][
            "businessLines"
        ]

        return company_result
