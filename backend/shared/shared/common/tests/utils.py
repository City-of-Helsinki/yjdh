from datetime import date, datetime, timezone
from functools import partial

from django.conf import settings


def create_finnish_social_security_number(
    birthdate: date, individual_number: int
) -> str:
    """
    Create a Finnish social security number based on birthdate and individual number

    :param birthdate: Date of birth
    :param individual_number: Integer value where 2 <= individual_number <= 999
    :return: Finnish social security number in format <ddmmyyciiis> where
             dd = day of birth with leading zeroes,
             mm = month of birth with leading zeroes,
             yy = year of birth modulo 100 with leading zeroes,
             c = century of birth ("+" = 1800, "-" = 1900, "A" = 2000),
             iii = individual number in range 2–999 with leading zeroes,
             s = checksum value calculated from <ddmmyyiii>.
    :raises ValueError: if not (1800 <= birthdate.year <= 2099)
    :raises ValueError: if not (2 <= individual_number <= 999)
    """
    if not (1800 <= birthdate.year <= 2099):
        raise ValueError("Invalid birthdate year, only years 1800–2099 are supported")
    if not (2 <= individual_number <= 999):
        raise ValueError("Invalid individual number, must be in range 2–999")
    ddmmyy: str = f"{birthdate.day:02}{birthdate.month:02}{birthdate.year % 100:02}"
    iii: str = f"{individual_number:003}"
    ddmmyyiii: str = f"{ddmmyy}{iii}"
    century_char: str = {18: "+", 19: "-", 20: "A"}[birthdate.year // 100]
    checksum_char: str = "0123456789ABCDEFHJKLMNPRSTUVWXY"[int(ddmmyyiii) % 31]
    return f"{ddmmyy}{century_char}{iii}{checksum_char}"


def normalize_whitespace(value: str) -> str:
    """
    Normalize whitespace by compacting inner whitespace to single space and removing
    leading and trailing whitespace.

    For example:
        normalize_whitespace("  1st   2nd    3rd   ") == "1st 2nd 3rd"
    """
    return " ".join(value.split())


def set_setting_to_value_or_del_with_none(setting_name: str, setting_value) -> None:
    """
    Set setting <setting_name> to value <setting_value> if <setting_value> is not None,
    otherwise delete the setting <setting_name> if it exists.
    """
    if setting_value is None:
        if hasattr(settings, setting_name):
            delattr(settings, setting_name)
    else:
        setattr(settings, setting_name, setting_value)


# Create datetime with UTC timezone
utc_datetime = partial(datetime, tzinfo=timezone.utc)
