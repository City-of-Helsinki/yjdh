import logging

import requests
from django.conf import settings
from urllib.parse import urljoin
from datetime import date
import json

LOGGER = logging.getLogger(__name__)

TEST_EVENT = json.loads("""        {
            "id": "tet:af7jcccbra",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:15321/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/kulke:218/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/helmet:11777/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p1808/"
                }
            ],
            "registration": null,
            "super_event": null,
            "event_status": "EventScheduled",
            "type_id": "General",
            "publication_status": "public",
            "external_links": [],
            "offers": [
                {
                    "is_free": true,
                    "info_url": null,
                    "description": {
                        "fi": "",
                        "sv": "",
                        "en": ""
                    },
                    "price": {
                        "fi": "",
                        "sv": "",
                        "en": ""
                    }
                }
            ],
            "data_source": "tet",
            "publisher": "ahjo:00001",
            "sub_events": [],
            "images": [],
            "videos": [],
            "in_language": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/language/fi/"
                }
            ],
            "audience": [],
            "created_time": "2022-01-25T11:39:04.480875Z",
            "last_modified_time": "2022-01-25T11:39:04.480903Z",
            "date_published": null,
            "start_time": "2022-01-29T08:00:00Z",
            "end_time": null,
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "2",
                "org_name": "Helsingin kaupunki",
                "editor_email": "test@example.org",
                "contact_email": "john.doe@example.org",
                "contact_phone": "0401234567",
                "contact_language": "fi",
                "contact_last_name": "Doe",
                "contact_first_name": "John"
            },
            "audience_min_age": null,
            "audience_max_age": null,
            "super_event_type": null,
            "deleted": false,
            "maximum_attendee_capacity": null,
            "minimum_attendee_capacity": null,
            "enrolment_start_time": null,
            "enrolment_end_time": null,
            "local": false,
            "search_vector_fi": "'kirjastoapulain':1A 'kuvaus':5B,9C 'paika':4B,8C 'tet':3B,7C 'tet-paik':2B,6C",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "location_extra_info": null,
            "short_description": {
                "fi": "TET-paikan kuvaus"
            },
            "name": {
                "fi": "Kirjastoapulainen"
            },
            "provider_contact_info": null,
            "info_url": null,
            "description": {
                "fi": "TET-paikan kuvaus"
            },
            "provider": null,
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7jcccbra/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }""")


class LinkedEventsClient:
    def __init__(self):
        if not all([settings.LINKEDEVENTS_URL, settings.LINKEDEVENTS_API_KEY]):
            raise ValueError("LinkedEvents client settings not configured.")

    def _headers(self):
        return {
            'content-type': 'application/json',
            'accept': 'application/json',
            'apikey': settings.LINKEDEVENTS_API_KEY,
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
                r = requests.get(urljoin(settings.LINKEDEVENTS_URL, 'event/'), headers=self._headers(), params=params)

            r.raise_for_status()
            data = r.json()
            events += data['data']
            if data['meta']['next'] is not None:
                nexturl = data['meta']['next']
            else:
                break

        return events

    def get_event(self, eventid, user):
        # TODO check that user is allowed to access the event
        return None

    def create_event(self, event):
        r = requests.post(urljoin(settings.LINKEDEVENTS_URL, 'event/'), headers=self._headers(), data=json.dumps(event))
        LOGGER.error(r.text)
        r.raise_for_status()
        return r.json()

