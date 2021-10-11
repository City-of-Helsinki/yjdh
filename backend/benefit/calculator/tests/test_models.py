from calculator.models import Calculation, PaySubsidy, PreviousBenefit
from helsinkibenefit.tests.conftest import *  # noqa


def test_calculation_model(calculation):
    assert Calculation.objects.count() == 1
    assert calculation.application
    assert calculation.rows.count() == 4


def test_pay_subsidy(pay_subsidy):
    assert PaySubsidy.objects.count() == 1
    assert pay_subsidy.application


def test_previous_benefit(previous_benefit):
    assert PreviousBenefit.objects.count() == 1
    assert previous_benefit.company


def test_benefit_amount(calculation):
    calculation.calculated_benefit_amount = 100
    assert calculation.benefit_amount == 100
    calculation.override_benefit_amount = 200
    assert calculation.benefit_amount == 200
