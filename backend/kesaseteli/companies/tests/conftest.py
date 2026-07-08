import copy

import pytest

from common.tests.conftest import *  # noqa
from companies.tests.data.company_data import DUMMY_YTJ_RESPONSE


@pytest.fixture
def mock_ytj_response():
    def _mock_ytj_response(
        business_id: str,
        name: str,
        company_form: str = "Osakeyhtiö",
        city: str = "HELSINKI",
        street: str = "Testikatu 1",
        postcode: str = "00100",
        industry: str = "IT-palvelut",
    ) -> dict:
        ytj_api_data = copy.deepcopy(DUMMY_YTJ_RESPONSE)
        ytj_api_data["companies"][0]["businessId"]["value"] = business_id
        ytj_api_data["companies"][0]["names"][0]["name"] = name
        ytj_api_data["companies"][0]["companyForms"][0]["descriptions"][0][
            "description"
        ] = company_form
        ytj_api_data["companies"][0]["addresses"][0]["street"] = street
        ytj_api_data["companies"][0]["addresses"][0]["postCode"] = postcode
        ytj_api_data["companies"][0]["addresses"][0]["postOffices"][0]["city"] = city
        ytj_api_data["companies"][0]["mainBusinessLine"]["descriptions"][0][
            "description"
        ] = industry
        return ytj_api_data

    return _mock_ytj_response
