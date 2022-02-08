import decimal
import os
from datetime import date

import pytest
from common.utils import (
    date_range_overlap,
    days360,
    duration_in_months,
    get_date_range_end_with_days360,
)
from dateutil.relativedelta import relativedelta


@pytest.mark.parametrize(
    "date1,date2,expected_result",
    [
        (date(2021, 9, 1), date(2021, 10, 1), 30),
        (date(2021, 9, 1), date(2021, 9, 30), 29),
        (date(2021, 8, 1), date(2021, 9, 1), 30),
        (date(2021, 8, 1), date(2021, 9, 2), 31),
        (date(2021, 8, 1), date(2021, 8, 31), 29),
        (date(2021, 8, 1), date(2021, 8, 30), 29),
        (date(2021, 8, 1), date(2021, 8, 29), 28),
        (date(2021, 9, 16), date(2021, 12, 11), 85),
        (date(2021, 12, 10), date(2022, 3, 20), 100),
        (date(2021, 12, 1), date(2022, 12, 1), 360),
    ],
)
def test_days360(date1, date2, expected_result):
    assert days360(date1, date2) == expected_result


@pytest.mark.parametrize(
    "date1,date2",
    [
        (None, date(2021, 10, 1)),
        (date(2021, 9, 1), None),
        (None, None),
        ("foo", "bar"),
    ],
)
def test_days360_errors(date1, date2):
    with pytest.raises(ValueError):
        days360(date1, date2)


@pytest.mark.parametrize(
    "start_1, end_1, start_2, end_2, expected_result",
    [
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 9, 14), date(2021, 9, 30), 2),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 9, 15), date(2021, 9, 30), 1),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 9, 16), date(2021, 9, 30), 0),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 8, 1), date(2021, 8, 31), 0),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 8, 1), date(2021, 9, 1), 1),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 8, 1), date(2021, 9, 2), 2),
        (date(2021, 9, 1), date(2021, 9, 15), date(2021, 9, 2), date(2021, 9, 3), 2),
    ],
)
def test_date_range_overlap(start_1, end_1, start_2, end_2, expected_result):
    assert date_range_overlap(start_1, end_1, start_2, end_2) == expected_result


@pytest.mark.parametrize(
    "date1,months,expected_result",
    [
        (date(2022, 1, 1), 0, None),
        (date(2022, 1, 1), decimal.Decimal("0.01"), None),
        (date(2022, 1, 1), decimal.Decimal("0.03"), date(2022, 1, 1)),
        (date(2022, 1, 1), decimal.Decimal("0.92"), date(2022, 1, 28)),
        (date(2022, 1, 1), decimal.Decimal("1"), date(2022, 1, 31)),
        (date(2022, 1, 1), decimal.Decimal("1.04"), date(2022, 2, 1)),
        (date(2022, 1, 20), decimal.Decimal("1.38"), date(2022, 2, 28)),
        (date(2022, 1, 30), decimal.Decimal("6.99"), date(2022, 8, 30)),
        (date(2022, 2, 28), decimal.Decimal("0.04"), None),
        (date(2022, 2, 28), decimal.Decimal("0.05"), date(2022, 2, 28)),
        (date(2022, 2, 28), decimal.Decimal("0.12"), date(2022, 3, 1)),
        (date(2024, 2, 28), decimal.Decimal("0.04"), date(2024, 2, 28)),
        (date(2024, 2, 28), decimal.Decimal("0.05"), date(2024, 2, 28)),
        (date(2024, 2, 28), decimal.Decimal("0.12"), date(2024, 3, 1)),
        (date(2024, 2, 29), decimal.Decimal("0.04"), date(2024, 2, 29)),
        (date(2024, 2, 29), decimal.Decimal("0.05"), date(2024, 2, 29)),
        (date(2024, 2, 29), decimal.Decimal("0.10"), date(2024, 3, 1)),
        (date(2024, 2, 29), decimal.Decimal("0.12"), date(2024, 3, 2)),
    ],
)
def test_get_date_range_end_with_days360(date1, months, expected_result):
    assert get_date_range_end_with_days360(date1, months) == expected_result


def test_get_date_range_end_with_days360_combinations():

    if os.getenv("DAYS_360_FULL_TEST") == "1":
        # The nested loops test a huge number of combinations. Takes a long time to run,
        # only run this while debugging.
        day_offsets = range(0, 100)  # offset from 2022-01-01
        months_range = range(0, 1200)
    else:
        print(
            "DAYS_360_FULL_TEST not set, test only a few combinations to make sure the test code doesn't rot"
        )
        day_offsets = range(0, 100, 20)  # offset from 2022-01-01
        months_range = range(0, 1200, 100)

    for initial_day_offset in day_offsets:
        print(f"initial_day_offset={initial_day_offset}")
        for months in [decimal.Decimal(m) / 100 for m in months_range]:
            start_date = date(2022, 1, 1) + relativedelta(days=initial_day_offset)
            end_date = get_date_range_end_with_days360(start_date, months)
            if end_date is None:
                # we are adding less than one day
                if not (start_date.month == 2 and start_date.day in [28, 29]):
                    # end of February produces interesting results
                    assert months < (1 / 30)
            else:
                # verify that there is no date that would be closer
                result_difference = abs(
                    duration_in_months(start_date, end_date) - months
                )
                previous_day_difference = abs(
                    duration_in_months(start_date, end_date - relativedelta(days=1))
                    - months
                )
                next_day_difference = abs(
                    duration_in_months(start_date, end_date + relativedelta(days=1))
                    - months
                )
                assert result_difference <= previous_day_difference
                assert result_difference <= next_day_difference
