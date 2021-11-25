import pytest
from applications.enums import ApplicationStatus
from applications.tests.conftest import *  # noqa
from calculator.models import (
    Calculation,
    PaySubsidy,
    PreviousBenefit,
    TrainingCompensation,
)
from common.exceptions import BenefitAPIException
from helsinkibenefit.tests.conftest import *  # noqa


def test_calculation_model(calculation):
    assert Calculation.objects.count() == 1
    assert calculation.application
    assert calculation.rows.count() == 4


def test_pay_subsidy(pay_subsidy):
    assert PaySubsidy.objects.count() == 1
    assert pay_subsidy.application


def test_training_compensation(training_compensation):
    assert TrainingCompensation.objects.count() == 1
    assert training_compensation.application


def test_previous_benefit(previous_benefit):
    assert PreviousBenefit.objects.count() == 1
    assert previous_benefit.company


def test_benefit_amount(calculation):
    calculation.calculated_benefit_amount = 100
    assert calculation.benefit_amount == 100
    calculation.override_benefit_amount = 200
    assert calculation.benefit_amount == 200


def test_create_for_application(application):
    application.status = ApplicationStatus.RECEIVED
    calculation = Calculation.objects.create_for_application(application)
    assert calculation.application == application
    assert calculation.monthly_pay == application.employee.monthly_pay


def test_create_for_application_fail(received_application):
    # calculation already exists
    with pytest.raises(BenefitAPIException):
        Calculation.objects.create_for_application(received_application)
