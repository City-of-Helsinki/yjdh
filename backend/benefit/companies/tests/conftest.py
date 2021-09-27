import re

import pytest
from common.tests.conftest import *  # noqa
from companies.tests.data.company_data import get_dummy_company_data
from companies.tests.factories import CompanyFactory
from django.conf import settings

ORGANISATION_ROLE_JSON = [
    {
        "name": get_dummy_company_data()["name"],
        "identifier": get_dummy_company_data()["business_id"],
        "complete": True,
        "roles": ["NIMKO"],
    }
]


@pytest.fixture()
def mock_get_organisation_roles_and_create_company(requests_mock):
    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, json=ORGANISATION_ROLE_JSON)
    return CompanyFactory(business_id=ORGANISATION_ROLE_JSON[0]["identifier"])
