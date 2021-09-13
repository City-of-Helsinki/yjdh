from datetime import date

import pytest
from common.utils import date_range_overlap, days360


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
