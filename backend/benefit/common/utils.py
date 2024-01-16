import decimal
import functools
import hashlib
import itertools
from datetime import date, timedelta
from typing import Iterator, Tuple, Union

from dateutil.relativedelta import relativedelta
from django.core.files import File
from django.http import HttpRequest
from phonenumber_field.serializerfields import (
    PhoneNumberField as DefaultPhoneNumberField,
)


def update_object(obj: object, data: dict, limit_to_fields=None):
    """
    Updates the fields of an object with the provided data.

    Args:
        obj: The object to be updated.
        data: A dictionary containing field-value pairs to update the object.
        limit_to_fields (optional): A list of fields to limit the update to. Default is None.

    Raises:
        ValueError: If a field in the data is set to None but is not nullable according to the object's model.

    Example:
        user = User.objects.get(id=1)
        data = {'name': 'John', 'age': 25}
        update_object(user, data)

    In the example above, the update_object function is used to update the 'name' and 'age' fields of a User object.
    The function takes the User object, a data dictionary with field-value pairs, and updates the object accordingly.
    The updated object is then saved.
    """
    if not data:
        return
    for k, v in data.items():
        if limit_to_fields is not None and k not in limit_to_fields:
            continue
        if v is None and not obj.__class__._meta.get_field(k).null:
            raise ValueError(f"{k} cannot be null.")
        setattr(obj, k, v)
    obj.save()


def xgroup(iter, n=2, check_length=False) -> Iterator[Tuple]:
    """
    Groups elements from an iterable into tuples of size n.

    Args:
        iterable: The iterable to be grouped.
        n (optional): The size of each group. Default is 2.
        check_length (optional): Whether to check if the length of the iterable is divisible by n. Default is False.

    Yields:
        Tuples of size n containing elements from the iterable.

    Raises:
        AssertionError: If check_length is True and the length of the iterable is not divisible by n.

    Example:
        items = [1, 2, 3, 4, 5, 6]
        for group in xgroup(items, 3):
            print(group)

        # Output:
        # (1, 2, 3)
        # (4, 5, 6)

    In the example above, the xgroup function is used to group elements from a list into tuples of size 3.
    Each tuple is then printed, demonstrating how the function can be used to iterate over groups of elements.
    """
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
    """
    Iterates over an iterable, returning pairs of consecutive elements.

    Args:
        iterable: An iterable object.

    Returns:
        An iterator that generates tuples containing consecutive pairs of elements from the iterable.

    Example:
        numbers = [1, 2, 3, 4, 5]
        pairs = pairwise(numbers)
        for pair in pairs:
            print(pair)

        Output:
        (1, 2)
        (2, 3)
        (3, 4)
        (4, 5)

    In the example above, the pairwise function takes a list of numbers and returns an iterator that generates pairs
    of consecutive numbers. The resulting pairs are then printed one by one.
    """
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    for unused in b:
        break
    return zip(a, b)


def nested_setattr(obj: object, attr, val):
    """
    Sets the value of a nested attribute in an object using dotted notation.

    Args:
        obj: The object to set the attribute on.
        attr: The attribute name or dotted path to the nested attribute.
        val: The value to set for the attribute.

    Returns:
        None

    Example:
        user = User()
        nested_setattr(user, 'profile.name', 'John')
        nested_setattr(user, 'profile.age', 25)

    In the example above, the nested_setattr function is used to set the 'name' and 'age' attributes of the 'profile'
    nested object within a User object. The function takes the User object, the attribute name or dotted path, and the
    corresponding value, and sets the attributes accordingly.
    """
    pre, _, post = attr.rpartition(".")
    return setattr(nested_getattr(obj, pre) if pre else obj, post, val)


def nested_getattr(obj, attr, *args):
    """
    Retrieves the value of a nested attribute from an object using dot notation.

    Args:
        obj: The object from which to retrieve the attribute.
        attr: A string representing the nested attribute using dot notation.
        *args: Additional arguments to be passed to the getattr function.

    Returns:
        The value of the nested attribute if it exists, or None if any intermediate attribute is missing.

    Example:
        class Person:
            def __init__(self, name):
                self.name = name

        person = Person("John")
        print(nested_getattr(person, "name"))  # Output: "John"
    """

    def _getattr(obj, attr):
        return getattr(obj, attr, *args)

    return functools.reduce(_getattr, [obj] + attr.split("."))


def to_decimal(numeric_value, decimal_places: Union[int, None] = None, allow_null=True):
    """
    Converts a numeric value to a decimal.

    Args:
        numeric_value: The numeric value to be converted.
        decimal_places: The number of decimal places to round the converted value to.
                        If None, no rounding will be performed.
        allow_null: Whether to allow a None value as input.
        If True and numeric_value is None, the function returns None.

    Returns:
        The numeric value converted to a decimal, with optional rounding if decimal_places is provided.
        If numeric_value is None and allow_null is True, the function returns None.

    Example:
        num = 3.14159
        dec = to_decimal(num, 2)
        print(dec)  # Output: 3.14

    In the example above, the to_decimal function converts the numeric value 3.14159 to a decimal with 2 decimal places
    and assigns it to the variable dec. The resulting decimal value is then printed.
    """
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


def date_range_overlap(start_1: date, end_1: date, start_2: date, end_2: date):
    """
    Calculates the overlap between two date ranges.

    Args:
        start_1: The start date of the first date range.
        end_1: The end date of the first date range.
        start_2: The start date of the second date range.
        end_2: The end date of the second date range.

    Returns:
        The number of overlapping days between the two date ranges. If there is no overlap, the function returns 0.

    Raises:
        ValueError: If any of the start or end dates are None.

    Example:
        start_1 = date(2022, 1, 1)
        end_1 = date(2022, 1, 15)
        start_2 = date(2022, 1, 10)
        end_2 = date(2022, 1, 20)
        overlap = date_range_overlap(start_1, end_1, start_2, end_2)
        print(overlap)  # Output: 6

    In the example above, the date_range_overlap function calculates the overlap between two date ranges.
    The first date range spans from January 1st to January 15th, and the second date range spans from
    January 10th to January 20th. The function returns the number of overlapping days, which is 6.
    """
    """
    Based on: https://stackoverflow.com/questions/9044084/efficient-date-range-overlap-calculation-in-python
    """
    if None in [start_1, end_1, start_2, end_2]:
        raise ValueError("Cannot check date range overlap if start or end date is None")
    latest_start = max(start_1, start_2)
    earliest_end = min(end_1, end_2)
    delta = (earliest_end - latest_start).days + 1
    return max(0, delta)


def days360(start_date: date, end_date: date):
    """
    Calculates the number of days between two dates using the 360-day method.

    Args:
        start_date: The starting date.
        end_date: The ending date.

    Returns:
        The number of days between the two dates using the 360-day method.

    Raises:
        ValueError: If start_date or end_date is not a date object.

    Example:
        start = date(2022, 1, 1)
        end = date(2022, 2, 15)
        days = days360(start, end)
        print(days)  # Output: 46

    In the example above, the days360 function calculates the number of days between January 1, 2022,
    and February 15, 2022,
    using the 360-day method. The result, 46, is then printed.

    Calculation of the number of months in Helsinki Benefit calculator excel file used
    the days360 function. This is a Python implementation.
    source: https://stackoverflow.com/questions/51832672/pandas-excel-days360-equivalent
    Changes:
    * Added unit tests
    * forced method_eu to always be True.
    """
    METHOD_EU = True

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


def duration_in_months(
    start_date: date, end_date: date, decimal_places: Union[int, None] = None
):
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

    def _get_duration_in_months(self, decimal_places: Union[int, None] = None):
        if self.start_date and self.end_date:
            return duration_in_months(
                self.start_date, self.end_date, decimal_places=decimal_places
            )
        else:
            return None


# defensive programming to avoid infinite loops
DATE_RANGE_MAX_ITERATIONS = 7


def get_date_range_end_with_days360(start_date: date, n_months: int):
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


def hash_file(file: File) -> str:
    """Hash attachment file"""
    # Create a new SHA256 hash object
    sha256 = hashlib.sha256()

    with file.open() as f:
        # Read and update hash in chunks for efficiency
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)

        # Return the hexadecimal representation of the hash
    return sha256.hexdigest()


def get_request_ip_address(request: HttpRequest) -> Union[str, None]:
    """Get the IP address of a request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]

    return request.META.get("REMOTE_ADDR", None)
