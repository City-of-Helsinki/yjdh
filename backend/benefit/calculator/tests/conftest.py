import factory
import pytest
from calculator.tests.factories import (
    CalculationFactory,
    PaySubsidyFactory,
    PreviousBenefitFactory,
    TrainingCompensationFactory,
)
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa


@pytest.fixture
def calculation():
    with factory.Faker.override_default_locale("fi_FI"):
        return CalculationFactory()


@pytest.fixture
def pay_subsidy():
    return PaySubsidyFactory()


@pytest.fixture
def training_compensation():
    return TrainingCompensationFactory()


@pytest.fixture
def previous_benefit():
    with factory.Faker.override_default_locale("fi_FI"):
        return PreviousBenefitFactory()


def fill_empty_calculation_fields(application):
    if not application.calculation.start_date:
        application.calculation.start_date = (
            application.calculation.application.start_date
        )
    if not application.calculation.end_date:
        application.calculation.end_date = application.calculation.application.end_date
    if not application.calculation.state_aid_max_percentage:
        application.calculation.state_aid_max_percentage = (
            application.calculation.state_aid_max_percentage
        ) = 50
    application.calculation.save()
    for pay_subsidy in application.pay_subsidies.all():
        if not pay_subsidy.start_date:
            pay_subsidy.start_date = application.start_date
        if not pay_subsidy.end_date:
            pay_subsidy.end_date = application.end_date
        pay_subsidy.save()
