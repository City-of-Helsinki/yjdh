import re

import pytest
from django.conf import settings
from django.test import override_settings
from requests.exceptions import ConnectionError as RequestsConnectionError
from resilient_logger.models import ResilientLogEntry
from rest_framework.exceptions import NotFound

from common.tests.factories import CompanyFactory
from companies.services import get_or_create_company_using_organization_roles
from kesaseteli.auth_logging import AuthEventType

pytestmark = pytest.mark.django_db


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    ENABLE_AUTH_LOGGING=True,
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
)
def test_get_or_create_company_logs_mandate_query(api_client, requests_mock):
    """Successful org roles fetch creates a MANDATE_QUERY log entry."""
    org_roles_json = {
        "name": "Test Oy",
        "identifier": "1234567-8",
        "complete": True,
        "roles": ["NIMKO"],
    }
    CompanyFactory(business_id="1234567-8")  # prevent YTJ lookup

    matcher = re.compile(re.escape(settings.EAUTHORIZATIONS_BASE_URL))
    requests_mock.get(matcher, json=[org_roles_json])

    request = api_client.get("/").wsgi_request
    if "organization_roles" in request.session:
        del request.session["organization_roles"]

    get_or_create_company_using_organization_roles(request)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.MANDATE_QUERY
    assert entry.context["company_identifier"] == "1234567-8"
    assert entry.context["success"] is True


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    ENABLE_AUTH_LOGGING=True,
    EAUTHORIZATIONS_BASE_URL="http://example.com",
    EAUTHORIZATIONS_CLIENT_ID="test",
    EAUTHORIZATIONS_CLIENT_SECRET="test",
)
def test_get_or_create_company_logs_mandate_query_failure_on_api_error(
    api_client, requests_mock
):
    """Failed org roles fetch creates a failed MANDATE_QUERY log entry."""
    matcher = re.compile(re.escape(settings.EAUTHORIZATIONS_BASE_URL))
    requests_mock.get(matcher, exc=RequestsConnectionError("Connection refused"))

    request = api_client.get("/").wsgi_request
    if "organization_roles" in request.session:
        del request.session["organization_roles"]

    with pytest.raises(NotFound):
        get_or_create_company_using_organization_roles(request)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.MANDATE_QUERY
    assert entry.context["success"] is False
    assert "Connection refused" in entry.context["error"]
