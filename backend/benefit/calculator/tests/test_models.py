from datetime import date

import pytest

from applications.enums import ApplicationStatus, BenefitType
from applications.tests.conftest import *  # noqa
from calculator.models import (
    Calculation,
    PaySubsidy,
    PreviousBenefit,
    TrainingCompensation,
)
from common.exceptions import BenefitAPIException
from common.utils import duration_in_months
from helsinkibenefit.tests.conftest import *  # noqa


def test_calculation_model(calculation):
    assert Calculation.objects.count() == 1
    assert calculation.application
    assert calculation.rows.count() == 4
    assert calculation.start_date is not None and calculation.end_date is not None
    assert calculation.duration_in_months == duration_in_months(
        calculation.start_date, calculation.end_date
    )
    calculation.start_date = None
    assert calculation.duration_in_months is None
    assert calculation.duration_in_months_rounded is None


def test_pay_subsidy(pay_subsidy):
    assert PaySubsidy.objects.count() == 1
    assert pay_subsidy.application


def test_training_compensation(training_compensation):
    assert TrainingCompensation.objects.count() == 1
    assert training_compensation.application


def test_previous_benefit(previous_benefit):
    assert PreviousBenefit.objects.count() == 1
    assert previous_benefit.company


def test_create_for_application(application):
    application.status = ApplicationStatus.RECEIVED
    calculation = Calculation.objects.create_for_application(application)
    assert calculation.application == application
    assert calculation.monthly_pay == application.employee.monthly_pay


def test_create_for_application_with_pay_subsidies(application):
    application.status = ApplicationStatus.RECEIVED
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.additional_pay_subsidy_percent = 40
    assert application.pay_subsidies.count() == 0
    Calculation.objects.create_for_application(application)
    assert application.pay_subsidies.count() == 2
    assert application.pay_subsidies.all()[0].pay_subsidy_percent == 50
    assert application.pay_subsidies.all()[1].pay_subsidy_percent == 40
    for pay_subsidy in application.pay_subsidies.all():
        assert pay_subsidy.start_date is None
        assert pay_subsidy.end_date is None
        assert pay_subsidy.work_time_percent == PaySubsidy.DEFAULT_WORK_TIME_PERCENT
        assert pay_subsidy.disability_or_illness is False


def test_create_for_application_fail(received_application):
    # calculation already exists
    with pytest.raises(BenefitAPIException):
        Calculation.objects.create_for_application(received_application)


@pytest.mark.parametrize(
    "pay_subsidy_percent, max_subsidy", [(40, 1400), (50, 1400), (100, 1800)]
)
def test_pay_subsidy_maximum(handling_application, pay_subsidy_percent, max_subsidy):
    assert handling_application.pay_subsidies.count() == 1
    handling_application.pay_subsidies.all().update(
        pay_subsidy_percent=pay_subsidy_percent
    )
    handling_application.status = ApplicationStatus.RECEIVED
    handling_application.benefit_type = BenefitType.SALARY_BENEFIT
    handling_application.save()
    calculator = handling_application.calculation.init_calculator()
    assert (
        calculator.get_maximum_monthly_pay_subsidy(
            handling_application.pay_subsidies.all().first()
        )
        == max_subsidy
    )


@pytest.mark.parametrize(
    (
        "benefit_type,start_date,end_date,state_aid_max_percentage,"
        "pay_subsidy_start_date,pay_subsidy_end_date,can_calculate"
    ),
    [
        (
            BenefitType.SALARY_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            True,
        ),
        (
            BenefitType.SALARY_BENEFIT,
            None,
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.SALARY_BENEFIT,
            date(2022, 1, 1),
            None,
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.SALARY_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            None,
            date(2022, 1, 1),
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.SALARY_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            None,
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.SALARY_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            None,
            False,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            True,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            None,
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            None,
            100,
            date(2022, 1, 1),
            date(2022, 1, 31),
            False,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            None,
            date(2022, 1, 1),
            date(2022, 1, 31),
            True,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            None,
            date(2022, 1, 31),
            True,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 31),
            100,
            date(2022, 1, 1),
            None,
            True,
        ),
        (
            BenefitType.EMPLOYMENT_BENEFIT,
            date(2022, 1, 1),
            date(2022, 1, 16),
            100,
            date(2022, 1, 1),
            None,
            True,
        ),
    ],
)
def test_calculation_required_fields(
    handling_application,
    benefit_type,
    start_date,
    end_date,
    state_aid_max_percentage,
    pay_subsidy_start_date,
    pay_subsidy_end_date,
    can_calculate,
):
    handling_application.calculation.start_date = start_date
    handling_application.calculation.end_date = end_date
    handling_application.calculation.state_aid_max_percentage = state_aid_max_percentage
    assert handling_application.pay_subsidies.count() == 1
    handling_application.pay_subsidies.update(
        start_date=pay_subsidy_start_date, end_date=pay_subsidy_end_date
    )
    handling_application.benefit_type = benefit_type
    handling_application.save()
    handling_application.calculation.save()
    handling_application.calculation.calculate()
    if can_calculate:
        assert handling_application.calculation.calculated_benefit_amount is not None
        assert handling_application.calculation.rows.count() > 0
        # The result must be rounded to full euros
        assert (
            int(handling_application.calculation.calculated_benefit_amount)
            == handling_application.calculation.calculated_benefit_amount
        )
    else:
        assert handling_application.calculation.calculated_benefit_amount is None
        assert handling_application.calculation.rows.count() == 0
