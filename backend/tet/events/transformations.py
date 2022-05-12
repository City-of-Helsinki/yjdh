import unicodedata

from django.http import HttpRequest

from events.utils import (
    get_business_id,
    get_organization_name,
    PROVIDER_BUSINESS_ID_FIELD,
    PROVIDER_NAME_FIELD,
)

EVENT_BASE_DATA = {
    "offers": [
        {
            "is_free": True,
            "price": {"fi": "", "sv": "", "en": ""},
            "description": {"fi": "", "sv": "", "en": ""},
            "info_url": None,
        }
    ],
}

CREATE_EVENT_BASE_DATA = {
    "event_status": "EventScheduled",
    "type_id": "General",
    "data_source": "tet",
    "in_language": [{"@id": "http://localhost:8080/v1/language/fi/"}],
}


def _new_from(obj, keys):
    new = {}
    for key in keys:
        new[key] = obj[key]
    return new


def _shorten_description(descobj):
    shortened_obj = {}
    for lang in descobj.keys():
        desc = descobj[lang]
        if len(desc) <= 125:
            shortened_obj[lang] = desc
        else:
            shortened_obj[
                lang
            ] = f"{desc[:125]}{unicodedata.lookup('Horizontal ellipsis')}"

    return shortened_obj


def enrich_create_event(event, publisher, request: HttpRequest):
    user = request.user

    event.update(EVENT_BASE_DATA)
    event.update(CREATE_EVENT_BASE_DATA)

    if "publication_status" not in event or event["publication_status"] is None:
        event["publication_status"] = "draft"

    event["publisher"] = publisher
    event["short_description"] = _shorten_description(event["description"])

    if user.is_staff:
        if user.email:
            event["custom_data"]["editor_email"] = user.email
        # In TET settings we specify `USERNAME_CLAIM = "oid"`, which sets the user's object identifier as
        # Django username. This is added to provide "event ownership info" in case user.email is empty.
        event["custom_data"]["editor_oid"] = user.username

        event["provider"] = {
            PROVIDER_NAME_FIELD: get_organization_name(request),
        }
    else:  # user is logged in via suomi.fi
        event["provider"] = {
            PROVIDER_NAME_FIELD: get_organization_name(request),
            PROVIDER_BUSINESS_ID_FIELD: get_business_id(request),
        }

    return event


def enrich_update_event(event, user):
    event.update(EVENT_BASE_DATA)
    event["short_description"] = _shorten_description(event["description"])

    if user.is_staff:
        if user.email:
            event["custom_data"]["editor_email"] = user.email
        event["custom_data"]["editor_oid"] = user.username

    # Not sure why it resets publication status from draft to public without the following line
    # This is not a problem because we keep the two in sync
    # publication_status is what decides whether the event is shown in Youth UI
    event["publication_status"] = "public" if event["date_published"] else "draft"
    return event


def reduce_get_event(event):
    tetevent = _new_from(
        event,
        (
            "id",
            "name",
            "description",
            "location",
            "keywords",
            "date_published",
            "start_time",
            "end_time",
            "custom_data",
            "publication_status",
            "in_language",
        ),
    )

    # Do we need this? For published events, these are publicly visible anyway
    if tetevent["custom_data"] is not None:
        if "editor_email" in tetevent["custom_data"]:
            del tetevent["custom_data"]["editor_email"]
        if "editor_oid" in tetevent["custom_data"]:
            del tetevent["custom_data"]["editor_oid"]

    return tetevent
