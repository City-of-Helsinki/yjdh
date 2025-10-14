from datetime import date

import pytest
from django.core.management import call_command

from applications.models import ArchivalApplication
from companies.models import Company


class ImportArchivalApplicationsTestUtility:
    test_data = {
        "values": [
            [
                "SV",
                "SSP",
                date.today(),
                "FI89 8792 4660 0052 54",
                "R001",
                "ATK Testi Oy",
                "5553844-9",
                "Testinen",
                "Henna",
                date.today(),
                date.today(),
                "Palkan Helsinki-lisä oppisopimukseen",
                800,
                9600.0,
                12.0,
                0.4,
                "OPSO",
                None,
                1992,
                0,
                9600.0,
                1266.6,
                date.today(),
                None,
                None,
                None,
                "Pirjo Palkkatuki",
                "pirjo.palkkatuki@example.com",
                "040-7654321",
                "Tekninen Kokeilukatu 10",
                390,
                "Helsinki",
                "Kyllä",
                date.today(),
                "Tiimipäällikkö",
                "§3",
                date.today(),
                date.today(),
                date.today(),
            ],
            [
                "SV",
                "SSP",
                date.today(),
                "FI91 1428 5870 0017 41",
                "R002",
                "Micro-Manager Ky",
                "7377448-8",
                "Testilä",
                "Pekka",
                date.today(),
                date.today(),
                "Työllistämisen Helsinki-lisä",
                500,
                4666.666666666628,
                9.333333333333334,
                0.5,
                None,
                None,
                1980,
                0,
                4666.666666666628,
                2239.97,
                date.today(),
                "SSP",
                date.today(),
                "Pom-pom Ask",
                "Petri Palkkatuki",
                "petri.palkkatuki@example.com",
                "050-1234567",
                "Vanha Testiläntie 8",
                700,
                "Helsinki",
                "Kyllä",
                date.today(),
                "Tiimipäällikkö",
                "§3",
                date.today(),
                date.today(),
                date.today(),
            ],
        ],
        "columns": [
            "Tarkastettu",
            " Miten Saapunut ",
            "Saapumispmv",
            "pankkitili",
            "Hakemusnro",
            "hakija",
            "y-tunnus",
            "työllistetyn sukunimi",
            "työllistetyn etunimi",
            "alkaa",
            "loppuu",
            "tukimuoto",
            "tuki/kk",
            "tuki yht.",
            "kk",
            "VAKU/palkkatuki",
            "OPSO",
            "miten kohderyhmää?",
            "synt. vuosi",
            "1/2",
            "2/2",
            "palkka €",
            "otettu käsittelyyn",
            "lisätieto saapumistapa",
            "lisätietojen saapumis pvm",
            "lisätietojen lähettäjä",
            "vireillepanija/yhteyshenkilö",
            "sähköposti",
            "puhelin",
            "katuosoite",
            "postinumero",
            "postitoimipaikka",
            "suostumus sähköiseen asiointiin",
            "lähetetty Ahjossa pvm",
            "Päättäjä",
            "Pykälä",
            "Päätöspäivä",
            "siirretty robotille pvm",
            "tarkastettu P2P:ssä pvm",
        ],
    }

    @staticmethod
    def create_companies_for_archival_applications():
        for row in ImportArchivalApplicationsTestUtility.test_data["values"]:
            company = Company(name=row[5], business_id=row[6], company_form_code=16)
            company.save()


@pytest.mark.django_db
def test_import_archival_applications():
    assert ArchivalApplication.objects.all().count() == 0
    ImportArchivalApplicationsTestUtility.create_companies_for_archival_applications()

    call_command("import_archival_applications", filename="test.xlsx", production=True)
    assert ArchivalApplication.objects.all().count() == len(
        ImportArchivalApplicationsTestUtility.test_data["values"]
    )
    assert Company.objects.all().count() == 2

    # Assert the values of the retrieved archival application
    app = ArchivalApplication.objects.filter(application_number="R001").first()
    assert app.application_number == "R001"
    assert app.company.name == "ATK Testi Oy"
    assert app.company.business_id == "5553844-9"
    assert app.employee_last_name == "Testinen"
    assert app.employee_first_name == "Henna"
    assert app.months_total == "12.0"
    assert app.year_of_birth == "1992"
