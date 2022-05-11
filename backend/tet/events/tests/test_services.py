import logging
import re

import pytest
from django.test import override_settings, RequestFactory
from rest_framework.exceptions import PermissionDenied
from shared.common.tests.factories import StaffUserFactory, UserFactory

from events.services import ServiceClient
from events.tests.data.linked_events_responses import (
    ADD_EVENT_PAYLOAD,
    ADD_EVENT_RESPONSE,
    EVENT_RESPONSE_NO_CUSTOM_DATA,
    EVENT_RESPONSE_OTHERUSER,
    EVENT_RESPONSE_TEST_COMPANY,
    EVENT_RESPONSE_TESTUSER_EMAIL,
    EVENT_RESPONSE_TESTUSER_OID,
    SAMPLE_EVENTS,
)
from events.utils import PROVIDER_BUSINESS_ID_FIELD

LOGGER = logging.getLogger(__name__)


def mock_django_request(is_staff=True, email=None, username=None):
    factory = RequestFactory()
    request = factory.get("/")

    if is_staff:
        user = StaffUserFactory()
    else:
        user = UserFactory()

        # We need to set organization_roles in session
        # Otherwise the code tries to fetch them from the eauthorizations API
        request.session = {
            "organization_roles": {
                "identifier": EVENT_RESPONSE_TEST_COMPANY["provider"][
                    PROVIDER_BUSINESS_ID_FIELD
                ]
            }
        }

    if email:
        user.email = email
    if username:
        user.username = username

    request.user = user

    return request


# We expect to have a user that is properly authenticated and is authorized to access Linked Events services.
# This can mean either a city user logged via AD or a company user logged via suomi.fi (OIDC). For the first
# case the user is logged in as a staff user. For the second case we set the company business id in Django
# request's session.
#
# It's important to run these test with `NEXT_PUBLIC_MOCK_FLAG=False`, because we want to test that
# the access control works in production.


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL="http://localhost/",
    LINKEDEVENTS_API_KEY="test",
)
def test_get_postings(requests_mock):
    """Test that posts are filtered by user's email and divide into published/draft works"""
    requests_mock.get("http://localhost/event/", json=SAMPLE_EVENTS)

    request_with_adfs_auth = mock_django_request(
        is_staff=True, email="testuser@example.org", username="test-oid"
    )
    postings = ServiceClient().list_job_postings_for_user(request_with_adfs_auth)

    assert len(postings["published"]) == 1
    assert len(postings["draft"]) == 1

    request_with_adfs_auth = mock_django_request(
        is_staff=True, email="hasnopostings@example.org"
    )
    postings = ServiceClient().list_job_postings_for_user(request_with_adfs_auth)

    assert len(postings["published"]) == 0
    assert len(postings["draft"]) == 0

    request_with_adfs_auth = mock_django_request(
        is_staff=True, email="otheruser@example.org"
    )
    postings = ServiceClient().list_job_postings_for_user(request_with_adfs_auth)

    assert len(postings["published"]) == 1
    assert len(postings["draft"]) == 0

    # Test request for a company user should find published posting
    # linked_events_responses.EVENT_RESPONSE_TEST_COMPANY

    request_with_oidc_auth = mock_django_request(is_staff=False)
    postings = ServiceClient().list_job_postings_for_user(request_with_oidc_auth)

    assert len(postings["published"]) == 1
    assert len(postings["draft"]) == 0


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL="http://localhost/",
    LINKEDEVENTS_API_KEY="test",
)
def test_add_posting(requests_mock):
    requests_mock.post("http://localhost/event/", json=ADD_EVENT_RESPONSE)
    request_with_adfs_auth = mock_django_request(is_staff=True)
    request_with_oidc_auth = mock_django_request(is_staff=False)

    event = ServiceClient().add_tet_event(ADD_EVENT_PAYLOAD, request_with_adfs_auth)
    assert event["id"] == "tet:af7w5v5m6e"

    # Adding TET postings for suomi.fi logged in users is not yet implemented when mock flag is False
    with pytest.raises(PermissionDenied):
        ServiceClient().add_tet_event(ADD_EVENT_PAYLOAD, request_with_oidc_auth)


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL="http://localhost/",
    LINKEDEVENTS_API_KEY="test",
)
def test_edit_tet_posting(requests_mock):
    matcher = re.compile(".*")
    # We just care that we get a valid event response back, so ADD_EVENT_RESPONSE is okay to use here
    requests_mock.put(matcher, json=ADD_EVENT_RESPONSE)

    requests_mock.get(
        "http://localhost/event/tet:test-user-email-set/",
        json=EVENT_RESPONSE_TESTUSER_EMAIL,
    )
    requests_mock.get(
        "http://localhost/event/tet:test-user-oid-set/",
        json=EVENT_RESPONSE_TESTUSER_OID,
    )
    requests_mock.get(
        "http://localhost/event/tet:other-user/", json=EVENT_RESPONSE_OTHERUSER
    )
    requests_mock.get(
        "http://localhost/event/tet:companyuser/", json=EVENT_RESPONSE_TEST_COMPANY
    )
    requests_mock.get(
        "http://localhost/event/tet:no-custom-data/", json=EVENT_RESPONSE_NO_CUSTOM_DATA
    )

    request_with_adfs_auth = mock_django_request(
        is_staff=True, email="testuser@example.org", username="test-oid"
    )

    client = ServiceClient()

    # Updating shouldn't raise when either `editor_email` or `editor_oid` is correctly set in event `custom_data`

    client.update_tet_event(
        "tet:test-user-email-set", ADD_EVENT_PAYLOAD, request_with_adfs_auth
    )
    client.update_tet_event(
        "tet:test-user-oid-set", ADD_EVENT_PAYLOAD, request_with_adfs_auth
    )

    # Updating other events should always raise PermissionDenied

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:other-user", ADD_EVENT_PAYLOAD, request_with_adfs_auth
        )

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:companyuser", ADD_EVENT_PAYLOAD, request_with_adfs_auth
        )

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:no-custom-data", ADD_EVENT_PAYLOAD, request_with_adfs_auth
        )

    request_with_oidc_auth = mock_django_request(is_staff=False)

    # Updating shouldn't raise when business_id is correct set in provider

    client.update_tet_event(
        "tet:companyuser", ADD_EVENT_PAYLOAD, request_with_oidc_auth
    )

    # Updating other events should always raise PermissionDenied

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:test-user-email-set", ADD_EVENT_PAYLOAD, request_with_oidc_auth
        )

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:no-custom-data", ADD_EVENT_PAYLOAD, request_with_oidc_auth
        )

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:test-user-oid-set", ADD_EVENT_PAYLOAD, request_with_oidc_auth
        )

    with pytest.raises(PermissionDenied):
        client.update_tet_event(
            "tet:other-user", ADD_EVENT_PAYLOAD, request_with_oidc_auth
        )


# TODO add tests for delete and publish
# delete and publish both use the same `ServiceClient._get_event_and_raise_for_unauthorized`, so testing that
# access control works for update ensures that it works for them too. However, these tests should be added
# to test for regressions when delete or publish might be modified.
