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
