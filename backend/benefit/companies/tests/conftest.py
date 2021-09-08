import re

import pytest
from common.tests.conftest import *  # noqa
from companies.tests.data.company_data import DUMMY_COMPANY_DATA
from companies.tests.factories import CompanyFactory
from django.conf import settings

ORGANISATION_ROLE_JSON = [
    {
        "name": DUMMY_COMPANY_DATA["name"],
        "identifier": DUMMY_COMPANY_DATA["business_id"],
        "complete": True,
        "roles": ["NIMKO"],
    }
]


@pytest.fixture()
def mock_get_organisation_roles_and_create_company(requests_mock):
    matcher = re.compile(settings.EAUTHORIZATIONS_BASE_URL)
    requests_mock.get(matcher, json=ORGANISATION_ROLE_JSON)
    return CompanyFactory(business_id=ORGANISATION_ROLE_JSON[0]["identifier"])
