import json

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

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
