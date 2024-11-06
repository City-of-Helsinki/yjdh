import decimal
from datetime import datetime, timedelta, timezone

import pytest
from django.urls import reverse

from applications.enums import ApplicationBatchStatus, ApplicationTalpaStatus
from applications.tests.common import (
    check_csv_cell_list_lines_generator,
    check_csv_string_lines_generator,
)
from applications.tests.conftest import *  # noqa
from applications.tests.conftest import split_lines_at_semicolon
from calculator.enums import InstalmentStatus
from calculator.models import Instalment
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from shared.audit_log.models import AuditLogEntry


def test_talpa_lines(applications_csv_service):
    csv_lines = list(applications_csv_service.get_csv_cell_list_lines_generator())
    assert applications_csv_service.applications.count() == 2
    assert len(csv_lines) == 3
    assert csv_lines[0][0] == "Hakemusnumero"
    assert (
        csv_lines[1][0] == applications_csv_service.applications[0].application_number
    )
    assert (
        csv_lines[2][0] == applications_csv_service.applications[1].application_number
    )


def test_talpa_csv_cell_list_lines_generator(pruned_applications_csv_service):
    check_csv_cell_list_lines_generator(
        pruned_applications_csv_service, expected_row_count_with_header=3
    )


def test_talpa_csv_string_lines_generator(pruned_applications_csv_service):
    check_csv_string_lines_generator(
        pruned_applications_csv_service, expected_row_count_with_header=3
    )


def test_talpa_csv_output(pruned_applications_csv_service_with_one_application):
    csv_lines = split_lines_at_semicolon(
        pruned_applications_csv_service_with_one_application.get_csv_string()
    )
    # BOM at the beginning of the file
    assert csv_lines[0][0] == '\ufeff"Hakemusnumero"'
    csv_columns = iter(pruned_applications_csv_service_with_one_application.CSV_COLUMNS)
    next(csv_columns, None)  # Skip the first element

    for idx, col in enumerate(csv_columns, start=1):
        assert csv_lines[0][idx] == f'"{col.heading}"'

    assert (
        int(csv_lines[1][0])
        == pruned_applications_csv_service_with_one_application.applications.first().application_number
    )


def test_talpa_csv_non_ascii_characters(
    pruned_applications_csv_service_with_one_application,
):
    application = (
        pruned_applications_csv_service_with_one_application.applications.first()
    )
    application.company_name = "test äöÄÖtest"
    application.save()
    csv_lines = split_lines_at_semicolon(
        pruned_applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][3] == '"test äöÄÖtest"'  # string is quoted


def test_talpa_csv_delimiter(pruned_applications_csv_service_with_one_application):
    application = (
        pruned_applications_csv_service_with_one_application.applications.first()
    )
    application.company_name = "test;12"
    application.save()
    assert (
        ';"test;12";'
        in pruned_applications_csv_service_with_one_application.get_csv_string()
    )


def test_talpa_csv_decimal(pruned_applications_csv_service_with_one_application):
    application = (
        pruned_applications_csv_service_with_one_application.applications.first()
    )
    application.calculation.calculated_benefit_amount = decimal.Decimal("123.45")
    application.calculation.save()
    csv_lines = split_lines_at_semicolon(
        pruned_applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][8] == "123.45"


def test_talpa_csv_date(pruned_applications_csv_service_with_one_application):
    application = (
        pruned_applications_csv_service_with_one_application.get_applications().first()
    )
    now = datetime.now(timezone.utc)
    application.batch.decision_date = now
    application.batch.save()
    csv_lines = split_lines_at_semicolon(
        pruned_applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][12] == f'"{now.strftime("%Y-%m-%d")}"'


def test_write_talpa_csv_file(
    pruned_applications_csv_service_with_one_application, tmp_path
):
    application = (
        pruned_applications_csv_service_with_one_application.applications.first()
    )
    application.company_name = "test äöÄÖtest"
    application.save()
    output_file = tmp_path / "output.csv"
    pruned_applications_csv_service_with_one_application.write_csv_file(output_file)
    with open(output_file, encoding="utf-8-sig") as f:
        contents = f.read()
        assert contents.startswith('"Hakemusnumero";"Työnantajan tyyppi"')
        assert "äöÄÖtest" in contents


def test_talpa_callback_is_disabled(
    talpa_client,
    settings,
    decided_application,
):
    settings.TALPA_CALLBACK_ENABLED = False

    url = reverse(
        "talpa_callback_url",
    )

    payload = {
        "status": "Success",
        "successful_applications": [decided_application.application_number],
        "failed_applications": [],
    }

    response = talpa_client.post(url, data=payload)

    assert response.status_code == 400
    assert response.data == {"message": "Talpa callback is disabled"}


@pytest.mark.parametrize(
    "instalments_enabled, number_of_instalments",
    [
        (False, 1),
        (True, 1),
        (False, 2),
        (True, 2),
    ],
)
@pytest.mark.django_db
def test_talpa_callback_success(
    talpa_client,
    decided_application,
    application_batch,
    settings,
    instalments_enabled,
    number_of_instalments,
):
    settings.TALPA_CALLBACK_ENABLED = True
    settings.PAYMENT_INSTALMENTS_ENABLED = instalments_enabled
    decided_application.calculation.instalments.all().delete()

    if instalments_enabled:
        for i in range(number_of_instalments):
            due_date = datetime.now(timezone.utc).date()
            if i == 1:
                due_date = timezone.now() + timedelta(days=181)

            Instalment.objects.create(
                calculation=decided_application.calculation,
                amount=decimal.Decimal("123.45"),
                instalment_number=i + 1,
                status=InstalmentStatus.ACCEPTED,
                due_date=due_date,
            )

    decided_application.batch = application_batch
    decided_application.save()

    url = reverse(
        "talpa_callback_url",
    )

    payload = {
        "status": "Success",
        "successful_applications": [decided_application.application_number],
        "failed_applications": [],
    }

    response = talpa_client.post(url, data=payload)

    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    audit_log_entry = AuditLogEntry.objects.latest("created_at")

    assert (
        audit_log_entry.message["audit_event"]["target"]["id"]
        == f"{decided_application.id}"
    )

    decided_application.refresh_from_db()

    if instalments_enabled:
        instalments = decided_application.calculation.instalments.filter(
            due_date__lte=timezone.now().date()
        )
        assert len(instalments) == 1
        for instalment in instalments:
            assert instalment.status == InstalmentStatus.PAID
        if number_of_instalments == 1:
            assert (
                decided_application.talpa_status
                == ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA
            )
            assert decided_application.archived is True
            assert (
                decided_application.batch.status == ApplicationBatchStatus.SENT_TO_TALPA
            )
    else:
        assert (
            decided_application.talpa_status
            == ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA
        )

        assert decided_application.batch.status == ApplicationBatchStatus.SENT_TO_TALPA

        assert decided_application.archived is True


@pytest.mark.parametrize(
    "instalments_enabled, number_of_instalments",
    [
        (False, 1),
        (True, 1),
        (False, 2),
        (True, 2),
    ],
)
@pytest.mark.django_db
def test_talpa_callback_rejected_application(
    talpa_client,
    decided_application,
    application_batch,
    settings,
    instalments_enabled,
    number_of_instalments,
):
    settings.TALPA_CALLBACK_ENABLED = True
    settings.PAYMENT_INSTALMENTS_ENABLED = instalments_enabled
    decided_application.calculation.instalments.all().delete()

    if instalments_enabled:
        for i in range(number_of_instalments):
            due_date = datetime.now(timezone.utc).date()
            if i == 1:
                due_date = timezone.now() + timedelta(days=181)

            Instalment.objects.create(
                calculation=decided_application.calculation,
                amount=decimal.Decimal("123.45"),
                instalment_number=i + 1,
                status=InstalmentStatus.ACCEPTED,
                due_date=due_date,
            )

    decided_application.batch = application_batch
    decided_application.save()

    url = reverse(
        "talpa_callback_url",
    )

    payload = {
        "status": "Failure",
        "successful_applications": [],
        "failed_applications": [decided_application.application_number],
    }

    response = talpa_client.post(url, data=payload)

    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    decided_application.refresh_from_db()
    decided_application.archived = False

    if instalments_enabled:
        instalments = decided_application.calculation.instalments.filter(
            due_date__lte=timezone.now().date()
        )
        assert len(instalments) == 1
        for instalment in instalments:
            assert instalment.status == InstalmentStatus.ERROR_IN_TALPA

        assert decided_application.archived is False

    else:
        assert (
            decided_application.talpa_status == ApplicationTalpaStatus.REJECTED_BY_TALPA
        )
        assert (
            decided_application.batch.status == ApplicationBatchStatus.REJECTED_BY_TALPA
        )
