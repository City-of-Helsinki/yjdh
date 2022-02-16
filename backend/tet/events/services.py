import logging
from datetime import date

from events.linkedevents import LinkedEventsClient
from events.transformations import (
    enrich_create_event,
    enrich_update_event,
    reduce_get_event,
)

LOGGER = logging.getLogger(__name__)


# If LinkedEventsClient is not properly configured, this will raise a ValueError
# our server won't start. This is intended, because the server is unusable
# without a properly configured LinkedEventsClient.
client = LinkedEventsClient()


# All users are city employees (AD login) in MVP phase
def is_city_employee(user):
    return True


# TODO return 403 instead of warning
def get_event_and_raise_for_unauthorized(user, event_id):
    event = client.get_event(event_id)
    if is_city_employee(user):
        if event["custom_data"] is None:
            LOGGER.warning(
                f"Any city employee could update event {event['id']} because it has no custom_data"
            )
        else:
            if "editor_email" in event["custom_data"]:
                if event["custom_data"]["editor_email"] != user.email:
                    # TODO raise
                    LOGGER.warning(
                        f"User {user.email} unauthorized access to event {event['id']}"
                    )
            else:
                LOGGER.warning(
                    f"Any city employee could update event {event['id']} because editor_email is not set in custom_data"
                )

    else:
        LOGGER.warning(
            "Authorization not implemented for company users (suomi.fi login)"
        )
    return event


def get_publisher(user):
    # In MVP phase just returning ahjo:00001 (Helsingin kaupunki) for all
    # We can also get industry (toimiala) from ADFS Graph API (needs translation to ahjo scheme)
    # For company users it is still undecided how we store the company business id (Y-tunnus) in an event
    return "ahjo:00001"


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


def get_tet_event(event_id, user):
    event = get_event_and_raise_for_unauthorized(user, event_id)

    event['location'] = client.get_url(event['location']['@id'])
    event['keywords'] = [client.get_url(k['@id']) for k in event['keywords']]

    return reduce_get_event(event)


def add_tet_event(validated_data, user):
    event = enrich_create_event(validated_data, get_publisher(user), user.email)
    created_event = client.create_event(event)
    return reduce_get_event(created_event)


def publish_job_posting(event_id, user):
    event = get_event_and_raise_for_unauthorized(user, event_id)
    # TODO do we also need to set event status?
    event["date_published"] = date.today().isoformat()
    updated_event = client.update_event(event_id, event)

    return reduce_get_event(updated_event)


def update_tet_event(event_id, validated_data, user):
    get_event_and_raise_for_unauthorized(user, event_id)
    event = enrich_update_event(validated_data, user.email)
    updated_event = client.update_event(event_id, event)

    return reduce_get_event(updated_event)


def delete_event(event_id, user):
    get_event_and_raise_for_unauthorized(user, event_id)
    return client.delete_event(event_id)


def search_job_postings(q):
    pass
