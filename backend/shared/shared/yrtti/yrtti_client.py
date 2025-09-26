import requests
from django.conf import settings

from shared.service_bus.enums import YtjOrganizationCode

from .enums import (
    AssociationNameLanguageMap,
    AssociationNameTypeMap,
    AssociationStatusMap,
)


class YRTTIClient:
    target_association_status = AssociationStatusMap.REGISTERED.value
    target_association_name_status = AssociationStatusMap.REGISTERED.value
    target_association_name_type = AssociationNameTypeMap.NAME.value
    target_association_name_language = AssociationNameLanguageMap.FINNISH.value

    def __init__(self):
        if not all(
            [
                settings.YRTTI_BASE_URL,
                settings.YRTTI_TIMEOUT,
                settings.YRTTI_AUTH_USERNAME,
                settings.YRTTI_AUTH_PASSWORD,
            ]
        ):
            raise ValueError("YRTTI client settings not configured.")
        self.get_association_url = f"{settings.YRTTI_BASE_URL}/BasicInfo"
        self.search_association_url = f"{settings.YRTTI_BASE_URL}/AdvancedSearch"
        self.credentials = (settings.YRTTI_AUTH_USERNAME, settings.YRTTI_AUTH_PASSWORD)
        self.search_limit = settings.YRTTI_SEARCH_LIMIT or 10

    def get_association_info_with_business_id(self, business_id: str) -> dict:
        query = {"BusinessId": business_id}
        yrtti_data = self._post(
            self.get_association_url,
            data=query,
        )
        try:
            return self._get_association_data_from_yrtti_data(
                yrtti_data["BasicInfoResponse"]
            )
        except (KeyError, TypeError, requests.HTTPError):
            return {}

    def search_associations(self, name: str) -> list:
        query = {
            "Name": name,
            "AssociationStatus": [self.target_association_status],
            "NameStatus": [self.target_association_name_status],
            "NameType": [self.target_association_name_type],
        }
        yrtti_data = self._post(
            self.search_association_url,
            data=query,
        )
        try:
            search_results = yrtti_data["AdvancedSearchResponse"]["MatchedAssociation"]
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
            timeout=settings.YRTTI_TIMEOUT,
            json=data,
        )
        response.raise_for_status()
        return response.json()

    @classmethod
    def _get_association_data_from_yrtti_data(cls, yrtti_data: dict) -> dict:
        """
        Get the required company fields from YRTTI data.

        The YRTTI API only returns data for associations, so the response does not contain
        a field for company form.
        Use the YTJ "yritysmuoto" code for associations when creating the Company objects
        """
        association_name_info = cls._get_active_association_name(
            yrtti_data["AssociationNameInfo"]
        )
        # There might be a list of addresses, but it is impossible to identify which one is the primary address from
        # the data so we just select the first one. Most of the time there is only 1 address
        address = yrtti_data["Address"][0]
        company_data = {
            "name": association_name_info["AssociationName"],
            "business_id": yrtti_data["BusinessId"],
            "company_form": YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT.label,
            "company_form_code": (
                YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT.value
            ),
            "industry": association_name_info["AssociationIndustry"] or "",
            "street_address": cls._sanitize_text(address["StreetName"]),
            "postcode": address["PostCode"],
            "city": address["City"],
        }

        return company_data

    @classmethod
    def _format_search_results(cls, search_results: list) -> list:
        formatted = []
        for result in search_results:
            if not result["BusinessId"] or not result["AssociationNameInfo"]:
                continue

            association_name_info = cls._get_active_association_name(
                result["AssociationNameInfo"]
            )
            if not association_name_info:
                continue

            formatted.append(
                {
                    "name": association_name_info["AssociationName"],
                    "business_id": result["BusinessId"],
                }
            )
        return formatted

    @classmethod
    def _get_active_association_name(cls, name_info: list) -> dict:
        # If active Finnish name found, return it, otherwise return the first active name
        target_language_names = [
            name
            for name in name_info
            if name["AssociationNameLanguage"] == cls.target_association_name_language
        ]
        if target_language_names:
            return target_language_names[0]
        return name_info[0]

    @staticmethod
    def _sanitize_text(text: str) -> str:
        # Some text fields from YRTTI includes \n character, replace it with space
        if text:
            return text.replace("\n", " ")
        return ""
