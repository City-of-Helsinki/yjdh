DUMMY_COMPANY_DATA = {
    "id": "8c0c7a56-cb98-4c31-87ca-6f1853253986",
    "name": "I. Haanpää Oy",
    "business_id": "0877830-0",
    "company_form": "Osakeyhtiö",
    "industry": "Taloustavaroiden vähittäiskauppa",
    "street_address": "Vasaratie 4 A 3",
    "postcode": "65350",
    "city": "Vaasa",
}


DUMMY_ORG_ROLES = {
    "name": "Activenakusteri Oy",
    "identifier": "7769480-5",
    "complete": True,
    "roles": ["NIMKO"],
}


DUMMY_YTJ_RESPONSE = {
    "companies": [
        {
            "businessId": {
                "value": "0877830-0",
                "registrationDate": "1992-01-29",
                "source": "3",
            },
            "companyForms": [
                {
                    "type": "OY",
                    "descriptions": [
                        {"languageCode": "1", "description": "Osakeyhtiö"},
                        {"languageCode": "2", "description": "Aktiebolag"},
                        {"languageCode": "3", "description": "Limited company"},
                    ],
                    "registrationDate": "1999-03-31",
                    "version": 1,
                    "source": "1",
                }
            ],
            "names": [
                {
                    "name": "I. Haanpää Oy",
                    "type": "1",
                    "registrationDate": "1999-03-31",
                    "version": 1,
                    "source": "1",
                },
                {
                    "name": "I. Haanpää Ky",
                    "type": "2",
                    "registrationDate": "1992-01-29",
                    "endDate": "1999-03-30",
                    "version": 2,
                    "source": "1",
                },
            ],
            "addresses": [
                {
                    "type": 1,
                    "street": "Vasaratie 4 A 3",
                    "postCode": "65350",
                    "postOffices": [
                        {"city": "Vaasa", "languageCode": "1"},
                        {"city": "Vasa", "languageCode": "2"},
                    ],
                    "registrationDate": "2020-07-22",
                    "source": "1",
                },
                {
                    "type": 2,
                    "street": "PL 327",
                    "postCode": "65101",
                    "postOffices": [
                        {"city": "Vaasa", "languageCode": "1"},
                    ],
                    "registrationDate": "2013-12-16",
                    "endDate": "2020-07-21",
                    "source": "1",
                },
            ],
            "mainBusinessLine": {
                "descriptions": [
                    {
                        "languageCode": "1",
                        "description": "Taloustavaroiden vähittäiskauppa",
                    },
                    {
                        "languageCode": "2",
                        "description": "Specialiserad butikshandel med hushållsartiklar",
                    },
                    {
                        "languageCode": "3",
                        "description": "Retail sale of household articles",
                    },
                ],
                "registrationDate": "2007-12-31",
                "source": "2",
            },
        }
    ]
}
