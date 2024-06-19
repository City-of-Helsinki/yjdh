from datetime import datetime
from urllib.parse import urlencode

import pytest
from dateutil.relativedelta import relativedelta
from django.core.management import call_command
from rest_framework.reverse import reverse

from applications.api.v1.search_views import SearchPattern, SubsidyInEffect
from applications.enums import ApplicationBatchStatus
from applications.models import ArchivalApplication
from applications.tests.factories import ApplicationBatchFactory
from applications.tests.test_command_import_archival_applications import (
    ImportArchivalApplicationsTestUtility,
)
from calculator.models import Calculation

api_url = reverse(
    "search_applications",
)


def setup_application_data(application, archived):
    application.company.name = "Pitkänen Ruuskanen Oyj"
    application.company.save()

    application.employee.social_security_number = "040337W935P"
    application.employee.first_name = "Mikro Tietokoneinen"
    application.employee.last_name = "Matriisi-Artikkeli"
    application.employee.save()

    application.batch = ApplicationBatchFactory(status=ApplicationBatchStatus.COMPLETED)
    application.batch.save()

    application.application_number = 125010
    application.ahjo_case_id = "HEL 2024-000123"
    if archived == 1:
        application.archived = True
    application.save()

    return application


@pytest.mark.parametrize(
    "q, detected_pattern",
    [
        ("HEL 2024-123456", SearchPattern.AHJO),
        ("54321", SearchPattern.NUMBERS),
        ("0877830-3", SearchPattern.NUMBERS),
        ("010101W123P", SearchPattern.SSN),
        ("No result Oy", SearchPattern.COMPANY),
        (
            "No result Oy nimi:nobody",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
        ),
    ],
)
def test_search_with_no_results(handler_api_client, q, detected_pattern, application):
    application = setup_application_data(application, False)
    params = urlencode(
        {
            "q": q,
        },
    )
    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()
    assert data["detected_pattern"] == detected_pattern
    assert len(data["matches"]) == 0

    assert response.status_code == 200


def test_search_with_no_search_query(handler_api_client):
    response = handler_api_client.get(reverse("search_applications"))
    assert response.status_code == 400


@pytest.mark.parametrize(
    "q, detected_pattern, archived",
    [
        ("12501", SearchPattern.NUMBERS, 1),
        ("HEL 2024-000", SearchPattern.AHJO, 1),
        ("0877830", SearchPattern.NUMBERS, 1),
        ("040337W935P", SearchPattern.SSN, 1),
        ("Pitkäne As Oy", SearchPattern.COMPANY, 1),
        (
            "Pitkäne ruskane Ky nimi:matriizi-article",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}",
            1,
        ),
        (
            "Pitkäne ruskane Ky nimi:mikro",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}-fallback",
            1,
        ),
        (
            "nimi:micro tietsikaneinen",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}",
            1,
        ),
        (
            "nimi:mikro",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
            1,
        ),
    ],
)
def test_search_with_results(
    handler_api_client, q, detected_pattern, archived, application
):
    application = setup_application_data(application, archived)

    params = urlencode(
        {
            "q": q,
            "archived": archived,
        },
    )
    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()

    assert response.status_code == 200
    assert len(data["matches"]) > 0
    assert data["detected_pattern"] == detected_pattern
    assert data["matches"][0]["application_number"] == application.application_number


@pytest.mark.parametrize(
    "q, detected_pattern, subsidy_in_effect, archived",
    [
        ("12501", SearchPattern.NUMBERS, SubsidyInEffect.NOW, 1),
        ("HEL 2024-000", SearchPattern.AHJO, SubsidyInEffect.NOW, 1),
        ("0877830", SearchPattern.NUMBERS, SubsidyInEffect.NOW, 1),
        ("040337W935P", SearchPattern.SSN, SubsidyInEffect.NOW, 1),
        ("Pitkäne As Oy", SearchPattern.COMPANY, SubsidyInEffect.NOW, 1),
        (
            "Pitkäne ruskane Ky nimi:matriizi-article",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}",
            SubsidyInEffect.NOW,
            1,
        ),
        (
            "Pitkäne ruskane Ky nimi:mikro",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}-fallback",
            SubsidyInEffect.NOW,
            1,
        ),
        (
            "nimi:micro tietsikaneinen",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}",
            SubsidyInEffect.NOW,
            1,
        ),
        (
            "nimi:mikro",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
            SubsidyInEffect.NOW,
            1,
        ),
    ],
)
def test_search_filter_subsidy_in_effect(
    handler_api_client, q, detected_pattern, archived, application, subsidy_in_effect
):
    application = setup_application_data(application, archived)
    application.calculation = Calculation(
        application=application,
        monthly_pay=1234,
        vacation_money=123,
        other_expenses=321,
        start_date=datetime.now() - relativedelta(days=30),
        end_date=datetime.now(),
        state_aid_max_percentage=50,
        calculated_benefit_amount=0,
        override_monthly_benefit_amount=None,
    )
    application.calculation.save()

    params = urlencode(
        {
            "q": q,
            "archived": archived,
            "subsidy_in_effect": subsidy_in_effect,
        },
    )
    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()

    assert response.status_code == 200
    assert len(data["matches"]) > 0
    assert data["detected_pattern"] == detected_pattern
    assert data["matches"][0]["application_number"] == application.application_number

    # Subsidy end date is in the past
    application.calculation.end_date = datetime.now() - relativedelta(days=1)
    application.calculation.save()

    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()

    assert response.status_code == 200
    assert len(data["matches"]) == 0

    # Subsidy start / end date is in the future
    application.calculation.end_date = datetime.now() + relativedelta(days=31)
    application.calculation.start_date = datetime.now() + relativedelta(days=1)
    application.calculation.save()

    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()

    assert response.status_code == 200
    assert len(data["matches"]) == 0


@pytest.mark.parametrize(
    "q, detected_pattern, years_since_decision, archived",
    [
        ("12501", SearchPattern.NUMBERS, 3, 1),
        ("HEL 2024-000", SearchPattern.AHJO, 3, 1),
        ("0877830", SearchPattern.NUMBERS, 3, 1),
        ("040337W935P", SearchPattern.SSN, 3, 1),
        ("Pitkäne As Oy", SearchPattern.COMPANY, 3, 1),
        (
            "Pitkäne ruskane Ky nimi:matriizi-article",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}",
            3,
            1,
        ),
        (
            "Pitkäne ruskane Ky nimi:mikro",
            f"{SearchPattern.COMPANY} {SearchPattern.IN_MEMORY}-fallback",
            3,
            1,
        ),
        (
            "nimi:micro tietsikaneinen",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}",
            3,
            1,
        ),
        (
            "nimi:mikro",
            f"{SearchPattern.ALL} {SearchPattern.IN_MEMORY}-fallback",
            3,
            1,
        ),
    ],
)
def test_search_filter_years_since_decision(
    handler_api_client, q, detected_pattern, archived, application, years_since_decision
):
    application = setup_application_data(application, archived)
    application.batch.decision_date = datetime.now() - relativedelta(years=3)
    application.batch.save()

    params = urlencode(
        {
            "q": q,
            "archived": archived,
            "years_since_decision": years_since_decision,
        }
    )

    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()
    assert response.status_code == 200
    assert len(data["matches"]) > 0
    assert data["detected_pattern"] == detected_pattern
    assert data["matches"][0]["application_number"] == application.application_number

    # Decision date is one day over three years
    application.batch.decision_date = datetime.now() - relativedelta(years=3, days=1)
    application.batch.save()
    response = handler_api_client.get(f"{api_url}?{params}")
    data = response.json()
    assert response.status_code == 200
    assert len(data["matches"]) == 0


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

    params = urlencode(
        {
            "q": q,
            "archival": 1,
        },
    )
    response = handler_api_client.get(f"{api_url}?{params}")
    assert response.status_code == 200
    data = response.json()
    assert data["detected_pattern"] == detected_pattern

    for match in data["matches"]:
        assert match["employee"]["first_name"] == searched_app.employee_first_name
        assert match["employee"]["last_name"] == searched_app.employee_last_name
        assert match["company"]["business_id"] == searched_app.company.business_id
        assert match["company"]["name"] == searched_app.company.name
