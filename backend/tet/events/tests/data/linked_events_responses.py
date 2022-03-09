import json

SAMPLE_EVENTS = json.loads("""
{
    "meta": {
        "count": 5,
        "next": null,
        "previous": null
    },
    "data": [
        {
            "id": "tet:af7w4jmjla",
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
        },
        {
            "id": "tet:af7wto6nze",
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
        },
        {
            "id": "tet:af7wtenvii",
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
                "editor_email": "testuser@example.org",
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
            "search_vector_fi": "'maalaaj':2A 'maalaam':5B,7B,9B,11B,14C,16C,18C,20C 'myös':10B,19C 'pääse':4B,13C 'seinä':1A 'tääl':3B,12C",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "kallen testi tet"
            },
            "name": {
                "fi": "seinän maalaaja"
            },
            "description": {
                "fi": "täällä pääset maalaamaan ja maalaamaan ja maalaamaan. myös maalaamaan."
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "täällä pääset maalaamaan ja maalaamaan ja maalaamaan. myös maalaamaan."
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7wtenvii/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        },
        {
            "id": "tet:af7wjlxpyy",
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
        },
        {
            "id": "tet:af7scpy2de",
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
            "date_published": null,
            "start_time": "2022-04-11",
            "end_time": "2022-04-15",
            "created_by": " - ",
            "last_modified_by": " - ",
            "custom_data": {
                "spots": "4",
                "org_name": "Päiväkoti Susanna",
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
            "search_vector_fi": "'ark':4B,13C 'avustaj':1A 'avustav':5B,14C 'henkilökun':10B,19C 'hoito':7B,16C 'kasvatustehtäv':9B,18C 'osallistumin':2B,11C 'päiväkod':3B,12C 'työtehtäv':6B,15C",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "Päiväkoti Susanna"
            },
            "name": {
                "fi": "Avustaja"
            },
            "description": {
                "fi": "Osallistuminen päiväkodin arkeen. Avustavia työtehtäviä hoito- ja kasvatustehtävissä henkilökunnan kanssa."
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "Osallistuminen päiväkodin arkeen. Avustavia työtehtäviä hoito- ja kasvatustehtävissä henkilökunnan kanssa."
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7scpy2de/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
    ]
}""")


ADD_EVENT_PAYLOAD = json.loads("""
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
""")

ADD_EVENT_RESPONSE = json.loads("""
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
        "fi": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a urna ut sem fringilla iaculis. Mauris luctus, dolor ac dictum tincidunt, velit quam molestie ipsum, a lobortis turpis nisi eu nisi. Quisque luctus tortor eget porttitor dictum. Vivamus pulvinar tortor eget interdum condimentum. Praesent felis diam, commodo bibendum bibendum in, commodo at diam. Cras convallis volutpat lectus, ut dictum lorem hendrerit sit amet. Sed dui velit, faucibus quis elit non, imperdiet rhoncus urna. Aliquam id ex nec mi venenatis gravida. Maecenas ante ex, malesuada a metus in, cursus ultrices mauris. Cras a vulputate mauris. Nullam sit amet ultrices elit. Mauris ut libero nulla. Nam pulvinar tempor risus. Ut congue, orci vitae ornare pharetra, tortor ipsum lobortis sem, non varius est erat fringilla urna. Suspendisse eget interdum mi. Integer semper dui quis ante bibendum sollicitudin. Aliquam efficitur placerat elit, quis dapibus arcu semper vitae. Nulla urna tellus, molestie non consectetur a, accumsan pretium nisi. Fusce dictum sed tortor eu bibendum. Donec non sapien ut dolor laoreet venenatis ac eget libero. Sed nec ullamcorper elit. Maecenas et ante eu nunc gravida pulvinar eu vitae enim. Donec viverra urna ligula, tristique tincidunt lacus consectetur egestas. Sed rhoncus ligula viverra fringilla pellentesque. Nunc ut bibendum ipsum, sed elementum risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut suscipit vehicula est vitae semper. Aenean ac dui sit amet justo vehicula dapibus. Nulla facilisi. Phasellus non dignissim libero. Nunc in lectus tempus dui volutpat mattis non hendrerit risus. Vestibulum sed diam at odio semper euismod. Etiam gravida nisl lectus. Curabitur sed turpis condimentum, suscipit nibh ut, luctus dui. Nunc congue luctus malesuada. Nunc turpis sapien, mattis at ex maximus, vehicula consectetur nisi. Vestibulum ut eros in leo blandit venenatis. Maecenas convallis vitae ante ut tincidunt. Etiam tempus lacus mauris, a malesuada nibh aliquet bibendum. Nunc vitae gravida sapien, consequat hendrerit ex. Suspendisse vestibulum enim at lacus varius dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque malesuada orci vel ex finibus tempor. Fusce sed lacinia nisi, id eleifend lacus. Sed ut nisl sed ipsum semper bibendum non a sapien. Donec eu diam ut risus elementum consectetur a vitae elit. Phasellus dapibus euismod ante eget lacinia. Duis metus nunc, vestibulum sit amet maximus sed, elementum et elit. Suspendisse malesuada diam dolor, at finibus magna suscipit at Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a urna ut sem fringilla iaculis. Mauris luctus, dolor ac dictum tincidunt, velit quam molestie ipsum, a lobortis turpis nisi eu nisi. Quisque luctus tortor eget porttitor dictum. Vivamus pulvinar tortor eget interdum condimentum. Praesent felis diam, commodo bibendum bibendum in, commodo at diam. Cras convallis volutpat lectus, ut dictum lorem hendrerit sit amet. Sed dui velit, faucibus quis elit non, imperdiet rhoncus urna. Aliquam id ex nec mi venenatis gravida. Maecenas ante ex, malesuada a metus in, cursus ultrices mauris. Cras a vulputate mauris. Nullam sit amet ultrices elit. Mauris ut libero nulla. Nam pulvinar tempor risus. Ut congue, orci vitae ornare pharetra, tortor ipsum lobortis sem, non varius est erat fringilla urna. Suspendisse eget interdum mi. Integer semper dui quis ante bibendum sollicitudin. Aliquam efficitur placerat elit, quis dapibus arcu semper vitae. Nulla urna tellus, molestie non consectetur a, accumsan pretium nisi. Fusce dictum sed tortor eu bibendum. Donec non sapien ut dolor laoreet venenatis ac eget libero. Sed nec ullamcorper elit. Maecenas et ante eu nunc gravida pulvinar eu vitae enim. Donec viverra urna ligula, tristique tincidunt lacus consectetur egestas. Sed rhoncus ligula viverra fringilla pellentesque. Nunc ut bibendum ipsum, sed elementum risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut suscipit vehicula est vitae semper. Aenean ac dui sit amet justo vehicula dapibus. Nulla facilisi. Phasellus non dignissim libero. Nunc in lectus tempus dui volutpat mattis non hendrerit risus. Vestibulum sed diam at odio semper euismod. Etiam gravida nisl lectus. Curabitur sed turpis condimentum, suscipit nibh ut, luctus dui. Nunc congue luctus malesuada. Nunc turpis sapien, mattis at ex maximus, vehicula consectetur nisi. Vestibulum ut eros in leo blandit venenatis. Maecenas convallis vitae ante ut tincidunt. Etiam tempus lacus mauris, a malesuada nibh aliquet bibendum. Nunc vitae gravida sapien, consequat hendrerit ex. Suspendisse vestibulum enim at lacus varius dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque malesuada orci vel ex finibus tempor. Fusce sed lacinia nisi, id eleifend lacus. Sed ut nisl sed ipsum semper bibendum non a sapien. Donec eu diam ut risus elementum consectetur a vitae elit. Phasellus dapibus euismod ante eget lacinia. Duis metus nunc, vestibulum sit amet maximus sed, elementum et elit. Suspendisse malesuada diam dolor, at finibus magna suscipit at. Aenean ac volutpat est. Vivamus auctor odio magna, quis dictum leo elementum sit amet. Nunc condimentum libero ac nulla sodales egestas. Vivamus iaculis ante a neque cursus sollicitudin. Mauris aliquet luctus erat. Donec id ipsum dui. Cras ac ligula vitae magna consequat bibendum sit amet ut mi. Duis vel orci nec justo aliquam finibus."
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
""")

EVENT_RESPONSE_TESTUSER = json.loads("""
        {
            "id": "tet:af7w4jmjla",
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
""")


EVENT_RESPONSE_OTHERUSER = json.loads("""
        {
            "id": "tet:af7wto6nze",
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
""")


EVENT_RESPONSE_NO_USER = json.loads("""
        {
            "id": "tet:af7wtenvii",
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
                "editor_email": "testuser@example.org",
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
            "search_vector_fi": "'maalaaj':2A 'maalaam':5B,7B,9B,11B,14C,16C,18C,20C 'myös':10B,19C 'pääse':4B,13C 'seinä':1A 'tääl':3B,12C",
            "search_vector_en": "",
            "search_vector_sv": "",
            "replaced_by": null,
            "provider": {
                "fi": "kallen testi tet"
            },
            "name": {
                "fi": "seinän maalaaja"
            },
            "description": {
                "fi": "täällä pääset maalaamaan ja maalaamaan ja maalaamaan. myös maalaamaan."
            },
            "location_extra_info": null,
            "info_url": null,
            "provider_contact_info": null,
            "short_description": {
                "fi": "täällä pääset maalaamaan ja maalaamaan ja maalaamaan. myös maalaamaan."
            },
            "@id": "https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/event/tet:af7wtenvii/",
            "@context": "http://schema.org",
            "@type": "Event/LinkedEvent"
        }
""")


EVENT_RESPONSE_NO_CUSTOM_DATA = json.loads("""
        {
            "id": "tet:af7wjlxpyy",
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
""")
