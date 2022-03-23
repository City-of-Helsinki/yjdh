import json
from typing import Type

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db.models import Choices

# These regular expressions should function similarly as the regular expressions in the
# frontend's constants.ts:

# \d in Javascript matches [0-9] and has been replaced:
PHONE_NUMBER_REGEX = (
    r"^((\+358[ -]*)+|"
    r"(\([0-9]{2,3}\)[ -]*)|"
    r"([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$"
)

# \d in Javascript matches [0-9] and has been replaced:
POSTAL_CODE_REGEX = r"^[0-9]{5}$"

# \w in Javascript matches [A-Za-z0-9_] and has been replaced:
NAMES_REGEX = r"^[A-Za-z0-9_',.ÄÅÖäåö-][^\d!#$%&()*+/:;<=>?@[\\\]_{|}~¡¿÷ˆ]+$"

# Please note that using a RegexValidator in a Django model field hardcodes the used
# regular expression into the model and its migration but using a function does not.
PHONE_NUMBER_REGEX_VALIDATOR = RegexValidator(PHONE_NUMBER_REGEX)
POSTAL_CODE_REGEX_VALIDATOR = RegexValidator(POSTAL_CODE_REGEX)
NAMES_REGEX_VALIDATOR = RegexValidator(NAMES_REGEX)


def validate_phone_number(phone_number) -> None:
    """
    Function wrapper for PHONE_NUMBER_REGEX_VALIDATOR. If used as a validator in a
    Django model's field this does not hardcode the underlying regular expression into
    the migration nor into the model.

    Raise ValidationError if the given value doesn't pass PHONE_NUMBER_REGEX_VALIDATOR.
    """
    PHONE_NUMBER_REGEX_VALIDATOR(phone_number)


def validate_postcode(postcode) -> None:
    """
    Function wrapper for POSTAL_CODE_REGEX_VALIDATOR. If used as a validator in a
    Django model's field this does not hardcode the underlying regular expression into
    the migration nor into the model.

    Raise ValidationError if the given value doesn't pass POSTAL_CODE_REGEX_VALIDATOR.
    """
    POSTAL_CODE_REGEX_VALIDATOR(postcode)


def validate_name(name) -> None:
    """
    Function wrapper for NAMES_REGEX_VALIDATOR. If used as a validator in a
    Django model's field this does not hardcode the underlying regular expression into
    the migration nor into the model.

    Raise ValidationError if the given value doesn't pass NAMES_REGEX_VALIDATOR.
    """
    NAMES_REGEX_VALIDATOR(name)


def validate_json(value) -> None:
    """
    Raise ValidationError if the given value can not be interpreted as valid JSON.
    """
    try:
        json.loads(value)
    except (json.decoder.JSONDecodeError, TypeError):
        raise ValidationError("Given value is not JSON")


def validate_optional_json(value) -> None:
    """
    Raise a ValidationError if the given value is not None, an empty string or can not
    be interpreted as valid JSON.
    """
    if value is not None and value != "":
        validate_json(value)


def validate_unique_comma_separated_choices(
    values_string,
    choices_class: Type[Choices],
    allow_null: bool,
    allow_blank: bool,
) -> None:
    """
    Validate values_string as unique comma separated choices from choices_class.

    :param values_string: Input string containing the comma separated choices
    :param choices_class: Type, not an instance, of class derived from Choices
    :param allow_null: Is values_string allowed to be None?
    :param allow_blank: Is values_string allowed to be an empty string i.e. ""?

    :raises ValidationError: If values_string is None and allow_null isn't True, or if
    values_string is an empty string and allow_blank isn't True, otherwise if
    values_string can't be split into parts on commas, or if the split parts aren't
    unique, or if the split parts aren't values from choices_class.values.
    """
    if values_string is None:
        if allow_null:
            return
        raise ValidationError("Forbidden None value")

    if values_string == "":
        if allow_blank:
            return
        raise ValidationError("Forbidden empty string value")

    try:
        values_list = values_string.split(",")
    except (AttributeError, TypeError, ValueError):
        raise ValidationError("Unable to split input value into parts on commas")

    values_set = set(values_list)

    if len(values_set) != len(values_list):
        raise ValidationError("Duplicate values in comma separated values")

    if not values_set.issubset(choices_class.values):
        raise ValidationError("Invalid choices in comma separated values")
