from datetime import date

from django.core.management import call_command

from applications.models import ArchivalApplication
from companies.models import Company


class ImportArchivalApplicationsTestUtility:
    test_data = [
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
    ]

    @staticmethod
    def create_companies_for_archival_applications():
        for app in ImportArchivalApplicationsTestUtility.test_data:
            company = Company(name=app[5], business_id=app[6], company_form_code=16)
            company.save()


def test_decision_proposal_drafting():
    assert ArchivalApplication.objects.all().count() == 0
    ImportArchivalApplicationsTestUtility.create_companies_for_archival_applications()

    call_command("import_archival_applications", filename="test.xlsx", production=True)
    assert ArchivalApplication.objects.all().count() == len(
        ImportArchivalApplicationsTestUtility.test_data
    )
    assert Company.objects.all().count() == 3
