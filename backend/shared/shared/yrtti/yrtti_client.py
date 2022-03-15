import requests
from django.conf import settings

from shared.service_bus.enums import YtjOrganizationCode

TARGET_ASSOCIATION_NAME_TYPE = "P"
TARGET_ASSOCIATION_NAME_LANGUAGE = "FI"
TARGET_ASSOCIATION_NAME_STATUS = "R"


class YRTTIClient:
    def __init__(self):
        if not all([settings.YRTTI_BASIC_INFO_PATH, settings.YRTTI_TIMEOUT]):
            raise ValueError("YRTTI client settings not configured.")

    def _post(self, url: str, username: str, password: str, data: dict) -> dict:
        response = requests.post(
            url, auth=(username, password), timeout=settings.YRTTI_TIMEOUT, json=data
        )
        response.raise_for_status()
        return response.json()

    def get_association_data_from_yrtti_data(self, yrtti_data: dict) -> dict:
        """
        Get the required company fields from YRTTI data.

        The YRTTI API only returns data for associations, so the response does not contain
        a field for company form.
        Use the YTJ "yritysmuoto" code for associations when creating the Company objects
        """
        association_name = self._get_active_association_name(
            yrtti_data["AssociationNameInfo"]
        )
        # There might be a list of addresses, but it is impossible to identify which one is the primary address from
        # the data so we just select the first one. Most of the time there is only 1 address
        address = yrtti_data["Address"][0]
        company_data = {
            "name": association_name["AssociationName"],
            "business_id": yrtti_data["BusinessId"],
            "company_form": YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT.label,
            "company_form_code": YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT,
            "industry": association_name["AssociationIndustry"] or "",
            "street_address": self._sanitize_text(address["StreetName"]),
            "postcode": address["PostCode"],
            "city": address["City"],
        }

        return company_data

    def get_association_info_with_business_id(self, business_id: str) -> dict:
        query = {"BusinessId": business_id}
        company_info_url = f"{settings.YRTTI_BASIC_INFO_PATH}"
        yrtti_data = self._post(
            company_info_url,
            username=settings.YRTTI_AUTH_USERNAME,
            password=settings.YRTTI_AUTH_PASSWORD,
            data=query,
        )
        return yrtti_data["BasicInfoResponse"]

    def _sanitize_text(self, text: str) -> str:
        # Some text fields from YRTTI includes \n character, replace it with space
        if text:
            return text.replace("\n", " ")
        return ""

    def _get_active_association_name(self, name_info: dict) -> str:
        # There will be the case where an association has more than one name
        # Here we only pick up latest name available
        active_names = [
            name
            for name in name_info
            if name["AssociationNameType"] == TARGET_ASSOCIATION_NAME_TYPE
            and name["AssociationNameLanguage"] == TARGET_ASSOCIATION_NAME_LANGUAGE
            and name["AssociationNameStatus"] == TARGET_ASSOCIATION_NAME_STATUS
        ]
        if len(active_names) == 0:
            raise ValueError("Cannot find active association name")
        return active_names[0]
