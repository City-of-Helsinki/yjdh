import pytest
from django.core.management import call_command

from applications.api.v1.search_views import SearchPattern
from applications.models import ArchivalApplication
from applications.tests.test_command_import_archival_applications import (
    ImportArchivalApplicationsTestUtility,
)


def setup_application_data(application, archived):
    # Setup some bogus data
    application.company.company_name = "Pitkänen Ruuskanen Oyj"
    application.company.save()

    application.employee.social_security_number = "040337W935P"
    application.employee.encrypted_social_security_number = "040337W935P"
    application.employee.first_name = "Mikro Tietokoneinen"
    application.employee.last_name = "Matriisi-Artikkeli"
    application.employee.save()

    application.application_number = 125010
    application.ahjo_case_id = "HEL 2024-000123"
    application.archived = archived
    application.save()

    return application


@pytest.mark.parametrize(
    "q, detected_pattern",
    [
        ("HEL 2024-000123", SearchPattern.AHJO),
        ("12345", SearchPattern.NUMBERS),
        ("0877830-1", SearchPattern.NUMBERS),
        ("040337W935P", SearchPattern.SSN),
        ("No result Oy", SearchPattern.COMPANY),
        (
            "No result Oy nimi:nobody",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
        ),
    ],
)
def test_search_with_no_results(handler_api_client, q, detected_pattern):
    response = handler_api_client.get(f"/v1/search/?q={q}")
    data = response.json()
    assert data["detected_pattern"] == detected_pattern
    assert len(data["matches"]) == 0

    assert response.status_code == 200


def test_search_with_no_search_query(handler_api_client):
    response = handler_api_client.get("/v1/search/")
    assert response.status_code == 400


@pytest.mark.parametrize(
    "q, detected_pattern, archived",
    [
        ("12501", SearchPattern.NUMBERS, False),
        ("HEL 2024-000", SearchPattern.AHJO, False),
        ("0877830", SearchPattern.NUMBERS, False),
        ("040337W935P", SearchPattern.SSN, False),
        ("Ruskanen As Oy", SearchPattern.COMPANY, False),
        (
            "Pitkäne ruskane Ky nimi:matriizi-article",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}",
            False,
        ),
        (
            "Pitkäne ruskane Ky nimi:mikro",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}-fallback",
            False,
        ),
        (
            "nimi:micro tietsikaneinen",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}",
            False,
        ),
        (
            "nimi:mikro",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
            False,
        ),
    ],
)
def test_search_with_results(
    handler_api_client, q, detected_pattern, archived, application
):
    application = setup_application_data(application, archived)
    response = handler_api_client.get(f"/v1/search/?q={q}")
    data = response.json()

    assert response.status_code == 200
    assert len(data["matches"]) > 0
    assert data["detected_pattern"] == detected_pattern
    assert data["matches"][0]["application_number"] == application.application_number


@pytest.mark.parametrize(
    "q, detected_pattern",
    [
        ("R001", SearchPattern.ARCHIVAL),
        ("Pitkänen Ruuskanen Oyj", SearchPattern.COMPANY),
    ],
)
def test_search_archival_application(handler_api_client, q, detected_pattern):
    ImportArchivalApplicationsTestUtility.create_companies_for_archival_applications()
    call_command("import_archival_applications", filename="test.xlsx", production=True)

    # Make sure import is ok
    archival_applications = ArchivalApplication.objects.all()
    assert archival_applications.count() == 2

    searched_app = ArchivalApplication.objects.filter(application_number=q).first()
    response = handler_api_client.get(f"/v1/search/?q={q}&archival=1")
    assert response.status_code == 200

    data = response.json()
    assert data["detected_pattern"] == detected_pattern

    for match in data["matches"]:
        assert match["employee"]["first_name"] == searched_app.employee_first_name
        assert match["employee"]["last_name"] == searched_app.employee_last_name
        assert match["company"]["business_id"] == searched_app.company.business_id
        assert match["company"]["name"] == searched_app.company.name
