import requests
from django.conf import settings


class ServiceBusClient:
    def __init__(self):
        if not all([settings.SERVICE_BUS_INFO_PATH, settings.SERVICE_BUS_TIMEOUT]):
            raise ValueError("Service bus client settings not configured.")

    def _post(self, url: str, username: str, password: str, data: dict) -> dict:
        response = requests.post(
            url,
            auth=(username, password),
            timeout=settings.SERVICE_BUS_TIMEOUT,
            json=data,
        )
        response.raise_for_status()
        return response.json()

    def get_organisation_data_from_service_bus_data(
        self, service_bus_data: dict
    ) -> dict:
        """
        Get the required company fields from YTJ data. All data will be in Finnish
        Might throw ValueError if the data is not in correct format or there is a case
        that hasn't been covered in the code
        """

        address = self._get_address(
            service_bus_data["PostalAddress"]["DomesticAddress"]
        )
        company_data = {
            "name": service_bus_data["TradeName"]["Name"],
            "business_id": service_bus_data["BusinessId"],
            "company_form": self._get_company_form(service_bus_data["LegalForm"]),
            "industry": self._get_industry(service_bus_data["BusinessLine"]),
            "street_address": address["StreetAddress"],
            "postcode": address["PostalCode"],
            "city": address["City"],
        }

        return company_data

    def get_organisation_info_with_business_id(self, business_id: str) -> dict:
        query = {"BusinessId": business_id}
        company_info_url = f"{settings.SERVICE_BUS_INFO_PATH}"
        service_bus_data = self._post(
            company_info_url,
            username=settings.SERVICE_BUS_AUTH_USERNAME,
            password=settings.SERVICE_BUS_AUTH_PASSWORD,
            data=query,
        )
        return service_bus_data["GetCompanyResult"]["Company"]

    def _get_address(self, address_json):
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

    def _get_company_form(self, legal_form_json):
        # The LegalForm is a code, which is not human-readable.
        # We'll try to get the description of the code in Finnish
        company_form = self._get_finnish_description(
            legal_form_json["Type"]["Descriptions"]["CodeDescription"]
        )
        if not company_form:
            raise ValueError("Cannot get company form data")
        return company_form["Description"]

    def _get_industry(self, business_line_json):
        # The BusinessLine value is a code, which is not human-readable.
        # We'll try to get the description of the code in Finnish
        business_line = self._get_finnish_description(
            business_line_json["Type"]["Descriptions"]["CodeDescription"]
        )
        if not business_line:
            raise ValueError("Cannot get company form data")
        return business_line["Description"]

    def _get_finnish_description(self, descriptions):
        return next((desc for desc in descriptions if desc["Language"] == "fi"), None)
