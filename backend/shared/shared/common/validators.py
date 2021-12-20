from django.core.validators import RegexValidator

# These regular expressions should function similarly as the regular expressions in the
# frontend's constants.ts:

# \d in Javascript matches [0-9] and has been replaced:
PHONE_NUMBER_REGEX = (
    r"^((\+358[ -]*)+|"
    r"(\([0-9]{2,3}\)[ -]*)|"
    r"([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$"
)

# \w in Javascript matches [A-Za-z0-9_] and has been replaced:
NAMES_REGEX = r"^[A-Za-z0-9_',.ÄÅÖäåö-][^\d!#$%&()*+/:;<=>?@[\\\]_{|}~¡¿÷ˆ]+$"

# Please note that using a RegexValidator in a Django model field hardcodes the used
# regular expression into the model and its migration but using a function does not.
PHONE_NUMBER_REGEX_VALIDATOR = RegexValidator(PHONE_NUMBER_REGEX)
NAMES_REGEX_VALIDATOR = RegexValidator(NAMES_REGEX)


def validate_phone_number(phone_number) -> None:
    """
    Function wrapper for PHONE_NUMBER_REGEX_VALIDATOR. If used as a validator in a
    Django model's field this does not hardcode the underlying regular expression into
    the migration nor into the model.

    Raise ValidationError if the given value doesn't pass PHONE_NUMBER_REGEX_VALIDATOR.
    """
    PHONE_NUMBER_REGEX_VALIDATOR(phone_number)


def validate_name(name) -> None:
    """
    Function wrapper for NAMES_REGEX_VALIDATOR. If used as a validator in a
    Django model's field this does not hardcode the underlying regular expression into
    the migration nor into the model.

    Raise ValidationError if the given value doesn't pass NAMES_REGEX_VALIDATOR.
    """
    NAMES_REGEX_VALIDATOR(name)
