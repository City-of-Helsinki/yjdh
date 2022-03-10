import decimal
import functools
import itertools
from datetime import date, timedelta

from dateutil.relativedelta import relativedelta
from phonenumber_field.serializerfields import (
    PhoneNumberField as DefaultPhoneNumberField,
)


def update_object(obj, data, limit_to_fields=None):
    if not data:
        return
    for k, v in data.items():
        if limit_to_fields is not None and k not in limit_to_fields:
            continue
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


def nested_setattr(obj, attr, val):
    """
    Support dotted access to nested objects
    """
    pre, _, post = attr.rpartition(".")
    return setattr(nested_getattr(obj, pre) if pre else obj, post, val)


def nested_getattr(obj, attr, *args):
    def _getattr(obj, attr):
        return getattr(obj, attr, *args)

    return functools.reduce(_getattr, [obj] + attr.split("."))


def to_decimal(numeric_value, decimal_places=None, allow_null=True):
    if numeric_value is None and allow_null:
        return None
    value = decimal.Decimal(numeric_value)
    if decimal_places is not None:
        value = value.quantize(
            decimal.Decimal(".1") ** decimal_places, rounding=decimal.ROUND_HALF_UP
        )
    return value


class PhoneNumberField(DefaultPhoneNumberField):
    def to_representation(self, value):
        if not value:
            return ""
        return "0{}".format(value.national_number)


def date_range_overlap(start_1, end_1, start_2, end_2):
    """
    Based on: https://stackoverflow.com/questions/9044084/efficient-date-range-overlap-calculation-in-python
    """
    if None in [start_1, end_1, start_2, end_2]:
        raise ValueError("Cannot check date range overlap if start or end date is None")
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


def duration_in_months(start_date, end_date, decimal_places=None):
    # This is the formula used in the application calculator Excel file 2021-09
    return to_decimal(
        decimal.Decimal(days360(start_date, end_date + timedelta(days=1))) / 30,
        decimal_places,
    )


class DurationMixin:
    """
    Mixin class that defines properties for duration_in_months and duration_in_months_rounded.
    Depends on having start_date and end_date fields available in the object.
    The duration is calculated according to the DAYS360 Excel function, as that
    function was used by the application handlers in the application calculation Excel file.
    """

    @property
    def duration_in_months(self):
        return self._get_duration_in_months()

    @property
    def duration_in_months_rounded(self):
        # The handler's Excel file uses the number of months rounded to two decimals
        # in many calculations
        return self._get_duration_in_months(decimal_places=2)

    def _get_duration_in_months(self, decimal_places=None):
        if self.start_date and self.end_date:
            return duration_in_months(
                self.start_date, self.end_date, decimal_places=decimal_places
            )
        else:
            return None


# defensive programming to avoid infinite loops
DATE_RANGE_MAX_ITERATIONS = 7


def get_date_range_end_with_days360(start_date, n_months):
    """
    Given a start date and a duration in months, return the end_date for a date range that most closely
    matches the given duration.
    :param start_date: a datetime.date object
    :param n_months: a Decimal amount, representing a number of months, as calculated by duration_in_months

    If the date range length would be zero days, return None.

    Notes:

    duration_in_months is implemented with the days360 function.
    The days360 function has some properties that introduce complexities to the calculation.
    for example:
    * days360(datetime.date(2022,2,1), datetime.date(2022,2,28)) == 27
    * days360(datetime.date(2022,2,1), datetime.date(2022,3,1)) == 30
    the effect is that the actual calendar duration of days doesn't increase in a perfectly linear way
    with the duration_in_months, and sometimes two different date ranges evaluate to the same duration:
    1. duration_in_months(datetime.date(2022, 2, 1), datetime.date(2022, 2, 28)) == Decimal('1')
    2. duration_in_months(datetime.date(2022, 2, 1), datetime.date(2022, 2, 27)) == Decimal('0.9')
    3. duration_in_months(datetime.date(2022, 2, 1), datetime.date(2022, 2, 26)) ==
       Decimal('0.8666666666666666666666666667')
    4. duration_in_months(datetime.date(2022,1,1), datetime.date(2022,1,30)) ==
       duration_in_months(datetime.date(2022,1,1), datetime.date(2022,1,29))

    In case 4, when two date ranges have the same duration_in_months, we want to return the
    longest possible duration. This will resolve the ambiguity in the applicant's favor, as
    this function is used to calculate the last valid end_date for the benefit.
    """
    assert n_months >= 0

    # Using the usual calendar definition of months, so initially the start_date might be off by a few days
    full_months = int(n_months)
    # Make the initial guess work for February cases, too
    fractional_days = int(to_decimal((n_months - full_months) * 28, decimal_places=0))
    end_date = (
        start_date
        + relativedelta(months=full_months)
        + relativedelta(days=fractional_days - 3)
    )
    for _ in range(DATE_RANGE_MAX_ITERATIONS):
        # calculate how much we are off from the duration that was requested, and see if the
        # next day would be closer to the goal
        difference = abs(duration_in_months(start_date, end_date) - n_months)
        next_day_difference = abs(
            duration_in_months(start_date, end_date + relativedelta(days=1)) - n_months
        )
        if difference < next_day_difference:
            # [end_date, start_date] is the date range that most closely matches n_months.
            # in case difference == next_day_difference, we'll advance to the next day, in order to
            # make the resulting date range as long as possible.
            break
        else:
            end_date += relativedelta(days=1)
    else:
        assert False, "This should be unreachable"

    if end_date < start_date:
        # We can't have date ranges where duration is less than one day, as the range is inclusive
        # (for benefit calculation this is OK, as a benefit with a zero duration doesn't exist)
        return None

    return end_date
