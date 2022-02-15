import unicodedata

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
    "publication_status": "draft",
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


def enrich_create_event(event, publisher, user):
    event.update(EVENT_BASE_DATA)
    event.update(CREATE_EVENT_BASE_DATA)
    event["publisher"] = publisher
    event["short_description"] = _shorten_description(event["description"])
    if user.email:
        event["custom_data"]["editor_email"] = user.email
    # In TET settings we specify `USERNAME_CLAIM = "oid"`, which sets the user's object identifier as
    # Django username. This is added to provide "event ownership info" in case user.email is empty.
    # TODO When suomi.fi auth is added, we need to revisit this implementation.
    event["custom_data"]["editor_oid"] = user.username
    event["provider"] = {
        "fi": event["custom_data"]["org_name"]
    }  # TODO org name from AD/Suomi.fi

    return event


def enrich_update_event(event, user):
    event.update(EVENT_BASE_DATA)
    event["short_description"] = _shorten_description(event["description"])
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
