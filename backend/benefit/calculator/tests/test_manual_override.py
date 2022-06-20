from datetime import date
from decimal import Decimal

import pytest

from applications.tests.conftest import *  # noqa
from calculator.enums import RowType
from helsinkibenefit.tests.conftest import *  # noqa


@pytest.mark.parametrize(
    "start_date,end_date,override_monthly_benefit_amount,expected_amount",
    [
        (date(2022, 1, 1), date(2022, 1, 31), 100, 100),
        (date(2022, 1, 1), date(2022, 1, 31), Decimal("100.49"), 100),
        (date(2022, 1, 1), date(2022, 1, 31), Decimal("100.50"), 101),
        (date(2022, 1, 1), date(2022, 1, 31), 0, 0),
        (date(2022, 1, 1), date(2022, 6, 30), 100, 600),
        (date(2022, 1, 1), date(2022, 6, 30), 1000, 6000),
        (date(2022, 1, 1), date(2022, 12, 31), 100, 1200),
    ],
)
def test_override_monthly_benefit_amount(
    handling_application,
    start_date,
    end_date,
    override_monthly_benefit_amount,
    expected_amount,
):
    handling_application.calculation.start_date = start_date
    handling_application.calculation.end_date = end_date
    handling_application.calculation.override_monthly_benefit_amount = (
        override_monthly_benefit_amount
    )
    handling_application.calculation.save()
    handling_application.calculation.calculate()
    assert handling_application.calculation.calculated_benefit_amount == expected_amount
    assert handling_application.calculation.rows.count() == 1
    assert (
        handling_application.calculation.rows.first().row_type
        == RowType.HELSINKI_BENEFIT_TOTAL_EUR
    )
    assert (
        handling_application.calculation.rows.first().start_date
        == handling_application.calculation.start_date
    )
    assert (
        handling_application.calculation.rows.first().end_date
        == handling_application.calculation.end_date
    )
    assert handling_application.calculation.rows.first().amount == expected_amount
