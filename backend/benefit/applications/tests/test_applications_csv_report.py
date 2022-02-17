from decimal import Decimal

from applications.enums import ApplicationStatus, BenefitType
from applications.tests.conftest import *  # noqa
from applications.tests.conftest import split_lines_at_semicolon
from applications.tests.factories import DeMinimisAidFactory
from calculator.tests.factories import PaySubsidyFactory
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from dateutil.relativedelta import relativedelta
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa


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


def test_write_applications_csv_file(applications_csv_service, tmp_path):
    application = applications_csv_service.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.save()
    output_file = tmp_path / "output.csv"
    applications_csv_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        assert "äöÄÖtest" in contents
