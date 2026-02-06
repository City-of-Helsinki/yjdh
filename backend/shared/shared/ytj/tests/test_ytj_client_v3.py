from unittest.mock import Mock, patch

import pytest
from django.conf import settings

from shared.ytj.exceptions import YTJNotFoundError
from shared.ytj.ytj_client import YTJClient
from shared.ytj.ytj_dataclasses import (
    YTJAddressType,
    YTJCompany,
    YTJLanguageCode,
    YTJNameType,
)

# Sample Nokia Data (partial, reconstructed/mocked based on investigation)
MOCK_YTJ_RESPONSE = {
    "totalResults": 1,
    "companies": [
        {
            "businessId": {
                "value": "0112038-9",
                "registrationDate": "1978-03-15",
                "source": "3",
            },
            "companyForms": [
                {
                    "type": "OYJ",
                    "descriptions": [
                        {"languageCode": "1", "description": "Julkinen osakeyhtiö"},
                        {"languageCode": "3", "description": "Public limited company"},
                    ],
                }
            ],
            "names": [
                {
                    "name": "Nokia Oyj",
                    "type": "1",
                    "registrationDate": "1997-09-01",
                    "version": 1,
                    "source": "1",
                },
                {
                    "name": "Oy Nokia Ab",
                    "type": "1",
                    "registrationDate": "1966-06-10",
                    "endDate": "1997-08-31",
                    "version": 2,
                    "source": "1",
                },
            ],
            "mainBusinessLine": {
                "descriptions": [
                    {"languageCode": "3", "description": "Activities of head offices"},
                    {"languageCode": "1", "description": "Pääkonttorien toiminta"},
                ]
            },
            "addresses": [
                {
                    "type": 1,
                    "street": "Karakaari 7",
                    "postCode": "02610",
                    "postOffices": [
                        {"city": "ESBO", "languageCode": "2"},
                        {"city": "ESPOO", "languageCode": "1"},
                    ],
                }
            ],
        }
    ],
}


@pytest.fixture
def ytj_client():
    return YTJClient()


@patch("requests.get")
def test_get_company_info_with_business_id(mock_get, ytj_client):
    mock_response = Mock()
    mock_response.json.return_value = MOCK_YTJ_RESPONSE
    mock_response.raise_for_status.return_value = None
    mock_get.return_value = mock_response

    business_id = "0112038-9"
    result = ytj_client.get_company_info_with_business_id(business_id)

    # Check that requests.get was called with correct URL and params
    mock_get.assert_called_once()
    args, kwargs = mock_get.call_args
    assert args[0] == f"{settings.YTJ_BASE_URL}/companies"
    assert kwargs["params"] == {"businessId": business_id}
    assert kwargs["timeout"] == settings.YTJ_TIMEOUT

    assert result == MOCK_YTJ_RESPONSE


@patch("requests.get")
def test_get_company_info_not_found(mock_get, ytj_client):
    mock_response = Mock()
    mock_response.json.return_value = {"companies": []}
    mock_response.raise_for_status.return_value = None
    mock_get.return_value = mock_response

    business_id = "0000000-0"
    with pytest.raises(
        YTJNotFoundError,
        match=f"No company found in YTJ for business ID: {business_id}",
    ):
        ytj_client.get_company_info_with_business_id(business_id)


def test_get_company_data_from_ytj_data():
    data = YTJClient.get_company_data_from_ytj_data(MOCK_YTJ_RESPONSE)

    assert data["name"] == "Nokia Oyj"
    assert data["business_id"] == "0112038-9"
    assert data["company_form"] == "Julkinen osakeyhtiö"  # FI description
    assert data["industry"] == "Pääkonttorien toiminta"  # FI description
    assert data["street_address"] == "Karakaari 7"
    assert data["postcode"] == "02610"
    assert data["city"] == "ESPOO"


def test_get_company_data_missing_fields():
    # Test minimal data or missing fields handling
    minimal_data = {
        "companies": [
            {
                "businessId": {"value": "1234567-8"},
                "names": [{"name": "Test Company", "type": YTJNameType.MAIN_NAME}],
                "addresses": [
                    {
                        "type": YTJAddressType.VISITING_ADDRESS,
                        "street": "Test street",
                        "postCode": "00100",
                        "postOffices": [
                            {"city": "Helsinki", "languageCode": YTJLanguageCode.FI}
                        ],
                    }
                ],
                "mainBusinessLine": {
                    "descriptions": [
                        {
                            "languageCode": YTJLanguageCode.FI,
                            "description": "Test Industry",
                        }
                    ]
                },
            }
        ]
    }

    data = YTJClient.get_company_data_from_ytj_data(minimal_data)
    assert data["name"] == "Test Company"


def test_get_company_data_no_companies():
    with pytest.raises(YTJNotFoundError, match="No companies found"):
        YTJClient.get_company_data_from_ytj_data({})


class TestYTJCompany:
    @pytest.fixture
    def company_data(self):
        return {
            "businessId": {"value": "1234567-8"},
            "names": [{"name": "Test Oy", "type": YTJNameType.MAIN_NAME}],
            "companyForms": [
                {
                    "type": "OY",
                    "descriptions": [
                        {
                            "languageCode": YTJLanguageCode.FI,
                            "description": "Osakeyhtiö",
                        },
                        {
                            "languageCode": YTJLanguageCode.SV,
                            "description": "Aktiebolag",
                        },
                    ],
                }
            ],
            "mainBusinessLine": {
                "descriptions": [
                    {
                        "languageCode": YTJLanguageCode.FI,
                        "description": "Ohjelmistokehitys",
                    },
                    {
                        "languageCode": YTJLanguageCode.SV,
                        "description": "Programvaruutveckling",
                    },
                ]
            },
            "addresses": [
                {
                    "type": YTJAddressType.VISITING_ADDRESS,
                    "street": "Katu 1",
                    "postCode": "00100",
                    "postOffices": [
                        {"city": "Helsinki", "languageCode": YTJLanguageCode.FI},
                        {"city": "Helsingfors", "languageCode": YTJLanguageCode.SV},
                    ],
                },
                {
                    "type": YTJAddressType.POSTAL_ADDRESS,
                    "street": "Box 123",
                    "postCode": "00101",
                    "postOffices": [
                        {"city": "Helsinki", "languageCode": YTJLanguageCode.FI}
                    ],
                },
            ],
        }

    def test_company_form_language_priority(self, company_data):
        # Default (FI)
        company = YTJCompany.from_json(company_data)
        assert company.company_form == "Osakeyhtiö"

        # SV fallback
        company_data["companyForms"][0]["descriptions"] = [
            {"languageCode": YTJLanguageCode.SV, "description": "Aktiebolag"}
        ]
        company = YTJCompany.from_json(company_data)
        assert company.company_form == "Aktiebolag"

        # Type fallback
        company_data["companyForms"][0]["descriptions"] = []
        company = YTJCompany.from_json(company_data)
        assert company.company_form == "OY"

    def test_industry_language_priority(self, company_data):
        # Default (FI)
        company = YTJCompany.from_json(company_data)
        assert company.industry == "Ohjelmistokehitys"

        # SV fallback
        company_data["mainBusinessLine"]["descriptions"] = [
            {"languageCode": YTJLanguageCode.SV, "description": "Programvaruutveckling"}
        ]
        company = YTJCompany.from_json(company_data)
        assert company.industry == "Programvaruutveckling"

        # Fail if no FI/SV
        company_data["mainBusinessLine"]["descriptions"] = [
            {"languageCode": YTJLanguageCode.EN, "description": "Software Development"}
        ]
        company = YTJCompany.from_json(company_data)
        with pytest.raises(ValueError, match="Company industry missing"):
            _ = company.industry

    def test_address_priority(self, company_data):
        # Default (Visiting Address - Type 1)
        company = YTJCompany.from_json(company_data)
        assert company.address["street_address"] == "Katu 1"

        # Fallback to Postal Address (Type 2)
        company_data["addresses"] = [
            d
            for d in company_data["addresses"]
            if d["type"] == YTJAddressType.POSTAL_ADDRESS
        ]
        company = YTJCompany.from_json(company_data)
        assert company.address["street_address"] == "Box 123"

        # Fail if no valid address
        company_data["addresses"] = []
        company = YTJCompany.from_json(company_data)
        with pytest.raises(ValueError, match="Company address missing"):
            _ = company.address

    def test_city_language_priority(self, company_data):
        # Default (FI)
        company = YTJCompany.from_json(company_data)
        assert company.address["city"] == "Helsinki"

        # SV Fallback (simulate only SV city available)
        company_data["addresses"][0]["postOffices"] = [
            {"city": "Helsingfors", "languageCode": YTJLanguageCode.SV}
        ]
        company = YTJCompany.from_json(company_data)
        assert company.address["city"] == "Helsingfors"

    def test_name_priority(self, company_data):
        # Default (Main Name - Type 1)
        company = YTJCompany.from_json(company_data)
        assert company.name == "Test Oy"

        # Fallback to any name if type 1 missing
        company_data["names"] = [{"name": "Secondary Name", "type": "2"}]
        company = YTJCompany.from_json(company_data)
        assert company.name == "Secondary Name"

        # Fail if no names
        company_data["names"] = []
        company = YTJCompany.from_json(company_data)
        with pytest.raises(ValueError, match="Company name missing"):
            _ = company.name

    def test_parsing_with_undocumented_fields(self, company_data):
        # Add a field that is NOT in our dataclass
        company_data["addresses"][0]["extra_metadata_from_api"] = "some-value"
        company_data["mainBusinessLine"]["new_api_feature"] = 123

        # This should NOT raise a TypeError
        company = YTJCompany.from_json(company_data)
        assert company.business_id_value == "1234567-8"

    def test_root_fields_mapping(self, company_data):
        company_data["status"] = "Registered"
        company_data["endDate"] = "2025-01-01"

        company = YTJCompany.from_json(company_data)
        assert company.status == "Registered"
        assert company.endDate == "2025-01-01"
