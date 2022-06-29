import logging
from datetime import date

from django.conf import settings
from django.http import HttpRequest
from rest_framework.exceptions import PermissionDenied

from events.linkedevents import LinkedEventsClient
from events.transformations import (
    enrich_create_event,
    enrich_update_event,
    reduce_get_event,
)
from events.utils import get_business_id, PROVIDER_BUSINESS_ID_FIELD

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


def _business_id_is_set(event):
    return (
        event["provider"] is not None
        and PROVIDER_BUSINESS_ID_FIELD in event["provider"]
    )


def _business_id_matches(event, business_id):
    return (
        _business_id_is_set(event)
        and event["provider"][PROVIDER_BUSINESS_ID_FIELD] == business_id
    )


def _raise_permission_denied():
    raise PermissionDenied(detail="User doesn't have permission to access this event")


class ServiceClient:
    def __init__(self):
        self.client = LinkedEventsClient()

    def _get_event_and_raise_for_unauthorized(self, request: HttpRequest, event_id):
        """Raises PermissionDenied unless `request.user` is authorized to access event `event_id`
        and also returns the event.

        All operations that read, modify or delete events should call this method.

        See `test_services.py` to understand the access logic better.
        """
        event = self.client.get_event(event_id)
        user = request.user

        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return event

        if user.is_staff:
            permission_granted = _user_matches(event, user)
        else:
            permission_granted = _business_id_matches(event, get_business_id(request))

        if not permission_granted:
            # TODO audit log?
            LOGGER.warning(
                f"User {user.pk} was denied unauthorized access to event {event['id']}"
            )
            _raise_permission_denied()

        return event

    def _filter_events_for_user(self, all_events, user):
        """Filters events that AD-logged in `user` is authorized to access"""
        if not settings.NEXT_PUBLIC_MOCK_FLAG:
            return [e for e in all_events if _user_matches(e, user)]
        else:
            # When mocked we return all events which do not belong to a company
            return [e for e in all_events if not _business_id_is_set(e)]

    def _filter_events_for_company(self, all_events, business_id):
        """Filters events belonging to a company"""
        return [e for e in all_events if _business_id_matches(e, business_id)]

    def _get_publisher(self, user):
        # In MVP phase just returning ahjo:00001 (Helsingin kaupunki) for all
        # We can also get industry (toimiala) from ADFS Graph API (needs translation to ahjo scheme)
        # For company users it is still undecided how we store the company business id (Y-tunnus) in an event
        return "ahjo:00001"

    def list_job_postings_for_user(self, request: HttpRequest):
        if request.user.is_staff:
            all_events = self.client.list_ongoing_events_authenticated(
                self._get_publisher(request.user)
            )
            events = self._filter_events_for_user(all_events, request.user)
        else:
            business_id = get_business_id(request)

            # Searching with the business_id like this narrows down the search, but there is a slight chance
            # that the results contain false positives, i.e. events having the business_id appear
            # somewhere else. This is why we need the second filtering.
            all_events = self.client.list_ongoing_events_authenticated(text=business_id)
            events = self._filter_events_for_company(all_events, business_id)

        job_postings = [reduce_get_event(e) for e in events]

        return {
            "draft": [p for p in job_postings if not is_published(p)],
            "published": [p for p in job_postings if is_published(p)],
        }

    # not MVP?
    def list_ended_job_postings_for_user(self, user):
        return []

    def get_tet_event(self, event_id, request: HttpRequest):
        event = self._get_event_and_raise_for_unauthorized(request, event_id)

        return reduce_get_event(event)

    def add_tet_event(self, validated_data, request: HttpRequest):
        event = enrich_create_event(
            validated_data, self._get_publisher(request.user), request
        )
        created_event = self.client.create_event(event)
        return reduce_get_event(created_event)

    def publish_job_posting(self, event_id, request: HttpRequest):
        event = self._get_event_and_raise_for_unauthorized(request, event_id)
        event["publication_status"] = "public"
        event["date_published"] = date.today().isoformat()
        updated_event = self.client.update_event(event_id, event)

        return reduce_get_event(updated_event)

    def update_tet_event(self, event_id, validated_data, request: HttpRequest):
        self._get_event_and_raise_for_unauthorized(request, event_id)
        event = enrich_update_event(validated_data, request)
        updated_event = self.client.update_event(event_id, event)

        return reduce_get_event(updated_event)

    def delete_event(self, event_id, request: HttpRequest):
        self._get_event_and_raise_for_unauthorized(request, event_id)
        return self.client.delete_event(event_id)
