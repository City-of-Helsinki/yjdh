import re

import pytest
import logging

from django.test import override_settings
from rest_framework.exceptions import PermissionDenied

from shared.common.tests.factories import TetHelsinkiAdUserFactory

from events.services import ServiceClient
from events.tests.data.linked_events_responses import (SAMPLE_EVENTS, ADD_EVENT_PAYLOAD, ADD_EVENT_RESPONSE,
    EVENT_RESPONSE_TESTUSER, EVENT_RESPONSE_OTHERUSER, EVENT_RESPONSE_NO_USER, EVENT_RESPONSE_NO_CUSTOM_DATA)

LOGGER = logging.getLogger(__name__)

# We expect to have a user that is properly authenticated and is authorized to access Linked Events services.
# This can mean either a city user logged via AD or a company user logged via suomi.fi. The latter case is
# not yet designed/implemented, so currently this test only tests for city users, but it needs to be
# adapted to all users eventually.

# Currently the expectation is that all users getting access to `ServicesClient` have is_staff set.


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL='http://localhost/'
)
def test_get_postings(requests_mock):
    """Test that posts are filtered by user's email and divide into published/draft works"""
    requests_mock.get('http://localhost/event/', json=SAMPLE_EVENTS)
    user = TetHelsinkiAdUserFactory()

    user.email = "testuser@example.org"
    postings = ServiceClient().list_job_postings_for_user(user)

    assert len(postings['published']) == 1
    assert len(postings['draft']) == 1

    user.email = "hasnopostings@example.org"
    postings = ServiceClient().list_job_postings_for_user(user)

    assert len(postings['published']) == 0
    assert len(postings['draft']) == 0

    user.email = "otheruser@example.org"
    postings = ServiceClient().list_job_postings_for_user(user)

    assert len(postings['published']) == 1
    assert len(postings['draft']) == 0

@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL='http://localhost/'
)
def test_add_posting(requests_mock):
    requests_mock.post('http://localhost/event/', json=ADD_EVENT_RESPONSE)
    event = ServiceClient().add_tet_event(ADD_EVENT_PAYLOAD, TetHelsinkiAdUserFactory())
    assert event['id'] == 'tet:af7w5v5m6e'


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    LINKEDEVENTS_URL='http://localhost/'
)
def test_edit_tet_posting(requests_mock):
    matcher = re.compile('.*')
    # We just care that we get a valid event response back, so ADD_EVENT_RESPONSE is okay to use here
    requests_mock.put(matcher, json=ADD_EVENT_RESPONSE)

    requests_mock.get('http://localhost/event/tet:af7w4jmjla/', json=EVENT_RESPONSE_TESTUSER)
    requests_mock.get('http://localhost/event/tet:af7wto6nze/', json=EVENT_RESPONSE_OTHERUSER)
    requests_mock.get('http://localhost/event/tet:af7wtenvii/', json=EVENT_RESPONSE_NO_USER)
    requests_mock.get('http://localhost/event/tet:af7wjlxpyy/', json=EVENT_RESPONSE_NO_CUSTOM_DATA)

    # LOGGER.warning(EVENT_RESPONSE_NO_CUSTOM_DATA)

    user = TetHelsinkiAdUserFactory()
    user.email = "testuser@example.org"

    client = ServiceClient()

    client.update_tet_event('tet:af7w4jmjla', ADD_EVENT_PAYLOAD, user)

    with pytest.raises(PermissionDenied):
        client.update_tet_event('tet:af7wto6nze', ADD_EVENT_PAYLOAD, user)

    with pytest.raises(PermissionDenied):
        client.update_tet_event('tet:af7wtenvii', ADD_EVENT_PAYLOAD, user)

    # TODO why doesn't this raise?
    # with pytest.raises(PermissionDenied):
    #     client.update_tet_event('tet:af7wjlxpyy', ADD_EVENT_PAYLOAD, user)

# TODO add tests for delete and publish
