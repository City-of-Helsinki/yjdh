from requests.exceptions import RequestException, HTTPError
from rest_framework.exceptions import NotFound, ValidationError, APIException

from events.exceptions import LinkedEventsException
from events.linkedevents import LinkedEventsClient
from events.transformations import (
    enrich_create_event,
    enrich_update_event,
    reduce_get_event,
)

# If LinkedEventsClient is not properly configured, this will raise a ValueError
# our server won't start. This is intended, because the server is unusable
# without a properly configured LinkedEventsClient.
client = LinkedEventsClient()


def _call_api_and_handle_errors(method, *args, **kwargs):
    pass


def list_job_postings_for_user(user):
    events = client.list_ongoing_events_authenticated()
    job_postings = [reduce_get_event(e) for e in events]
    # TODO divide into published and drafts
    return {
        "draft": job_postings,
        "published": [],
    }


# not MVP?
def list_ended_job_postings_for_user(user):
    return []


def get_tet_event(id, user):
    try:
        event = client.get_event(id)
    except RequestException:
        raise NotFound(detail="Could not find the requested event.")

    return reduce_get_event(event)


def add_tet_event(validated_data, user):
    event = enrich_create_event(validated_data, "ahjo:00001", user.email)
    try:
        created_event = client.create_event(event)
    except RequestException as e:
        e.response
        raise ValidationError()
    return reduce_get_event(created_event)


def publish_job_posting(user, posting):
    pass


def update_tet_event(pk, validated_data, user):
    # TODO check that user has rights to perform this
    event = enrich_update_event(validated_data, user.email)
    try:
        updated_event = client.update_event(pk, event)
    except HTTPError as e:
        # TODO 401, 403 should raise a 503
        raise LinkedEventsException(code=e.response.status_code, response_data=e.response.json())

    return reduce_get_event(updated_event)


def delete_event(id, user):
    # TODO check that user has rights to perform this
    return client.delete_event(id)


def search_job_postings(q):
    pass
