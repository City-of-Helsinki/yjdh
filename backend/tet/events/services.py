import logging
from datetime import date

from django.conf import settings
from rest_framework.exceptions import PermissionDenied

from events.linkedevents import LinkedEventsClient
from events.transformations import (
    enrich_create_event,
    enrich_update_event,
    reduce_get_event,
)

LOGGER = logging.getLogger(__name__)


def is_published(posting):
    return posting["publication_status"] == "public"


def _user_matches(event, user):
    if event["custom_data"] is None:
        return False

    email_matches = False
    oid_matches = False

    if user.email and "editor_email" in event["custom_data"]:
        email_matches = event["custom_data"]["editor_email"] == user.email

    # django-adfs places AD OID in `user.username`
    if user.username and "editor_oid" in event["custom_data"]:
        oid_matches = event["custom_data"]["editor_oid"] == user.username

    return email_matches or oid_matches


def _raise_permission_denied():
    raise PermissionDenied(
        detail="User doesn't have permission to access this event"
    )


class ServiceClient:
    def __init__(self):
        self.client = LinkedEventsClient()

    # All users are city employees (AD login) in MVP phase
    def _is_city_employee(self, user):
        return True

    def _get_event_and_raise_for_unauthorized(self, user, event_id):
        """Raises PermissionDenied unless `user` is authorized to access event `event_id`
        and also returns the event.

        All operations that read, modify or delete events should call this method.

        See `test_services.py` to understand the access logic better.
        """
        event = self.client.get_event(event_id)

        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return event

        if self._is_city_employee(user):
            if not _user_matches(event, user):
                # TODO audit log?
                LOGGER.warning(
                    f"User {user.pk} was denied unauthorized access to event {event['id']}"
                )
                _raise_permission_denied()
        else:
            LOGGER.warning(
                "Authorization not implemented for company users (suomi.fi login)"
            )
            _raise_permission_denied()

        return event

    def _filter_events_for_user(self, all_events, user):
        """Filters events that `user` is authorized to access"""
        if self._is_city_employee(user):
            if not settings.NEXT_PUBLIC_MOCK_FLAG:
                return [e for e in all_events if _user_matches(e, user)]
            else:
                return all_events
        else:
            LOGGER.warning(
                "Event filtering not implemented for company users (suomi.fi login)"
            )
            return []

    def _get_publisher(self, user):
        # In MVP phase just returning ahjo:00001 (Helsingin kaupunki) for all
        # We can also get industry (toimiala) from ADFS Graph API (needs translation to ahjo scheme)
        # For company users it is still undecided how we store the company business id (Y-tunnus) in an event
        return "ahjo:00001"

    def list_job_postings_for_user(self, user):
        # Currently this fetches all events under the TET data source, but it's more efficient if we can
        # filter by industry (toimiala) or company business id (Y-tunnus)
        all_events = self.client.list_ongoing_events_authenticated(
            self._get_publisher(user)
        )
        events = self._filter_events_for_user(all_events, user)
        job_postings = [reduce_get_event(e) for e in events]

        return {
            "draft": [p for p in job_postings if not is_published(p)],
            "published": [p for p in job_postings if is_published(p)],
        }

    # not MVP?
    def list_ended_job_postings_for_user(self, user):
        return []

    def get_tet_event(self, event_id, user):
        event = self._get_event_and_raise_for_unauthorized(user, event_id)

        return reduce_get_event(event)

    def add_tet_event(self, validated_data, user):
        event = enrich_create_event(validated_data, self._get_publisher(user), user)
        created_event = self.client.create_event(event)
        return reduce_get_event(created_event)

    def publish_job_posting(self, event_id, user):
        event = self._get_event_and_raise_for_unauthorized(user, event_id)
        event["publication_status"] = "public"
        event["date_published"] = date.today().isoformat()
        updated_event = self.client.update_event(event_id, event)

        return reduce_get_event(updated_event)

    def update_tet_event(self, event_id, validated_data, user):
        self._get_event_and_raise_for_unauthorized(user, event_id)
        event = enrich_update_event(validated_data, user)
        updated_event = self.client.update_event(event_id, event)

        return reduce_get_event(updated_event)

    def delete_event(self, event_id, user):
        self._get_event_and_raise_for_unauthorized(user, event_id)
        return self.client.delete_event(event_id)

    def search_job_postings(self, q):
        pass
