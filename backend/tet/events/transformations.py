EVENT_BASE_DATA = {
    "offers": [
        {
            "is_free": True,
            "price": {
                "fi": "",
                "sv": "",
                "en": ""
            },
            "description": {
                "fi": "",
                "sv": "",
                "en": ""
            },
            "info_url": None
        }
    ],
}

CREATE_EVENT_BASE_DATA = {
    "event_status": "EventScheduled",
    "type_id": "General",
    "publication_status": "public",
    "data_source": "tet",
    "in_language": [
        {
            "@id": "http://localhost:8080/v1/language/fi/"
        }
    ],
}



def _new_from(object, keys):
    new = {}
    for key in keys:
        new[key] = object[key]
    return new

def event_to_job_posting(event):
    """Transform event into job posting


    """

    # These fields always exist in an event
    # posting = dict(
    #     id=event['id'],
    #     name=_get_localized(event['name']),
    #     start_time=event['start_time'],
    #     end_time=event['end_time'],
    #     location=_get_id(event['location'])
    #
    #
    # )
    # return posting

def enrich_create_event(event, publisher, email):
    event.update(EVENT_BASE_DATA)
    event.update(CREATE_EVENT_BASE_DATA)
    event['publisher'] = publisher
    event['short_description'] = event['description']  # TODO substring
    event['custom_data']['editor_email'] = email
    event['provider'] = {'fi': event['custom_data']['org_name']}  # TODO org name from AD/Suomi.fi

    return event


def enrich_update_event(event):
    pass


def reduce_get_event(event):
    tetevent =  _new_from(event, ('id', 'name', 'description', 'location', 'keywords', 'date_published', 'start_time', 'end_time', 'custom_data'))
    del tetevent["custom_data"]["editor_email"]
    return tetevent
