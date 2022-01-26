from datetime import date

from django.core.exceptions import ValidationError
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from stdnum.fi.hetu import is_valid as is_valid_finnish_social_security_number


def has_whitespace(value):
    value_without_whitespace = "".join(value.split())
    return value != value_without_whitespace


def is_uppercase(value):
    """
    Is the value all uppercase? Returns True also if there are no alphabetic characters.
    """
    return value == value.upper()


def validate_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not an uppercase Finnish social
    security number with no whitespace.
    """
    if (
        not is_valid_finnish_social_security_number(value)
        or has_whitespace(value)
        or not is_uppercase(value)
    ):
        raise ValidationError(
            _(
                "%(value)s is not a valid Finnish social security number. "
                "Make sure to have it in uppercase and without whitespace."
            ),
            params={"value": value},
        )


def validate_optional_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not None, an empty string or an
    uppercase Finnish social security number with no whitespace.
    """
    if value is not None and value != "":
        validate_finnish_social_security_number(value)


def getattr_nested(obj, attrs: list):
    """
    Example:
        obj: EmployerApplication
        attrs: ["company", "business_id"]
        returns obj.company.business_id if company exists, else returns ""
    """
    attr = attrs.pop(0)
    value = getattr(obj, attr, "")
    if not value:
        return ""

    if attrs:
        return getattr_nested(value, attrs)
    else:
        if isinstance(value, date):
            value = value.strftime("%d.%m.%Y")
        elif hasattr(obj, f"get_{attr}_display"):
            with translation.override("fi"):
                value = getattr(obj, f"get_{attr}_display")()
        return value
