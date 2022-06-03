import json
from functools import partial

import jsonpath_ng
import pytest

from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_not_found_content,
)


def get_jsonpath_matches(jsonpath_expression, json_data) -> list:
    """
    Get matching values from JSON data using JSONPath expression
    """
    return [
        match.value for match in jsonpath_ng.parse(jsonpath_expression).find(json_data)
    ]


def test_mock_vtj_person_id_query_not_found_content():
    result = mock_vtj_person_id_query_not_found_content()
    assert isinstance(result, str)
    json_data = json.loads(result)
    assert isinstance(json_data, dict)
    assert json_data == {
        "@xmlns": "http://xml.vrk.fi/ws/vtj/vtjkysely/1",
        "#text": "Hakuperusteella ei löydy tietoja vtj:stä",
    }


@pytest.mark.parametrize("first_name", ["Testietunimi", "Jan-Erik Ögge"])
@pytest.mark.parametrize("last_name", ["Testisukunimi", "Ekström-O'Brian"])
@pytest.mark.parametrize("social_security_number", ["111111-111C", "121212A899H"])
@pytest.mark.parametrize("is_alive", [False, True])
@pytest.mark.parametrize("is_home_municipality_helsinki", [False, True])
def test_mock_vtj_person_id_query_found_content(
    first_name,
    last_name,
    social_security_number,
    is_alive,
    is_home_municipality_helsinki,
):
    result = mock_vtj_person_id_query_found_content(
        first_name=first_name,
        last_name=last_name,
        social_security_number=social_security_number,
        is_alive=is_alive,
        is_home_municipality_helsinki=is_home_municipality_helsinki,
    )
    assert isinstance(result, str)
    json_data = json.loads(result)
    assert isinstance(json_data, dict)

    _matches = partial(get_jsonpath_matches, json_data=json_data)
    assert _matches("$.Henkilo.Henkilotunnus") == [
        {"@voimassaolokoodi": "1", "#text": social_security_number}
    ]
    assert _matches("$.Henkilo.NykyisetEtunimet.Etunimet") == [first_name]
    assert _matches("$.Henkilo.NykyinenSukunimi.Sukunimi") == [last_name]

    if is_alive:
        assert _matches("$.Henkilo.Kuolintiedot.Kuollut") == [None]
        assert _matches("$.Henkilo.Kuolintiedot.Kuolinpvm") == [None]
    else:
        assert _matches("$.Henkilo.Kuolintiedot.Kuollut") == ["1"]
        assert _matches("$.Henkilo.Kuolintiedot.Kuolinpvm") == ["19000101"]

    if is_home_municipality_helsinki:
        assert _matches("$.Henkilo.Kotikunta.KuntaS") == ["Helsinki"]
        assert _matches("$.Henkilo.Kotikunta.KuntaR") == ["Helsingfors"]
        assert _matches("$.Henkilo.Kotikunta.Kuntanumero") == ["91"]
    else:
        assert _matches("$.Henkilo.Kotikunta.KuntaS") == ["Utsjoki"]
        assert _matches("$.Henkilo.Kotikunta.KuntaR") == ["Utsjoki"]
        assert _matches("$.Henkilo.Kotikunta.Kuntanumero") == ["890"]
