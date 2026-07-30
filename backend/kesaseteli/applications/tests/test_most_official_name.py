# Tests related to the most official name resolution logic in
# YouthApplication and EmployerSummerVoucher models.
import json

import pytest

from applications.models import YouthApplication
from applications.services import VTJService
from applications.tests.data.mock_vtj import mock_vtj_person_id_query_found_content
from common.tests.factories import (
    EmployerSummerVoucherFactory,
    YouthApplicationFactory,
)


def vtj_json_content(first_name: str, last_name: str) -> str:
    return mock_vtj_person_id_query_found_content(
        first_name=first_name,
        last_name=last_name,
        social_security_number="010101A0101",
        is_alive=True,
        is_home_municipality_helsinki=True,
    )


@pytest.mark.parametrize(
    "vtj_json,expected",
    [
        (None, ""),
        ({}, ""),
        ({"Henkilo": {}}, ""),
        ({"Henkilo": {"NykyisetEtunimet": {}}}, ""),
        ({"Henkilo": {"NykyisetEtunimet": {"Etunimet": None}}}, ""),
        ({"Henkilo": {"NykyisetEtunimet": {"Etunimet": ""}}}, ""),
        ({"Henkilo": {"NykyisetEtunimet": {"Etunimet": "Anna Maria"}}}, "Anna Maria"),
    ],
)
def test_vtj_service_get_first_names(vtj_json, expected):
    assert VTJService.get_first_names(vtj_json) == expected


def test_vtj_service_get_first_names_from_mocked_vtj_response():
    vtj_json = json.loads(vtj_json_content(first_name="Anna Maria", last_name="Aalto"))
    assert VTJService.get_first_names(vtj_json) == "Anna Maria"


@pytest.mark.parametrize(
    "first_name,last_name,expected",
    [
        ("Anna", "Aalto", "Anna Aalto"),
        ("Anna Maria", "Aalto", "Anna Maria Aalto"),
        ("  Anna  ", "  Aalto  ", "Anna Aalto"),
        ("Anna", "", "Anna"),
        ("", "Aalto", "Aalto"),
        ("", "", ""),
        ("   ", "   ", ""),
    ],
)
def test_resolve_full_name(first_name, last_name, expected):
    assert (
        YouthApplication.resolve_full_name(first_name=first_name, last_name=last_name)
        == expected
    )


@pytest.mark.parametrize(
    "vtj_name,non_vtj_name,expected",
    [
        ("Aalto", "Virtanen", "Aalto"),
        ("", "Virtanen", "Virtanen"),
        (" ", "Virtanen", "Virtanen"),
        ("\n", "Virtanen", "Virtanen"),
        ("  \t\n   \n\n ", "Virtanen", "Virtanen"),
        ("Aalto", "", "Aalto"),
        ("", "", ""),
    ],
)
def test_resolve_most_official_name(vtj_name, non_vtj_name, expected):
    assert (
        YouthApplication.resolve_most_official_name(
            vtj_name=vtj_name, non_vtj_name=non_vtj_name
        )
        == expected
    )


def test_most_official_names_prefer_vtj_names():
    app = YouthApplicationFactory.build(
        first_name="Anni",
        last_name="Virtanen",
        encrypted_original_vtj_json=vtj_json_content(
            first_name="Anna Maria", last_name="Aalto"
        ),
        encrypted_handler_vtj_json=None,
    )
    assert app.vtj_first_name == "Anna Maria"
    assert app.vtj_last_name == "Aalto"
    assert app.most_official_first_name == "Anna Maria"
    assert app.most_official_last_name == "Aalto"
    assert app.most_official_name == "Anna Maria Aalto"
    assert app.name == "Anni Virtanen"


def test_most_official_names_fall_back_to_non_vtj_names_without_vtj_data():
    app = YouthApplicationFactory.build(
        first_name="Anni",
        last_name="Virtanen",
        encrypted_original_vtj_json=None,
        encrypted_handler_vtj_json=None,
    )
    assert app.vtj_first_name == ""
    assert app.vtj_last_name == ""
    assert app.most_official_first_name == "Anni"
    assert app.most_official_last_name == "Virtanen"
    assert app.most_official_name == "Anni Virtanen"
    assert app.name == "Anni Virtanen"


@pytest.mark.parametrize(
    "vtj_first_name,vtj_last_name,expected_most_official_name",
    [
        ("Anna Maria", "Aalto", "Anna Maria Aalto"),
        ("Anna Maria", "", "Anna Maria Virtanen"),
        ("", "Aalto", "Anni Aalto"),
        ("", "", "Anni Virtanen"),
    ],
)
def test_most_official_name_with_partial_vtj_names(
    vtj_first_name, vtj_last_name, expected_most_official_name
):
    app = YouthApplicationFactory.build(
        first_name="Anni",
        last_name="Virtanen",
        encrypted_original_vtj_json=vtj_json_content(
            first_name=vtj_first_name, last_name=vtj_last_name
        ),
        encrypted_handler_vtj_json=None,
    )
    assert app.most_official_name == expected_most_official_name


def test_most_official_names_use_handler_vtj_data_over_original_vtj_data():
    app = YouthApplicationFactory.build(
        first_name="Anni",
        last_name="Virtanen",
        encrypted_original_vtj_json=vtj_json_content(
            first_name="Anna Maria", last_name="Aalto"
        ),
        encrypted_handler_vtj_json=vtj_json_content(
            first_name="Anna Maria Kristiina", last_name="Aaltonen"
        ),
    )
    assert app.most_official_first_name == "Anna Maria Kristiina"
    assert app.most_official_last_name == "Aaltonen"
    assert app.most_official_name == "Anna Maria Kristiina Aaltonen"


@pytest.mark.django_db
def test_employer_summer_voucher_employee_name_uses_most_official_name():
    employer_summer_voucher = EmployerSummerVoucherFactory()
    youth_application = employer_summer_voucher.youth_summer_voucher.youth_application
    youth_application.first_name = "Anni"
    youth_application.last_name = "Virtanen"
    youth_application.encrypted_original_vtj_json = vtj_json_content(
        first_name="Anna Maria", last_name="Aalto"
    )
    youth_application.encrypted_handler_vtj_json = None
    youth_application.save()

    assert employer_summer_voucher.employee_name == "Anna Maria Aalto"


@pytest.mark.django_db
def test_employer_summer_voucher_employee_name_without_youth_summer_voucher():
    employer_summer_voucher = EmployerSummerVoucherFactory(youth_summer_voucher=None)
    assert employer_summer_voucher.employee_name == ""
