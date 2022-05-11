import json

from events.utils import PROVIDER_BUSINESS_ID_FIELD, PROVIDER_NAME_FIELD

ADD_EVENT_PAYLOAD = json.loads(
    """
{
    "name": {
        "fi": "Testaaja"
    },
    "location": {
        "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:15417/"
    },
    "description": {
        "fi": "test description"
    },
    "start_time": "2022-05-09",
    "end_time": null,
    "date_published": null,
    "keywords": [
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:11/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:12/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p3971/"
        }
    ],
    "custom_data": {
        "spots": "1",
        "org_name": "Test Place",
        "contact_email": "apitester@example.org",
        "contact_phone": "0123456789",
        "contact_language": "fi",
        "contact_first_name": "API",
        "contact_last_name": "Tester"
    },
    "in_language": [
        {
            "@id": "http://localhost:8080/v1/language/fi/"
        },
        {
            "@id": "http://localhost:8080/v1/language/sv/"
        }
    ]
}
"""
)

ADD_EVENT_RESPONSE = json.loads(
    """
{
    "id": "tet:af7w5v5m6e",
    "location": {
        "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:15417/"
    },
    "keywords": [
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:11/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:12/"
        },
        {
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p3971/"
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
            "@id": "http://localhost:8080/v1/language/fi/"
        },
        {
            "@id": "http://localhost:8080/v1/language/sv/"
        }
    ],
    "audience": [],
    "created_time": "2022-03-09T13:21:42.665340Z",
    "last_modified_time": "2022-03-09T13:21:42.665373Z",
    "date_published": null,
    "start_time": "2022-04-01",
    "end_time": "2022-05-01",
    "created_by": "API key from data source tet",
    "last_modified_by": "API key from data source tet",
    "custom_data": {
        "spots": "1",
        "org_name": "Test Place",
        "contact_email": "apitester@example.org",
        "contact_phone": "0123456789",
        "contact_language": "fi",
        "contact_first_name": "API",
        "contact_last_name": "Tester"
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
    "search_vector_fi": null,
    "search_vector_en": null,
    "search_vector_sv": null,
    "replaced_by": null,
    "provider": {
        "fi": "Helsingin kaupunki"
    },
    "name": {
        "fi": "Minimal 2"
    },
    "description": {
        "fi": "Lorem ipsum"
    },
    "location_extra_info": null,
    "info_url": null,
    "provider_contact_info": null,
    "short_description": {
        "fi": "TET-paikan kuvaus"
    },
    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7w5v5m6e/",
    "@context": "http://schema.org",
    "@type": "Event/LinkedEvent"
}
"""
)

EVENT_RESPONSE_TESTUSER_EMAIL = json.loads(
    """
        {
            "id": "tet:test-user-email-set",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:20780/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:2/"
                }
            ],
            "registration": null,
            "super_event": null,
            "event_status": "EventScheduled",
            "type_id": "General",
            "publication_status": "draft",
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
            "created_time": "2022-03-09T10:07:08.149791Z",
            "last_modified_time": "2022-03-09T10:07:08.149854Z",
            "date_published": null,
            "start_time": "2022-05-23",
            "end_time": null,
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "1",
                "org_name": "Testipaikka",
                "editor_email": "testuser@example.org",
                "contact_email": "testuser@example.org",
                "contact_phone": "040123444",
                "contact_language": "fi",
                "contact_last_name": "Heppu",
                "contact_first_name": "Testi"
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
            "search_vector_fi": "'harjoittelij':1A 'x':2B,3C",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "Testipaikka"
            },
            "name": {
                "fi": "Harjoittelija"
            },
            "description": {
                "fi": "xx"
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "xx"
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7w4jmjla/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
"""
)


EVENT_RESPONSE_TESTUSER_OID = json.loads(
    """
        {
            "id": "tet:test-user-oid-set",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:56379/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:12/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p16557/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p9903/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/yso:p13310/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:6/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:4/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:10/"
                },
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:9/"
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
            "created_time": "2022-03-08T12:47:11.191728Z",
            "last_modified_time": "2022-03-08T12:49:03.450105Z",
            "date_published": "2022-03-07T22:00:00Z",
            "start_time": "2022-04-01",
            "end_time": null,
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "2",
                "org_name": "testi tet",
                "editor_oid": "test-oid",
                "contact_email": "t@example.org",
                "contact_phone": "050123456",
                "contact_language": "fi",
                "contact_last_name": "Testaaja",
                "contact_first_name": "K"
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
            "search_vector_fi": "",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "testi tet"
            },
            "name": {
                "fi": "seinän maalaaja"
            },
            "description": {
                "fi": "täällä pääset maalaamaan."
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "täällä pääset maalaamaan"
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7wtenvii/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
"""
)


EVENT_RESPONSE_OTHERUSER = json.loads(
    """
        {
            "id": "tet:other-user",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:8740/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
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
            "created_time": "2022-03-08T13:33:09.981981Z",
            "last_modified_time": "2022-03-08T13:33:09.982017Z",
            "date_published": null,
            "start_time": "2022-06-01",
            "end_time": null,
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "1",
                "org_name": "Testipaikka",
                "editor_email": "otheruser@example.org",
                "contact_email": "t@example.org",
                "contact_phone": "0401231232",
                "contact_language": "fi",
                "contact_last_name": "Heppu",
                "contact_first_name": "Testi"
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
            "search_vector_fi": "'kuvaus':2B,3C 'testaaj':1A",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "Testipaikka"
            },
            "name": {
                "fi": "Testaaja"
            },
            "description": {
                "fi": "kuvaus"
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "kuvaus"
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7wto6nze/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
"""
)


EVENT_RESPONSE_TEST_COMPANY = json.loads(
    """
        {
            "id": "tet:companyuser",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:352/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
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
            "created_time": "2022-02-22T11:44:17.966052Z",
            "last_modified_time": "2022-03-07T14:00:01.981206Z",
            "date_published": "2022-03-07T14:00:01.981206Z",
            "start_time": "2022-04-11",
            "end_time": "2022-04-15",
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "4",
                "org_name": "Test Company",
                "contact_email": "yrjo@ef.fi",
                "contact_phone": "040585766832",
                "contact_language": "fi",
                "contact_last_name": "jogagegeg",
                "contact_first_name": "Yrjö"
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
            "search_vector_fi": "",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {},
            "name": {
                "fi": "Avustaja"
            },
            "description": {
                "fi": "x"
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "x"
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7scpy2de/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
"""
)

EVENT_RESPONSE_TEST_COMPANY["provider"] = {
    PROVIDER_NAME_FIELD: "Test company",
    PROVIDER_BUSINESS_ID_FIELD: "654321-5",
}


EVENT_RESPONSE_NO_CUSTOM_DATA = json.loads(
    """
        {
            "id": "tet:no-custom-data",
            "location": {
                "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/place/tprek:37497/"
            },
            "keywords": [
                {
                    "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/keyword/tet:1/"
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
            "created_time": "2022-03-07T14:01:00.637207Z",
            "last_modified_time": "2022-03-07T14:01:00.637234Z",
            "date_published": null,
            "start_time": "2022-06-06",
            "end_time": null,
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": null,
            "audience_min_age": null,
            "audience_max_age": null,
            "super_event_type": null,
            "deleted": false,
            "maximum_attendee_capacity": null,
            "minimum_attendee_capacity": null,
            "enrolment_start_time": null,
            "enrolment_end_time": null,
            "local": false,
            "search_vector_fi": "'kuvaus':2B,3C 'testaaj':1A",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "Avaintesti"
            },
            "name": {
                "fi": "Testaaja"
            },
            "description": {
                "fi": "kuvaus"
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "kuvaus"
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7wjlxpyy/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
"""
)


SAMPLE_EVENTS = {
    "meta": {"count": 5, "next": None, "previous": None},
    "data": [
        EVENT_RESPONSE_TESTUSER_EMAIL,
        EVENT_RESPONSE_TESTUSER_OID,
        EVENT_RESPONSE_OTHERUSER,
        EVENT_RESPONSE_TEST_COMPANY,
        EVENT_RESPONSE_NO_CUSTOM_DATA,
    ],
}
