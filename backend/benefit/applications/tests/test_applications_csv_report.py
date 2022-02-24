from datetime import date, datetime
from decimal import Decimal

from applications.enums import AhjoDecision, ApplicationStatus, BenefitType
from applications.models import ApplicationBatch
from applications.tests.conftest import *  # noqa
from applications.tests.conftest import split_lines_at_semicolon
from applications.tests.factories import DecidedApplicationFactory, DeMinimisAidFactory
from calculator.tests.factories import PaySubsidyFactory
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from dateutil.relativedelta import relativedelta
from helsinkibenefit.tests.conftest import *  # noqa
from rest_framework.reverse import reverse
from terms.tests.conftest import *  # noqa


def _get_csv(handler_api_client, url, expected_application_numbers, expect_empty=False):
    response = handler_api_client.get(url)
    assert response.status_code == 200
    csv_lines = split_lines_at_semicolon(response.content.decode("utf-8"))
    if expect_empty:
        assert len(csv_lines) == 2
        assert csv_lines[1][0] == '"Ei löytynyt ehdot täyttäviä hakemuksia"'
    else:
        assert csv_lines[0][0] == '"Hakemusnumero"'
        assert len(csv_lines) == len(expected_application_numbers) + 1
        for line, expected_application_number in zip(
            csv_lines[1:], expected_application_numbers
        ):
            assert int(line[0]) == expected_application_number
    return csv_lines


def _create_applications_for_csv_export():
    application1 = DecidedApplicationFactory(status=ApplicationStatus.ACCEPTED)
    application1.log_entries.filter(to_status=ApplicationStatus.ACCEPTED).update(
        created_at=datetime(2022, 1, 1)
    )
    application2 = DecidedApplicationFactory(status=ApplicationStatus.ACCEPTED)
    application2.log_entries.filter(to_status=ApplicationStatus.ACCEPTED).update(
        created_at=datetime(2022, 2, 1)
    )
    application3 = DecidedApplicationFactory(status=ApplicationStatus.REJECTED)
    application3.log_entries.filter(to_status=ApplicationStatus.REJECTED).update(
        created_at=datetime(2022, 3, 1)
    )
    application4 = DecidedApplicationFactory(
        status=ApplicationStatus.CANCELLED
    )  # should be excluded
    application4.log_entries.filter(to_status=ApplicationStatus.CANCELLED).update(
        created_at=datetime(2022, 2, 1)
    )
    return (application1, application2, application3, application4)


def test_applications_csv_export_new_applications(handler_api_client):
    (
        application1,
        application2,
        application3,
        application4,
    ) = _create_applications_for_csv_export()
    ApplicationBatch.objects.all().delete()

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_new_rejected_applications/",
        [application3.application_number],
    )
    assert ApplicationBatch.objects.all().count() == 1
    assert ApplicationBatch.objects.all().first().applications.count() == 1
    assert (
        ApplicationBatch.objects.filter(
            proposal_for_decision=AhjoDecision.DECIDED_REJECTED
        )
        .first()
        .applications.first()
        == application3
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_new_accepted_applications/",
        [application1.application_number, application2.application_number],
    )
    assert ApplicationBatch.objects.all().count() == 2
    assert set(
        [
            a.pk
            for a in ApplicationBatch.objects.filter(
                proposal_for_decision=AhjoDecision.DECIDED_ACCEPTED
            )
            .first()
            .applications.all()
        ]
    ) == {application1.pk, application2.pk}

    # re-running the request results in an empty response and doesn't create new batches
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_new_rejected_applications/",
        [],
        expect_empty=True,
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_new_accepted_applications/",
        [],
        expect_empty=True,
    )
    assert ApplicationBatch.objects.all().count() == 2


def test_applications_csv_export_without_calculation(
    handler_api_client, received_application
):
    received_application.calculation.delete()
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/",
        [
            received_application.application_number,
        ],
    )


def test_applications_csv_export_with_date_range(handler_api_client):
    (
        application1,
        application2,
        application3,
        application4,
    ) = _create_applications_for_csv_export()
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
            application4.application_number,
        ],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list") + "export_csv/?status=accepted,rejected",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-01-02",
        [application2.application_number, application3.application_number],
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2021-12-31&date_handled_before=2022-03-02",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-01-01&date_handled_before=2022-03-01",
        [
            application1.application_number,
            application2.application_number,
            application3.application_number,
        ],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-01-02&date_handled_before=2022-02-28",
        [application2.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-02-02&date_handled_before=2022-02-28",
        [],
        expect_empty=True,
    )

    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-02-01",
        [application2.application_number, application3.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_before=2022-02-28",
        [application1.application_number, application2.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-02-01&status=rejected",
        [application3.application_number],
    )
    _get_csv(
        handler_api_client,
        reverse("v1:handler-application-list")
        + "export_csv/?date_handled_after=2022-02-01&status=cancelled",
        [],
        expect_empty=True,
    )


def test_applications_csv_output(applications_csv_service):
    csv_lines = split_lines_at_semicolon(applications_csv_service.get_csv_string())
    assert csv_lines[0][0] == '"Hakemusnumero"'
    assert (
        int(csv_lines[1][0])
        == applications_csv_service.get_applications()[0].application_number
    )
    application1 = applications_csv_service.get_applications()[0]
    application2 = applications_csv_service.get_applications()[1]
    for idx, col in enumerate(applications_csv_service.CSV_COLUMNS):
        assert csv_lines[0][idx] == f'"{col.heading}"'
        if "Palkkatuki 1 / alkupäivä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.pay_subsidies.all()[0].start_date.isoformat()}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.pay_subsidies.all()[0].start_date.isoformat()}"'
            )
        elif "De minimis 1 / myöntäjä" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.de_minimis_aid_set.all()[0].granter}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.de_minimis_aid_set.all()[0].granter}"'
            )
        elif "De minimis 2 / myönnetty" in col.heading:
            assert (
                csv_lines[1][idx]
                == f'"{application1.de_minimis_aid_set.all()[1].granted_at.isoformat()}"'
            )
            assert (
                csv_lines[2][idx]
                == f'"{application2.de_minimis_aid_set.all()[1].granted_at.isoformat()}"'
            )
        elif "Laskelman lopputulos" in col.heading:
            assert (
                Decimal(csv_lines[1][idx])
                == application1.calculation.calculated_benefit_amount
            )
            assert (
                Decimal(csv_lines[2][idx])
                == application2.calculation.calculated_benefit_amount
            )


def test_applications_csv_two_ahjo_rows(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidies.all().delete()
    # force two rows
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = (
        ApplicationStatus.HANDLING
    )  # so that recalculation can take place
    application.save()
    subsidy1 = PaySubsidyFactory(
        application=application,
        start_date=application.calculation.start_date,
        end_date=application.calculation.start_date + relativedelta(days=14),
        pay_subsidy_percent=40,
    )
    PaySubsidyFactory(
        application=application,
        start_date=subsidy1.end_date + relativedelta(days=1),
        end_date=application.calculation.end_date,
        pay_subsidy_percent=50,
    )
    application.refresh_from_db()
    application.calculation.calculate()
    application.status = ApplicationStatus.ACCEPTED
    application.save()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert len(application.ahjo_rows) == 2
    assert csv_lines[0][0] == '"Hakemusnumero"'
    assert int(csv_lines[1][0]) == application.application_number
    assert int(csv_lines[1][1]) == 1
    assert int(csv_lines[2][0]) == application.application_number
    assert int(csv_lines[2][1]) == 2
    assert csv_lines[1][2:] == csv_lines[2][2:]  # rest of the lines are equal
    assert len(csv_lines) == 3

    column_1 = csv_lines[0].index('"Ahjo-rivi 1 / tyyppi"')
    column_2 = csv_lines[0].index('"Ahjo-rivi 2 / tyyppi"')
    for ahjo_row, start_column in zip(application.ahjo_rows, [column_1, column_2]):
        assert csv_lines[1][start_column] == f'"{ahjo_row.row_type}"'
        assert csv_lines[1][start_column + 1] == f'"{ahjo_row.description_fi}"'
        assert Decimal(csv_lines[1][start_column + 2]) == ahjo_row.amount
        assert Decimal(csv_lines[1][start_column + 3]) == ahjo_row.monthly_amount
        assert csv_lines[1][start_column + 4] == f'"{ahjo_row.start_date.isoformat()}"'
        assert csv_lines[1][start_column + 5] == f'"{ahjo_row.end_date.isoformat()}"'
    applications_csv_service_with_one_application.write_csv_file(
        "/tmp/two_ahjo_rows.csv"
    )


def test_applications_csv_too_many_de_minimis_aids(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    for _ in range(6):
        DeMinimisAidFactory(application=application)
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][-1] == '"osa de minimis -tuista puuttuu raportilta"'


def test_applications_csv_too_many_pay_subsidies(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidies.all().delete()
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = (
        ApplicationStatus.HANDLING
    )  # so that recalculation can take place
    application.save()
    # force three rows (should not happen in real usage)
    subsidy1 = PaySubsidyFactory(
        application=application,
        start_date=application.calculation.start_date,
        end_date=application.calculation.start_date + relativedelta(days=14),
        pay_subsidy_percent=40,
    )
    subsidy2 = PaySubsidyFactory(
        application=application,
        start_date=subsidy1.end_date + relativedelta(days=1),
        end_date=subsidy1.end_date + relativedelta(days=7),
        pay_subsidy_percent=50,
    )
    PaySubsidyFactory(
        application=application,
        start_date=subsidy2.end_date + relativedelta(days=1),
        end_date=application.calculation.end_date,
        pay_subsidy_percent=40,
    )
    application.refresh_from_db()
    application.calculation.calculate()
    assert len(application.ahjo_rows) == 3

    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert (
        csv_lines[1][-1]
        == '"osa palkkatuista puuttuu raportilta, osa Ahjo-riveistä puuttuu raportilta"'
    )


def test_applications_csv_non_ascii_characters(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.save()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][8] == '"test äöÄÖtest"'  # string is quoted


def test_applications_csv_delimiter(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test;12"
    application.save()
    assert (
        ';"test;12";' in applications_csv_service_with_one_application.get_csv_string()
    )


def test_applications_csv_missing_data(applications_csv_with_no_applications):
    csv_lines = split_lines_at_semicolon(
        applications_csv_with_no_applications.get_csv_string()
    )
    assert len(csv_lines) == 2
    assert len(csv_lines[0]) == len(csv_lines[1])
    assert csv_lines[1][0] == '"Ei löytynyt ehdot täyttäviä hakemuksia"'


def test_applications_csv_monthly_amount_override(
    applications_csv_service_with_one_application,
):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.status = ApplicationStatus.HANDLING
    application.save()
    application.calculation.override_monthly_benefit_amount = 100
    application.calculation.save()
    application.calculation.start_date = date(2021, 1, 1)
    application.calculation.end_date = date(2021, 2, 28)
    application.calculation.calculate()
    csv_lines = split_lines_at_semicolon(
        applications_csv_service_with_one_application.get_csv_string()
    )
    monthly_col = csv_lines[0].index('"Ahjo-rivi 1 / määrä eur kk"')
    total_col = csv_lines[0].index('"Ahjo-rivi 1 / määrä eur yht"')
    assert csv_lines[1][monthly_col] == "100.00"
    assert csv_lines[1][total_col] == "200.00"


def test_write_applications_csv_file(applications_csv_service, tmp_path):
    application = applications_csv_service.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.save()
    output_file = tmp_path / "output.csv"
    applications_csv_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        assert "äöÄÖtest" in contents
