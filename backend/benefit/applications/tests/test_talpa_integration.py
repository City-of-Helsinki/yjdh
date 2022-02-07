import datetime
import decimal

import pytest
from applications.services.talpa_integration import TalpaService
from applications.tests.conftest import *  # noqa
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa


def test_talpa_lines(talpa_service):
    csv_lines = talpa_service.get_csv_lines()
    assert talpa_service.get_applications().count() == 2
    assert len(csv_lines) == 3
    assert csv_lines[0][0] == "Application number"
    assert (
        csv_lines[1][0] == talpa_service.get_applications().first().application_number
    )
    assert csv_lines[2][0] == talpa_service.get_applications()[1].application_number


def test_talpa_csv_output(talpa_service):
    csv_lines = split_lines_at_semicolon(talpa_service.get_csv_string())
    assert csv_lines[0][0] == '"Application number"'
    for idx, col in enumerate(TalpaService.CSV_COLUMNS):
        assert csv_lines[0][idx] == f'"{col.heading}"'

    assert (
        int(csv_lines[1][0])
        == talpa_service.get_applications().first().application_number
    )


def test_talpa_csv_non_ascii_characters(talpa_service_with_one_application):
    application = talpa_service_with_one_application.get_applications().first()
    application.company_name = "test äöÄÖtest"
    application.save()
    csv_lines = split_lines_at_semicolon(talpa_service_with_one_application.get_csv_string())
    assert csv_lines[1][3] == '"test äöÄÖtest"'  # string is quoted


def test_talpa_csv_delimiter(talpa_service_with_one_application):
    application = talpa_service_with_one_application.get_applications().first()
    application.company_name = "test;12"
    application.save()
    assert ';"test;12";' in talpa_service_with_one_application.get_csv_string()


def test_talpa_csv_decimal(talpa_service_with_one_application):
    application = talpa_service_with_one_application.get_applications().first()
    application.calculation.calculated_benefit_amount = decimal.Decimal("123.45")
    application.calculation.save()
    csv_lines = split_lines_at_semicolon(talpa_service_with_one_application.get_csv_string())
    assert csv_lines[1][8] == "123.45"


def test_talpa_csv_date(talpa_service_with_one_application):
    application = talpa_service_with_one_application.get_applications().first()
    application.batch.decision_date = datetime.date(2021, 8, 27)
    application.batch.save()
    csv_lines = split_lines_at_semicolon(talpa_service_with_one_application.get_csv_string())
    assert csv_lines[1][11] == '"2021-08-27"'


def test_talpa_csv_missing_data(talpa_service_with_one_application):
    application = talpa_service_with_one_application.get_applications().first()
    application.batch.decision_date = None
    application.batch.save()
    with pytest.raises(ValueError):
        talpa_service_with_one_application.get_csv_string()


def test_write_talpa_csv_file(talpa_service, tmp_path):
    application = talpa_service.get_applications().first()
    application.company_name = "test äöÄÖtest"
    application.save()
    output_file = tmp_path / "output.csv"
    talpa_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        assert contents.startswith('"Application number";"Organization type"')
        assert "äöÄÖtest" in contents
