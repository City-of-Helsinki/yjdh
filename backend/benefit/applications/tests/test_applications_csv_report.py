import itertools
from datetime import date
from decimal import Decimal

import pytest
from dateutil.relativedelta import relativedelta

from applications.api.v1.reporting_serializers import ApplicationReportSerializer
from applications.api.v1.serializers import ApplicantApplicationSerializer
from applications.enums import BenefitType, ApplicationStatus
from applications.models import Application
from applications.tests.conftest import *  # noqa
from applications.tests.factories import DecidedApplicationFactory
from applications.tests.test_applications_api import get_handler_detail_url
from calculator.models import PreviousBenefit
from calculator.tests.factories import PreviousBenefitFactory, PaySubsidyFactory
from common.tests.conftest import *  # noqa
from common.utils import duration_in_months, to_decimal
from companies.tests.conftest import *  # noqa
from django.utils import translation
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa
from applications.services.applications_csv_report import ApplicationsCsvService


def test_reporting_serializer_ssn(decided_application):
    assert decided_application.employee.social_security_number
    serializer = ApplicationReportSerializer(decided_application)
    assert 'social_security_number' not in serializer.data['employee']

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
            assert csv_lines[1][idx] == application1.pay_subsidies.all()[0].start_date.isoformat()
            assert csv_lines[2][idx] == application2.pay_subsidies.all()[0].start_date.isoformat()
        elif "De minimis 1 / myöntäjä" in col.heading:
            assert csv_lines[1][idx] == application1.de_minimis_aid_set.all()[0].start_date.isoformat()
            assert csv_lines[2][idx] == application2.de_minimis_aid_set.all()[0].start_date.isoformat()
        elif "De minimis 2 / myöntäjä" in col.heading:
            assert csv_lines[1][idx] == application1.de_minimis_aid_set.all()[1].start_date.isoformat()
            assert csv_lines[2][idx] == application2.de_minimis_aid_set.all()[1].start_date.isoformat()
        elif "Laskelman lopputulos" in col.heading:
            assert Decimal(csv_lines[1][idx]) == application1.calculation.calculated_benefit_amount
            assert Decimal(csv_lines[2][idx]) == application2.calculation.calculated_benefit_amount


def test_applications_csv_two_ahjo_rows(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidies.all().delete()
    # force two rows
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = ApplicationStatus.HANDLING # so that recalculation can take place
    application.save()
    subsidy1=PaySubsidyFactory(application=application,
                               start_date=application.calculation.start_date,
                               end_date=application.calculation.start_date + relativedelta(days=14),
                               pay_subsidy_percent=40)
    subsidy2=PaySubsidyFactory(application=application,
                               start_date=subsidy1.end_date+relativedelta(days=1),
                               end_date=application.calculation.end_date,
                               pay_subsidy_percent=50)
    application.refresh_from_db()
    application.calculation.calculate()
    application.status = ApplicationStatus.ACCEPTED
    application.save()
    csv_lines = split_lines_at_semicolon(applications_csv_service_with_one_application.get_csv_string())
    assert csv_lines[0][0] == '"Hakemusnumero"'
    assert int(csv_lines[1][0]) == application.application_number
    assert int(csv_lines[1][1]) == 1
    assert int(csv_lines[2][0]) == application.application_number
    assert int(csv_lines[2][1]) == 2
    assert csv_lines[1][2:] == csv_lines[2][2:] # rest of the lines are equal
    assert len(csv_lines) == 3
    applications_csv_service_with_one_application.write_csv_file('/tmp/two_ahjo_rows.csv')

def test_applications_csv_too_many_pay_subsidies(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.pay_subsidies.all().delete()
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.status = ApplicationStatus.HANDLING # so that recalculation can take place
    application.save()
    # force three rows (should not happen in real usage)
    subsidy1=PaySubsidyFactory(application=application,
                               start_date=application.calculation.start_date,
                               end_date=application.calculation.start_date + relativedelta(days=14),
                               pay_subsidy_percent=40)
    subsidy2=PaySubsidyFactory(application=application,
                               start_date=subsidy1.end_date+relativedelta(days=1),
                               end_date=subsidy1.end_date+relativedelta(days=7),
                               pay_subsidy_percent=50)
    subsidy3=PaySubsidyFactory(application=application,
                               start_date=subsidy2.end_date+relativedelta(days=1),
                               end_date=application.calculation.end_date,
                               pay_subsidy_percent=40)
    application.refresh_from_db()
    application.calculation.calculate()

    csv_lines = split_lines_at_semicolon(applications_csv_service_with_one_application.get_csv_string())
    assert csv_lines[1][-1] == '"Osa palkkatuista puuttuu raportilta"'


def test_applications_csv_non_ascii_characters(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.save()
    csv_lines = split_lines_at_semicolon(applications_csv_service_with_one_application.get_csv_string())
    assert csv_lines[1][3] == '"test äöÄÖtest"'  # string is quoted


def test_applications_csv_delimiter(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.company_name = "test;12"
    application.save()
    assert ';"test;12";' in applications_csv_service_with_one_application.get_csv_string()


def test_applications_csv_decimal(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.calculation.calculated_benefit_amount = Decimal("123.45")
    application.calculation.save()
    csv_lines = split_lines_at_semicolon(applications_csv_service_with_one_application.get_csv_string())
    assert csv_lines[1][8] == "123.45"


def test_applications_csv_date(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.batch.decision_date = date(2021, 8, 27)
    application.batch.save()
    csv_lines = split_lines_at_semicolon(applications_csv_service_with_one_application.get_csv_string())
    assert csv_lines[1][11] == '"2021-08-27"'


def test_applications_csv_missing_data(applications_csv_service_with_one_application):
    application = applications_csv_service_with_one_application.get_applications()[0]
    application.batch.decision_date = None
    application.batch.save()
    with pytest.raises(ValueError):
        applications_csv_service_with_one_application.get_csv_string()


def test_write_applications_csv_file(applications_csv_service, tmp_path):
    application = applications_csv_service.get_applications()[0]
    application.company_name = "test äöÄÖtest"
    application.save()
    output_file = tmp_path / "output.csv"
    applications_csv_service.write_csv_file(output_file)
    with open(output_file, encoding="utf-8") as f:
        contents = f.read()
        assert "äöÄÖtest" in contents
        import pdb;pdb.set_trace()
