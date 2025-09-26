from typing import Optional

import requests
from django.conf import settings


class ServiceBusClient:
    UNKNOWN_INDUSTRY = "n/a"

    def __init__(self):
        if not all(
            [
                settings.SERVICE_BUS_BASE_URL,
                settings.SERVICE_BUS_TIMEOUT,
                settings.SERVICE_BUS_AUTH_USERNAME,
                settings.SERVICE_BUS_AUTH_PASSWORD,
            ]
        ):
            raise ValueError("Service bus client settings not configured.")
        self.get_company_url = f"{settings.SERVICE_BUS_BASE_URL}/GetCompany"
        self.search_company_url = f"{settings.SERVICE_BUS_BASE_URL}/SearchCompany"
        self.credentials = (
            settings.SERVICE_BUS_AUTH_USERNAME,
            settings.SERVICE_BUS_AUTH_PASSWORD,
        )
        self.search_limit = settings.SERVICE_BUS_SEARCH_LIMIT or 10

    def get_organisation_info_with_business_id(self, business_id: str) -> dict:
        query = {"BusinessId": business_id}
        service_bus_data = self._post(url=self.get_company_url, data=query)
        try:
            return self._get_organisation_data_from_service_bus_data(
                service_bus_data["GetCompanyResult"]["Company"]
            )
        except (KeyError, TypeError, requests.HTTPError):
            return {}

    def search_companies(self, company_name: str) -> list:
        query = {"SearchExpression": company_name, "FindAll": False}
        service_bus_data = self._post(url=self.search_company_url, data=query)
        try:
            search_results = service_bus_data["SearchCompanyResult"]["SearchResults"][
                "NameSearchQueryResult"
            ]
        except (KeyError, TypeError):
            search_results = None

        if search_results:
            search_results = search_results[: self.search_limit]
            return self._format_search_results(search_results)
        return []

    def _post(self, url: str, data: dict) -> dict:
        response = requests.post(
            url,
            auth=self.credentials,
            timeout=settings.SERVICE_BUS_TIMEOUT,
            json=data,
        )
        response.raise_for_status()
        return response.json()

    @classmethod
    def _get_organisation_data_from_service_bus_data(
        cls, service_bus_data: dict
    ) -> dict:
        """
        Get the required company fields from YTJ data.

        All data will be in Finnish Might throw ValueError if the data is not
        in correct format or there is a case that hasn't been covered in the
        code
        """

        try:
            address = cls._get_address(
                service_bus_data["PostalAddress"]["DomesticAddress"]
            )
        except (KeyError, TypeError):
            address = {"StreetAddress": "", "PostalCode": "", "City": ""}
        company_data = {
            "name": service_bus_data["TradeName"]["Name"],
            "business_id": service_bus_data["BusinessId"],
            "company_form": cls._get_company_form(service_bus_data["LegalForm"]),
            "company_form_code": cls._get_company_form_code(
                service_bus_data["LegalForm"]
            ),
            "industry": cls._get_industry(service_bus_data.get("BusinessLine", {})),
            "street_address": address["StreetAddress"],
            "postcode": address["PostalCode"],
            "city": address["City"],
        }

        return company_data

    @classmethod
    def _get_company_form(cls, legal_form_json: dict) -> str:
        # The LegalForm is a code, which is not human-readable.
        # We'll try to get the description of the code in Finnish
        company_form = cls._get_finnish_description(
            legal_form_json["Type"]["Descriptions"]["CodeDescription"]
        )
        if not company_form:
            raise ValueError("Cannot get company form data")
        return company_form["Description"]

    @classmethod
    def _get_industry(cls, business_line_json: dict) -> str:
        # The BusinessLine value is a code, which is not human-readable.
        # We'll try to get the description of the code in Finnish
        # In suomi.fi test env, some companies do not have this data, so assuming
        # production
        # env might have companies with missing data, too
        try:
            code_description = business_line_json["Type"]["Descriptions"][
                "CodeDescription"
            ]
        except (KeyError, TypeError):
            return cls.UNKNOWN_INDUSTRY

        business_line = cls._get_finnish_description(code_description)
        if not business_line:
            raise ValueError("Cannot get company form data")
        return business_line.get("Description", cls.UNKNOWN_INDUSTRY)

    @staticmethod
    def _format_search_results(search_results: list) -> list:
        return [
            {"name": company["Name"], "business_id": company["BusinessId"]}
            for company in search_results
            if company["Name"] and company["BusinessId"]
        ]

    @staticmethod
    def _get_address(address_json: dict) -> dict:
        return {
            "StreetAddress": " ".join(
                filter(
                    None,
                    [
                        address_json["Street"],
                        address_json["PostOfficeBox"],
                        address_json["BuildingNumber"],
                        address_json["Entrance"],
                        address_json["ApartmentNumber"],
                        address_json["ApartmentIDSuffix"],
                    ],
                )
            ),
            "PostalCode": address_json["PostalCode"],
            "City": address_json["City"],
        }

    @staticmethod
    def _get_company_form_code(legal_form_json: dict) -> int:
        # return the YRMU code from the response
        if "Type" not in legal_form_json:
            raise ValueError("Cannot determine company form")
        if legal_form_json["Type"].get("PrimaryCode") != "YRMU":
            raise ValueError("Cannot determine company form - invalid PrimaryCode")
        try:
            return int(legal_form_json["Type"]["SecondaryCode"])
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "Cannot determine company form - invalid SecondaryCode"
            ) from exc

    @staticmethod
    def _get_finnish_description(descriptions: dict) -> Optional[dict]:
        return next((desc for desc in descriptions if desc["Language"] == "fi"), None)
