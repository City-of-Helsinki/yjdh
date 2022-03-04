from django.conf import settings


def get_dummy_company_data():
    dummy_data = DUMMY_COMPANY_DATA.copy()
    if hasattr(settings, "DUMMY_COMPANY_FORM") and settings.DUMMY_COMPANY_FORM:
        dummy_data["company_form"] = settings.DUMMY_COMPANY_FORM
    return dummy_data


DUMMY_COMPANY_DATA = {
    "id": "8c0c7a56-cb98-4c31-87ca-6f1853253986",
    "name": "Demo I. Haanpää Oy",
    "business_id": "0877830-0",
    "company_form": "OY",
    "bank_account_number": "FI2112345600000785",
    "street_address": "Vasaratie 4 A 3",
    "postcode": "65350",
    "city": "Vaasa",
}


DUMMY_YTJ_RESPONSE = {
    "type": "fi.prh.opendata.tr",
    "version": "1",
    "totalResults": -1,
    "resultsFrom": 0,
    "previousResultsUri": None,
    "nextResultsUri": None,
    "exceptionNoticeUri": None,
    "results": [
        {
            "businessId": "0877830-0",
            "name": "I. Haanpää Oy",
            "registrationDate": "1992-01-29",
            "companyForm": "OY",
            "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/0877830-0",
            "bisDetailsUri": "http://avoindata.prh.fi/opendata/bis/v1/0877830-0",
            "language": "FI",
            "latestRegistrationDate": "2021-01-12",
            "checkDate": None,
            "names": [
                {
                    "order": 0,
                    "name": "I. Haanpää Oy",
                    "registrationDate": "1999-03-31",
                    "endDate": None,
                    "language": None,
                }
            ],
            "auxiliaryNames": [],
            "companyForms": [{"type": "OY", "registrationDate": "1999-03-31"}],
            "addresses": [
                {
                    "street": "Vasaratie 4 A 3",
                    "postCode": "65350",
                    "type": 2,
                    "city": "Vaasa",
                    "country": "FI",
                    "website": None,
                    "phone": "0400 665254",
                    "fax": None,
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                }
            ],
            "publicNotices": [
                {
                    "recordNumber": "2020/55730X",
                    "registrationDate": "2021-01-01",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2020/55730X",
                },
                {
                    "recordNumber": "2020/290401",
                    "registrationDate": "2020-06-15",
                    "typeOfRegistration": "M",
                    "entryCodes": [""],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2020/290401",
                },
                {
                    "recordNumber": "2019/53986T",
                    "registrationDate": "2019-12-05",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2019/53986T",
                },
                {
                    "recordNumber": "2019/250695",
                    "registrationDate": "2019-07-09",
                    "typeOfRegistration": "M",
                    "entryCodes": ["HAL"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2019/250695",
                },
                {
                    "recordNumber": "2018/50210V",
                    "registrationDate": "2018-10-19",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2018/50210V",
                },
                {
                    "recordNumber": "2017/46683V",
                    "registrationDate": "2017-10-21",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2017/46683V",
                },
                {
                    "recordNumber": "2016/86280V",
                    "registrationDate": "2016-11-03",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2016/86280V",
                },
                {
                    "recordNumber": "2015/739492",
                    "registrationDate": "2015-11-04",
                    "typeOfRegistration": "M",
                    "entryCodes": ["TILTAR"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2015/739492",
                },
                {
                    "recordNumber": "2015/84509U",
                    "registrationDate": "2015-10-08",
                    "typeOfRegistration": "TA",
                    "entryCodes": ["TASE"],
                    "detailsUri": "http://avoindata.prh.fi/opendata/tr/v1/publicnotices/2015/84509U",
                },
            ],
            "registeredOffices": [
                {
                    "registeredOffice": "Vaasa",
                    "language": "EN",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                },
                {
                    "registeredOffice": "Vasa",
                    "language": "SE",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                },
                {
                    "registeredOffice": "Vaasa",
                    "language": "FI",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                },
            ],
        }
    ],
}


DUMMY_YTJ_BUSINESS_DETAILS_RESPONSE = {
    "type": "fi.prh.opendata.bis",
    "version": "1",
    "totalResults": -1,
    "resultsFrom": 0,
    "previousResultsUri": None,
    "nextResultsUri": None,
    "exceptionNoticeUri": None,
    "results": [
        {
            "businessId": "0877830-0",
            "name": "I. Haanpää Oy",
            "registrationDate": "1992-03-03",
            "companyForm": "OY",
            "detailsUri": None,
            "liquidations": [],
            "names": [
                {
                    "order": 0,
                    "version": 1,
                    "name": "I. Haanpää Oy",
                    "registrationDate": "1999-03-31",
                    "endDate": None,
                    "source": 1,
                },
                {
                    "order": 0,
                    "version": 2,
                    "name": "I. Haanpää Ky",
                    "registrationDate": "1992-01-29",
                    "endDate": "1999-03-30",
                    "source": 1,
                },
            ],
            "auxiliaryNames": [],
            "addresses": [
                {
                    "careOf": None,
                    "street": "Vasaratie 4 A 3",
                    "postCode": "65350",
                    "type": 1,
                    "version": 2,
                    "city": "VAASA",
                    "country": None,
                    "registrationDate": "2013-12-16",
                    "endDate": "2013-12-18",
                    "language": "FI",
                    "source": 0,
                },
                {
                    "careOf": None,
                    "street": "PL 327",
                    "postCode": "65101",
                    "type": 2,
                    "version": 2,
                    "city": "VAASA",
                    "country": None,
                    "registrationDate": "2013-12-16",
                    "endDate": "2020-07-21",
                    "language": "FI",
                    "source": 0,
                },
                {
                    "careOf": None,
                    "street": "",
                    "postCode": None,
                    "type": 1,
                    "version": 1,
                    "city": None,
                    "country": None,
                    "registrationDate": "2013-12-18",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "careOf": None,
                    "street": "Vasaratie 4 A 3",
                    "postCode": "65350",
                    "type": 2,
                    "version": 1,
                    "city": "VAASA",
                    "country": None,
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
            ],
            "companyForms": [
                {
                    "version": 1,
                    "name": "Osakeyhtiö",
                    "type": "OY",
                    "registrationDate": "1999-03-31",
                    "endDate": None,
                    "language": "FI",
                    "source": 1,
                },
                {
                    "version": 1,
                    "name": "Aktiebolag",
                    "type": "AB",
                    "registrationDate": "1999-03-31",
                    "endDate": None,
                    "language": "SE",
                    "source": 1,
                },
                {
                    "version": 1,
                    "name": "Limited company",
                    "type": None,
                    "registrationDate": "1999-03-31",
                    "endDate": None,
                    "language": "EN",
                    "source": 1,
                },
            ],
            "businessLines": [
                {
                    "order": 0,
                    "version": 1,
                    "code": "47594",
                    "name": "Retail sale of household articles",
                    "registrationDate": "2007-12-31",
                    "endDate": None,
                    "language": "EN",
                    "source": 2,
                },
                {
                    "order": 0,
                    "version": 1,
                    "code": "47594",
                    "name": "Taloustavaroiden vähittäiskauppa",
                    "registrationDate": "2007-12-31",
                    "endDate": None,
                    "language": "FI",
                    "source": 2,
                },
                {
                    "order": 0,
                    "version": 1,
                    "code": "47594",
                    "name": "Specialiserad butikshandel med hushållsartiklar",
                    "registrationDate": "2007-12-31",
                    "endDate": None,
                    "language": "SE",
                    "source": 2,
                },
            ],
            "languages": [
                {
                    "version": 1,
                    "name": "Finnish",
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "language": "EN",
                    "source": 0,
                },
                {
                    "version": 1,
                    "name": "Suomi",
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 1,
                    "name": "Finska",
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "language": "SE",
                    "source": 0,
                },
            ],
            "registedOffices": [
                {
                    "order": 0,
                    "version": 1,
                    "name": "VAASA",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                    "language": "EN",
                    "source": 0,
                },
                {
                    "order": 0,
                    "version": 1,
                    "name": "VAASA",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "order": 0,
                    "version": 1,
                    "name": "VASA",
                    "registrationDate": "2005-01-25",
                    "endDate": None,
                    "language": "SE",
                    "source": 0,
                },
                {
                    "order": 0,
                    "version": 2,
                    "name": "VÄHÄKYRÖ",
                    "registrationDate": "1999-03-31",
                    "endDate": "2005-01-24",
                    "language": "EN",
                    "source": 0,
                },
                {
                    "order": 0,
                    "version": 2,
                    "name": "VÄHÄKYRÖ",
                    "registrationDate": "1999-03-31",
                    "endDate": "2005-01-24",
                    "language": "FI",
                    "source": 0,
                },
                {
                    "order": 0,
                    "version": 2,
                    "name": "LILLKYRO",
                    "registrationDate": "1999-03-31",
                    "endDate": "2005-01-24",
                    "language": "SE",
                    "source": 0,
                },
            ],
            "contactDetails": [
                {
                    "version": 1,
                    "value": "0400 665254",
                    "type": "Matkapuhelin",
                    "registrationDate": "2005-01-11",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "0400 665254",
                    "type": "Mobiltelefon",
                    "registrationDate": "2005-01-11",
                    "endDate": None,
                    "language": "SE",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "0400 665254",
                    "type": "Mobile phone",
                    "registrationDate": "2005-01-11",
                    "endDate": None,
                    "language": "EN",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 3129811",
                    "type": "Puhelin",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 3129811",
                    "type": "Telefon",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "SE",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 3129811",
                    "type": "Telephone",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "EN",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 9129812",
                    "type": "Faksi",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 9129812",
                    "type": "Fax",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "SE",
                    "source": 0,
                },
                {
                    "version": 2,
                    "value": "06 9129812",
                    "type": "Fax",
                    "registrationDate": "2005-01-11",
                    "endDate": "2020-07-21",
                    "language": "EN",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Puhelin",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Telefon",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "SE",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Telephone",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "EN",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Faksi",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "FI",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Fax",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "SE",
                    "source": 0,
                },
                {
                    "version": 1,
                    "value": "",
                    "type": "Fax",
                    "registrationDate": "2020-07-22",
                    "endDate": None,
                    "language": "EN",
                    "source": 0,
                },
            ],
            "registeredEntries": [
                {
                    "authority": 1,
                    "register": 4,
                    "status": 1,
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "statusDate": "2020-06-03",
                    "language": "FI",
                    "description": "Rekisterissä",
                },
                {
                    "authority": 1,
                    "register": 4,
                    "status": 1,
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "statusDate": "2020-06-03",
                    "language": "SE",
                    "description": "Registrerad",
                },
                {
                    "authority": 1,
                    "register": 4,
                    "status": 1,
                    "registrationDate": "1992-03-03",
                    "endDate": None,
                    "statusDate": "2020-06-03",
                    "language": "EN",
                    "description": "Registered",
                },
                {
                    "authority": 1,
                    "register": 5,
                    "status": 1,
                    "registrationDate": "1995-03-01",
                    "endDate": None,
                    "statusDate": "2017-03-16",
                    "language": "FI",
                    "description": "Rekisterissä",
                },
                {
                    "authority": 1,
                    "register": 5,
                    "status": 1,
                    "registrationDate": "1995-03-01",
                    "endDate": None,
                    "statusDate": "2017-03-16",
                    "language": "SE",
                    "description": "Registrerad",
                },
                {
                    "authority": 1,
                    "register": 5,
                    "status": 1,
                    "registrationDate": "1995-03-01",
                    "endDate": None,
                    "statusDate": "2017-03-16",
                    "language": "EN",
                    "description": "Registered",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "1994-06-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "FI",
                    "description": "Liiketoiminnasta arvonlisäverovelvollinen",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "1994-06-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "SE",
                    "description": "Momsskyldig för rörelseverksamhet",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "1994-06-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "EN",
                    "description": "VAT-liable for business activity",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "2008-08-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "FI",
                    "description": "Kiinteistön käyttöoikeuden luovuttamisesta",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "2008-08-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "SE",
                    "description": "För överlåtelse av nyttjanderätten till en fastighet",
                },
                {
                    "authority": 1,
                    "register": 6,
                    "status": 1,
                    "registrationDate": "2008-08-01",
                    "endDate": None,
                    "statusDate": "2008-07-21",
                    "language": "EN",
                    "description": "VAT-obliged for the transfer of rights to use immovable property",
                },
                {
                    "authority": 1,
                    "register": 7,
                    "status": 1,
                    "registrationDate": "1992-03-01",
                    "endDate": None,
                    "statusDate": "2001-03-30",
                    "language": "FI",
                    "description": "Rekisterissä",
                },
                {
                    "authority": 1,
                    "register": 7,
                    "status": 1,
                    "registrationDate": "1992-03-01",
                    "endDate": None,
                    "statusDate": "2001-03-30",
                    "language": "SE",
                    "description": "Registrerad",
                },
                {
                    "authority": 1,
                    "register": 7,
                    "status": 1,
                    "registrationDate": "1992-03-01",
                    "endDate": None,
                    "statusDate": "2001-03-30",
                    "language": "EN",
                    "description": "Registered",
                },
                {
                    "authority": 2,
                    "register": 1,
                    "status": 1,
                    "registrationDate": "1992-01-29",
                    "endDate": None,
                    "statusDate": "1992-01-29",
                    "language": "FI",
                    "description": "Rekisterissä",
                },
                {
                    "authority": 2,
                    "register": 1,
                    "status": 1,
                    "registrationDate": "1992-01-29",
                    "endDate": None,
                    "statusDate": "1992-01-29",
                    "language": "SE",
                    "description": "Registrerad",
                },
                {
                    "authority": 2,
                    "register": 1,
                    "status": 1,
                    "registrationDate": "1992-01-29",
                    "endDate": None,
                    "statusDate": "1992-01-29",
                    "language": "EN",
                    "description": "Registered",
                },
            ],
            "businessIdChanges": [],
        }
    ],
}

DUMMY_ASSOCIATION_DATA = {
    "id": "8c0c7a56-cb98-4c31-87ca-6f1853253987",
    "name": "SIPOON NUORISOMUSIIKINYHDISTYS SUSIMUSA ry",
    "business_id": "2686723-5",
    "company_form": "association",
    "bank_account_number": "FI2112345600000785",
    "street_address": "Vasaratie 4 A 3",
    "postcode": "65350",
    "city": "Vaasa",
}

DUMMY_YRTTI_RESPONSE = {
    "BasicInfoResponse": {
        "AssociationNameInfo": [
            {
                "AssociationNameType": "P",
                "AssociationName": "SIPOON NUORISOMUSIIKINYHDISTYS SUSIMUSA ry",
                "AssociationNameLanguage": "FI",
                "AssociationIndustry": None,
                "AssociationNameStatus": "R",
                "AssociationNameStartDate": "2007-02-27T00:00:00.000+00:00",
            },
            {
                "AssociationNameType": "P",
                "AssociationName": "SIPOON NUORISOMUSIIKINYHDISTYS SYSIMUSA ry",
                "AssociationNameLanguage": "FI",
                "AssociationIndustry": None,
                "AssociationNameStatus": "VE",
                "AssociationNameStartDate": None,
            },
        ],
        "BusinessId": "2686723-5",
        "RegistrationNumber": "195.883",
        "Domicile": "753",
        "DomicileStartDate": "2007-02-27T00:00:00.000+00:00",
        "AssociationRegistrationLanguage": "FI",
        "Address": [
            {
                "AddressTypeCode": "YRPO",
                "FormattedAddressFI": "Lamberg Matti Olavi\nKatajakalliontie 16\n01120 Västerskog\nSuomi",
                "FormattedAddressEN": "Lamberg Matti Olavi\nKatajakalliontie 16\n01120 Västerskog\nFinland",
                "FormattedAddressSE": "Lamberg Matti Olavi\nKatajakalliontie 16\n01120 Västerskog\nFinland",
                "CoAddress": None,
                "StreetName": "Lamberg Matti Olavi\nKatajakalliontie 16",
                "HouseNumber": None,
                "Stair": None,
                "FlatNumber": None,
                "FlatDivisionLetter": None,
                "PoBoxPrefix": None,
                "PoBox": None,
                "PostCode": "01120",
                "City": "Västerskog",
                "CountryCode": "FI",
                "AddressAbroad": None,
            }
        ],
        "ContactInfo": None,
        "RegistryDate": "2007-02-27T00:00:00.000+00:00",
        "LastRegistrationPeriod": "2007-02-27T00:00:00.000+00:00",
        "AssociationStatus": "R",
        "AssociationStatusDate": "2007-02-27T00:00:00.000+00:00",
        "AssociationSpecialCondition": None,
        "AssociationSpecialConditionDate": None,
        "EndRegistrationReason": None,
        "PurposeClassMain": "400",
        "PurposeClassSecondary": "400",
    },
    "faultCode": None,
    "faultString": None,
}
DUMMY_SERVICE_BUS_RESPONSE = {
    "GetCompanyResult": {
        "Company": {
            "BusinessId": "0877830-0",
            "Person": None,
            "TradeName": {
                "Name": "I. Haanpää Oy",
                "Validity": {
                    "StartDate": "1999-03-31T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "Source": {
                    "PrimaryCode": "TLAHDE",
                    "SecondaryCode": "1",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Patentti- ja rekisterihallitus",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Patent- och registerstyrelsen",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Finnish Patent and Registration Office",
                            },
                        ]
                    },
                },
                "Type": {
                    "PrimaryCode": "TLAJI",
                    "SecondaryCode": "1",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Toiminimi",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Firma",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Company name",
                            },
                        ]
                    },
                },
            },
            "AuxiliaryTradeNames": None,
            "ParallelTradeNames": None,
            "Bankruptcy": None,
            "CompanyReorganisation": None,
            "Liquidation": None,
            "BusinessInterruption": None,
            "LegalForm": {
                "CodeActive": True,
                "Validity": {
                    "StartDate": "1999-03-31T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "Source": {
                    "PrimaryCode": "TLAHDE",
                    "SecondaryCode": "1",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Patentti- ja rekisterihallitus",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Patent- och registerstyrelsen",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Finnish Patent and Registration Office",
                            },
                        ]
                    },
                },
                "Type": {
                    "PrimaryCode": "YRMU",
                    "SecondaryCode": "16",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Osakeyhtiö",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Aktiebolag",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Limited company",
                            },
                        ]
                    },
                },
            },
            "Municipality": {
                "CodeActive": True,
                "Validity": {
                    "StartDate": "2005-01-25T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "Source": {
                    "PrimaryCode": "TLAHDE",
                    "SecondaryCode": "1",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Patentti- ja rekisterihallitus",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Patent- och registerstyrelsen",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Finnish Patent and Registration Office",
                            },
                        ]
                    },
                },
                "Type": {
                    "PrimaryCode": "KUNTA",
                    "SecondaryCode": "905",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "VAASA",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "VASA",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "VAASA",
                            },
                        ]
                    },
                },
            },
            "BusinessLine": {
                "CodeActive": True,
                "Validity": {
                    "StartDate": "2007-12-31T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "Source": {
                    "PrimaryCode": "TLAHDE",
                    "SecondaryCode": "2",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Verohallinto",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Skatteförvaltningen",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Tax Administration",
                            },
                        ]
                    },
                },
                "Type": {
                    "PrimaryCode": "TOIMI3",
                    "SecondaryCode": "47594",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Taloustavaroiden vähittäiskauppa",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Specialiserad butikshandel med hushållsartiklar",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Retail sale of household articles",
                            },
                        ]
                    },
                },
            },
            "Language": {
                "CodeActive": True,
                "Validity": {
                    "StartDate": "1992-03-03T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "Source": {
                    "PrimaryCode": "TLAHDE",
                    "SecondaryCode": "2",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Verohallinto",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Skatteförvaltningen",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Tax Administration",
                            },
                        ]
                    },
                },
                "Type": {
                    "PrimaryCode": "KIELI",
                    "SecondaryCode": "1",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Suomi",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Suomi",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Finnish",
                            },
                        ]
                    },
                },
            },
            "BusinessActivity": None,
            "CompanyStatus": {
                "Validity": {
                    "StartDate": "1992-03-03T00:00:00.000+00:00",
                    "EndDate": None,
                },
                "BusinessIdStatus": {
                    "PrimaryCode": "STATUS3",
                    "SecondaryCode": "2",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Voimassa",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Giltigt",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Valid",
                            },
                        ]
                    },
                },
                "Status": {
                    "PrimaryCode": "STATUS3",
                    "SecondaryCode": "2",
                    "Descriptions": {
                        "CodeDescription": [
                            {
                                "Language": "fi",
                                "Type": "Default",
                                "Description": "Voimassa",
                            },
                            {
                                "Language": "sv",
                                "Type": "Default",
                                "Description": "Giltigt",
                            },
                            {
                                "Language": "en",
                                "Type": "Default",
                                "Description": "Valid",
                            },
                        ]
                    },
                },
            },
            "PostalAddress": {
                "ForeignAddress": None,
                "DomesticAddress": {
                    "CareOf": "",
                    "Street": "Vasaratie",
                    "PostOfficeBox": "",
                    "BuildingNumber": "4",
                    "Entrance": "A",
                    "ApartmentNumber": "3",
                    "ApartmentIDSuffix": "",
                    "PostalCode": "65350",
                    "City": "VAASA",
                    "Language": {
                        "PrimaryCode": "KIELI3",
                        "SecondaryCode": "1",
                        "Descriptions": {
                            "CodeDescription": [
                                {
                                    "Language": "fi",
                                    "Type": "Default",
                                    "Description": "Suomi",
                                },
                                {
                                    "Language": "sv",
                                    "Type": "Default",
                                    "Description": "Finska",
                                },
                                {
                                    "Language": "en",
                                    "Type": "Default",
                                    "Description": "Finnish",
                                },
                            ]
                        },
                    },
                    "Type": {
                        "PrimaryCode": "OLAJI",
                        "SecondaryCode": "2",
                        "Descriptions": {
                            "CodeDescription": [
                                {
                                    "Language": "fi",
                                    "Type": "Default",
                                    "Description": "Postiosoite",
                                },
                                {
                                    "Language": "sv",
                                    "Type": "Default",
                                    "Description": "Postadress",
                                },
                                {
                                    "Language": "en",
                                    "Type": "Default",
                                    "Description": "Postal address",
                                },
                            ]
                        },
                    },
                    "PostalCodeActive": True,
                    "Validity": {
                        "StartDate": "2020-07-22T13:43:08.933+00:00",
                        "EndDate": None,
                    },
                },
                "NonstandardDomesticAddress": None,
            },
            "StreetAddress": None,
            "ContactDetails": {
                "ContactDetail": [
                    {
                        "Value": "",
                        "Validity": {
                            "StartDate": "2020-07-22T13:43:08.933+00:00",
                            "EndDate": None,
                        },
                        "Type": {
                            "PrimaryCode": "YLAJI",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Puhelin",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Telefon",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Telephone",
                                    },
                                ]
                            },
                        },
                    },
                    {
                        "Value": "",
                        "Validity": {
                            "StartDate": "2020-07-22T13:43:08.933+00:00",
                            "EndDate": None,
                        },
                        "Type": {
                            "PrimaryCode": "YLAJI",
                            "SecondaryCode": "2",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Faksi",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Fax",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Fax",
                                    },
                                ]
                            },
                        },
                    },
                    {
                        "Value": "jari.haanpaa@netikka.fi",
                        "Validity": {
                            "StartDate": "2020-07-22T13:43:08.933+00:00",
                            "EndDate": None,
                        },
                        "Type": {
                            "PrimaryCode": "YLAJI",
                            "SecondaryCode": "3",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Sähköposti",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "E-post",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Email",
                                    },
                                ]
                            },
                        },
                    },
                    {
                        "Value": "0400 665254",
                        "Validity": {
                            "StartDate": "2005-01-11T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                        "Type": {
                            "PrimaryCode": "YLAJI",
                            "SecondaryCode": "5",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Matkapuhelin",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Mobiltelefon",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Mobile phone",
                                    },
                                ]
                            },
                        },
                    },
                ]
            },
            "RegistrationsInForce": {
                "RegistryEntry": [
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "6",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Arvonlisäverovelvollisuus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Value added tax-liability",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "82",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Kiinteistön käyttöoikeuden luovuttamisesta",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "För överlåtelse av nyttjanderätten till en fastighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "VAT-obliged for the transfer of rights to"
                                        " use immovable property",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2008-07-21T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "2008-08-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "6",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Arvonlisäverovelvollisuus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Value added tax-liability",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "80",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Liiketoiminnasta arvonlisäverovelvollinen",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldig för rörelseverksamhet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "VAT-liable for business activity",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2008-07-21T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1994-06-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "7",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Työnantajarekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Arbetsgivarregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Employer register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "41",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2001-03-30T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-03-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Kaupparekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Handelsregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Trade register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "2",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Patentti- ja rekisterihallitus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Patent- och registerstyrelsen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Finnish Patent and Registration Office",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "1992-01-29T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-01-29T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "5",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Ennakkoperintärekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Förskottsuppbördsregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Prepayment register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "55",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2017-03-16T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1995-03-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "4",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinnon perustiedot",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningens basuppgifter",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2020-06-03T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-03-03T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                ]
            },
            "RegistrationHistory": {
                "RegistryEntry": [
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "6",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Arvonlisäverovelvollisuus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Value added tax-liability",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "82",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Kiinteistön käyttöoikeuden luovuttamisesta",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "För överlåtelse av nyttjanderätten till en fastighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "VAT-obliged for the transfer of rights to use"
                                        " immovable property",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2008-07-21T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "2008-08-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "6",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Arvonlisäverovelvollisuus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldighet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Value added tax-liability",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "80",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Liiketoiminnasta arvonlisäverovelvollinen",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Momsskyldig för rörelseverksamhet",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "VAT-liable for business activity",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2008-07-21T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1994-06-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "7",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Työnantajarekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Arbetsgivarregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Employer register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "41",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2001-03-30T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-03-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Kaupparekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Handelsregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Trade register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "2",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Patentti- ja rekisterihallitus",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Patent- och registerstyrelsen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Finnish Patent and Registration Office",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "1992-01-29T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-01-29T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "5",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Ennakkoperintärekisteri",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Förskottsuppbördsregistret",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Prepayment register",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "55",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2017-03-16T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1995-03-01T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                    {
                        "Registry": {
                            "PrimaryCode": "REK",
                            "SecondaryCode": "4",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinnon perustiedot",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningens basuppgifter",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistryCode": {
                            "PrimaryCode": "REK_KDI",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Rekisterissä",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Registrerad",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Registered",
                                    },
                                ]
                            },
                        },
                        "Authority": {
                            "PrimaryCode": "VIRANOM",
                            "SecondaryCode": "1",
                            "Descriptions": {
                                "CodeDescription": [
                                    {
                                        "Language": "fi",
                                        "Type": "Default",
                                        "Description": "Verohallinto",
                                    },
                                    {
                                        "Language": "sv",
                                        "Type": "Default",
                                        "Description": "Skatteförvaltningen",
                                    },
                                    {
                                        "Language": "en",
                                        "Type": "Default",
                                        "Description": "Tax Administration",
                                    },
                                ]
                            },
                        },
                        "RegistrationDate": "2020-06-03T00:00:00.000+00:00",
                        "Validity": {
                            "StartDate": "1992-03-03T00:00:00.000+00:00",
                            "EndDate": None,
                        },
                    },
                ]
            },
            "RegisteredInPrepaymentRegister": True,
            "NextRevisionDateOfPrepaymentRegister": None,
            "BusinessIdHistory": None,
            "InDebtAdjustment": None,
        }
    }
}
