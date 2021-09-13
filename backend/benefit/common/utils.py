import decimal
import itertools
from datetime import date, timedelta

from phonenumber_field.serializerfields import (
    PhoneNumberField as DefaultPhoneNumberField,
)


def update_object(obj, data):
    if not data:
        return
    for k, v in data.items():
        if v is None and not obj.__class__._meta.get_field(k).null:
            raise ValueError(f"{k} cannot be null.")
        setattr(obj, k, v)
    obj.save()


def xgroup(iter, n=2, check_length=False):
    """
    adapted from: comp.lang.python Thu Jun 5 22:58:05 CEST 2003

    >>> list(xgroup(range(9), 3))
    [(0, 1, 2), (3, 4, 5), (6, 7, 8)]
    """
    if check_length:
        num = len(iter)
        assert num % n == 0, "Length does not match"
    last = []
    for elt in iter:
        last.append(elt)
        if len(last) == n:
            yield tuple(last)
            last = []


def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    for unused in b:
        break
    return zip(a, b)


class PhoneNumberField(DefaultPhoneNumberField):
    def to_representation(self, value):
        if not value:
            return ""
        return "0{}".format(value.national_number)


def date_range_overlap(start_1, end_1, start_2, end_2):
    """
    Based on: https://stackoverflow.com/questions/9044084/efficient-date-range-overlap-calculation-in-python
    """
    latest_start = max(start_1, start_2)
    earliest_end = min(end_1, end_2)
    delta = (earliest_end - latest_start).days + 1
    return max(0, delta)


METHOD_EU = True


def days360(start_date, end_date):
    """
    Calculation of the number of months in Helsinki Benefit calculator excel file used
    the days360 function. This is a Python implementation.
    source: https://stackoverflow.com/questions/51832672/pandas-excel-days360-equivalent
    Changes:
    * Added unit tests
    * forced method_eu to always be True.
    """
    if not isinstance(start_date, date) or not isinstance(end_date, date):
        raise ValueError("date object needed")

    start_day = start_date.day
    start_month = start_date.month
    start_year = start_date.year
    end_day = end_date.day
    end_month = end_date.month
    end_year = end_date.year

    if start_day == 31 or (
        METHOD_EU is False
        and start_month == 2
        and (start_day == 29 or (start_day == 28 and start_date.is_leap_year is False))
    ):
        start_day = 30

    if end_day == 31:
        if METHOD_EU is False and start_day != 30:
            end_day = 1

            if end_month == 12:
                end_year += 1
                end_month = 1
            else:
                end_month += 1
        else:
            end_day = 30

    return (
        end_day
        + end_month * 30
        + end_year * 360
        - start_day
        - start_month * 30
        - start_year * 360
    )


def duration_in_months(start_date, end_date):
    # This is the formula used in the application calculator Excel file 2021-09
    return decimal.Decimal(days360(start_date, end_date + timedelta(days=1))) / 30
