import json
import logging
from urllib.parse import urljoin

import requests
from django.conf import settings

LOGGER = logging.getLogger(__name__)


class LinkedEventsClient:
    def __init__(self):
        if not all([settings.LINKEDEVENTS_URL, settings.LINKEDEVENTS_API_KEY]):
            raise ValueError("LinkedEvents client settings not configured.")

    def _headers(self):
        return {
            "content-type": "application/json",
            "accept": "application/json",
            "apikey": settings.LINKEDEVENTS_API_KEY,
        }

    # TODO how to handle event status and paging?
    def list_ongoing_events_authenticated(self):
        events = []
        nexturl = None
        while True:
            if nexturl:
                r = requests.get(nexturl, headers=self._headers())
            else:
                params = {
                    "data_source": "tet",
                    "nocache": True,
                    # TODO exclude ended events
                    # "start": "2021-01-01",
                    # "end"
                }
                r = requests.get(
                    urljoin(settings.LINKEDEVENTS_URL, "event/"),
                    headers=self._headers(),
                    params=params,
                )

            r.raise_for_status()
            data = r.json()
            events += data["data"]
            if data["meta"]["next"] is not None:
                nexturl = data["meta"]["next"]
            else:
                break

        return events

    def get_event(self, id):
        params = {
            "data_source": "tet",
            "nocache": True,
        }
        r = requests.get(
            urljoin(settings.LINKEDEVENTS_URL, "event/" + id),
            headers=self._headers(),
            params=params,
        )
        r.raise_for_status()  # TODO return 404
        return r.json()

    def create_event(self, event):
        r = requests.post(
            urljoin(settings.LINKEDEVENTS_URL, "event/"),
            headers=self._headers(),
            data=json.dumps(event),
        )
        r.raise_for_status()
        return r.json()

    def delete_event(self, id):
        params = {
            "data_source": "tet",
            "nocache": True,
        }
        r = requests.delete(
            urljoin(settings.LINKEDEVENTS_URL, "event/" + id),
            headers=self._headers(),
            params=params,
        )
        return r.status_code

    def update_event(self, id, event):
        r = requests.put(
            urljoin(settings.LINKEDEVENTS_URL, "event/" + id),
            headers=self._headers(),
            data=json.dumps(event),
        )
        r.raise_for_status()
        return r.json()
