import datetime
import decimal

from applications.tests.common import (
    check_csv_cell_list_lines_generator,
    check_csv_string_lines_generator,
)
from applications.tests.conftest import *  # noqa
from applications.tests.conftest import split_lines_at_semicolon
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa


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
    assert csv_lines[0][0] == '"Hakemusnumero"'
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
    application.batch.decision_date = datetime.date(2021, 8, 27)
    application.batch.save()
    csv_lines = split_lines_at_semicolon(
        pruned_applications_csv_service_with_one_application.get_csv_string()
    )
    assert csv_lines[1][12] == '"2021-08-27"'


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
