import json
from collections import namedtuple

Municipality = namedtuple(
    "Municipality", ["number", "name_fi", "name_sv", "example_postcode"]
)


# Some Finnish municipalities from open data at
# https://www.avoindata.fi/data/fi/dataset/kuntaluettelo/resource/cb261c69-9883-486b-9e41-e0560471df86
HELSINKI_MUNICIPALITY = Municipality(91, "Helsinki", "Helsingfors", "00100")
OTHER_MUNICIPALITY = Municipality(890, "Utsjoki", "Utsjoki", "99990")


def mock_vtj_person_id_query_not_found_content() -> str:
    """
    Mock VTJ person's ID query's (i.e. henkilön tunnuskysely in Finnish) result content
    when no data is found.

    Endpoint: /api/HenkilonTunnuskysely
    """
    return json.dumps(
        {
            "@xmlns": "http://xml.vrk.fi/ws/vtj/vtjkysely/1",
            "#text": "Hakuperusteella ei löydy tietoja vtj:stä",
        }
    )


def mock_vtj_person_id_query_found_content(
    first_name: str,
    last_name: str,
    social_security_number: str,
    is_alive: bool,
    is_home_municipality_helsinki: bool,
) -> str:
    """
    Mock VTJ person's ID query's (i.e. henkilön tunnuskysely in Finnish) result content
    when data is found.

    Endpoint: /api/HenkilonTunnuskysely
    """
    municipality: Municipality = (
        HELSINKI_MUNICIPALITY if is_home_municipality_helsinki else OTHER_MUNICIPALITY
    )

    # Mock data based on VTJ test data retrieved using test social security numbers
    # 010170-960F (An alive person case) and 020365-999P (A dead person case),
    # see https://www.kwork.me/suomifi-testitunnukset/
    return json.dumps(
        {
            "@xmlns": "http://xml.vrk.fi/schema/vtjkysely",
            "@xmlns:vtj": "http://xml.vrk.fi/schema/vtj/henkilotiedot/1",
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@sanomatunnus": "PERUSSANOMA 1",
            "@tietojenPoimintaaika": "20220407090800",
            "@versio": "1.0",
            "@xsi:schemaLocation": "http://xml.vrk.fi/schema/vtjkysely PERUSSANOMA 1.xsd",
            "Asiakasinfo": {
                "InfoS": "07.04.2022 09:08",
                "InfoR": "07.04.2022 09:08",
                "InfoE": "07.04.2022 09:08",
            },
            "Paluukoodi": {"@koodi": "0000", "#text": "Haku onnistui"},
            "Hakuperusteet": {
                "Henkilotunnus": {
                    "@hakuperustePaluukoodi": "1",
                    "@hakuperusteTekstiE": "Found",
                    "@hakuperusteTekstiR": "Hittades",
                    "@hakuperusteTekstiS": "Löytyi",
                    "#text": social_security_number,
                }
            },
            "Henkilo": {
                "Henkilotunnus": {
                    "@voimassaolokoodi": "1",
                    "#text": social_security_number,
                },
                "NykyinenSukunimi": {
                    "Sukunimi": last_name,
                },
                "NykyisetEtunimet": {
                    "Etunimet": first_name,
                },
                "VakinainenKotimainenLahiosoite": {
                    "LahiosoiteS": "Testikatu 12 C 3",
                    "LahiosoiteR": "Testgatan 12 C 3",
                    "Postinumero": municipality.example_postcode,
                    "PostitoimipaikkaS": municipality.name_fi.upper(),
                    "PostitoimipaikkaR": municipality.name_sv.upper(),
                    "AsuminenAlkupvm": "19870123",
                    "AsuminenLoppupvm": None,
                },
                "VakinainenAsuinpaikka": {"Asuinpaikantunnus": "90000130991J052 "},
                "VakinainenUlkomainenLahiosoite": {
                    "UlkomainenLahiosoite": None,
                    "UlkomainenPaikkakuntaJaValtioS": None,
                    "UlkomainenPaikkakuntaJaValtioR": None,
                    "UlkomainenPaikkakuntaJaValtioSelvakielinen": None,
                    "Valtiokoodi3": None,
                    "AsuminenAlkupvm": None,
                    "AsuminenLoppupvm": None,
                },
                "TilapainenKotimainenLahiosoite": {
                    "LahiosoiteS": "Testikatu 12 C 3",
                    "LahiosoiteR": "Testgatan 12 C 3",
                    "Postinumero": municipality.example_postcode,
                    "PostitoimipaikkaS": municipality.name_fi.upper(),
                    "PostitoimipaikkaR": municipality.name_sv.upper(),
                    "AsuminenAlkupvm": "20060729",
                    "AsuminenLoppupvm": None,
                },
                "TilapainenUlkomainenLahiosoite": {
                    "UlkomainenLahiosoite": None,
                    "UlkomainenPaikkakuntaJaValtioS": None,
                    "UlkomainenPaikkakuntaJaValtioR": None,
                    "UlkomainenPaikkakuntaJaValtioSelvakielinen": None,
                    "Valtiokoodi3": None,
                    "AsuminenAlkupvm": None,
                    "AsuminenLoppupvm": None,
                },
                "KotimainenPostiosoite": {
                    "PostiosoiteS": None,
                    "PostiosoiteR": None,
                    "Postinumero": None,
                    "PostitoimipaikkaS": None,
                    "PostitoimipaikkaR": None,
                    "PostiosoiteAlkupvm": None,
                    "PostiosoiteLoppupvm": None,
                },
                "UlkomainenPostiosoite": {
                    "UlkomainenLahiosoite": None,
                    "UlkomainenPaikkakunta": None,
                    "Valtiokoodi3": None,
                    "ValtioS": None,
                    "ValtioR": None,
                    "ValtioSelvakielinen": None,
                    "PostiosoiteAlkupvm": None,
                    "PostiosoiteLoppupvm": None,
                },
                "Kotikunta": {
                    "Kuntanumero": str(municipality.number),
                    "KuntaS": municipality.name_fi.capitalize(),
                    "KuntaR": municipality.name_sv.capitalize(),
                    "KuntasuhdeAlkupvm": "19840301",
                },
                "Kuolintiedot": {
                    "Kuollut": None if is_alive else "1",
                    "Kuolinpvm": None if is_alive else "19000101",  # YYYYMMDD
                },
                "Kuolleeksijulistamistiedot": {"Kuolleeksijulistamispvm": None},
                "Aidinkieli": {
                    "Kielikoodi": "fi",
                    "KieliS": "suomi",
                    "KieliR": "finska",
                    "KieliSelvakielinen": None,
                },
                "Sukupuoli": {
                    "Sukupuolikoodi": "2",
                    "SukupuoliS": "Nainen",
                    "SukupuoliR": "Kvinna",
                },
            },
        }
    )
