from functools import partial

import pytest
from django.core.exceptions import ValidationError
from django.db import models

from shared.common.validators import (
    validate_json,
    validate_name,
    validate_optional_json,
    validate_phone_number,
    validate_postcode,
    validate_unique_comma_separated_choices,
)


class TestChoices(models.TextChoices):
    CHOICE_1 = "test_value", "label_1"
    CHOICE_2 = "CamelCase", "label_2"
    CHOICE_3 = "something else", "label_3"


# Remove TestChoices from pytest test collection to prevent PytestCollectionWarning:
# "cannot collect test class 'TestChoices' because it has a __new__ constructor"
TestChoices.__test__ = False


def get_invalid_postcode_values():
    return [
        None,
        "",
        " ",
        " " * 2,
        " " * 3,
        " " * 4,
        " " * 5,
        " " * 6,
        " " * 7,
        " " * 8,
        " " * 9,
        "0",
        "0" * 2,
        "0" * 3,
        "0" * 4,
        # "00000" is omitted because it is a valid Finnish postcode
        "0" * 6,
        "0" * 7,
        "0" * 8,
        "0" * 9,
        "123456789",
        " 1234",
        "1234 ",
        "12 34",
        "5",
        "33",
        "70",
        "427",
        "812",
        "3812",
        "5233",
        "213306",
        "879361",
    ]


def get_valid_json_test_values():
    return [
        "8",
        "3.14",
        '"a"',
        "{}",
        "false",
        "true",
        "null",
        '["a", "b"]',
        "[1, 2, 3]",
        '[false, 1, null, true, "a", {}, {"b": 3}]',
        '{"a": 123}',
        '{"a": 7, "b": {"c": {"d": [true, false, null, 123, "e"]}}, "test": 1.618}',
    ]


def get_invalid_json_test_values():
    return [
        " ",
        "3,14",
        "False",
        "FALSE",
        "True",
        "TRUE",
        "None",
        "NONE",
        "Null",
        "NULL",
        "a",
        "{a}",
        '{"a"}',
        "{'a': 123}",
        "{{}}",
    ]


def get_empty_test_values():
    return [None, ""]


# Based on frontend/shared/src/__tests__/constants.test.ts
@pytest.mark.parametrize(
    "value",
    [
        # should match Finnish phone numbers
        "040 084 1684",
        "050 135 6339",
        "0505-551-9417",
        "04575553503",
        "+358-505-551-4995",
        "+3585005551193",
    ],
)
def test_validate_phone_number_with_valid_input(value):
    validate_phone_number(value)


# Based on frontend/shared/src/__tests__/constants.test.ts
@pytest.mark.parametrize(
    "value",
    [
        # should not match non-Finish phone numbers
        "+1-800-555-1212",
        "+44-20-7011-5555",
    ],
)
def test_validate_phone_number_with_invalid_input(value):
    with pytest.raises(ValidationError):
        validate_phone_number(value)


# Based on frontend/shared/src/__tests__/constants.test.ts
@pytest.mark.parametrize(
    "value",
    [
        # should match Finnish first names, last names and full names
        "Helinä",
        "Aalto",
        "Kalle Väyrynen",
        "Janne Ö",
        # should match Swedish first names, last names and full names
        "Gun-Britt",
        "Lindén",
        "Ögge Ekström",
        # should match English first names, last names and full names
        "Eric",
        "Bradtke",
        "Daniela O'Brian",
    ],
)
def test_validate_name_with_valid_input(value):
    validate_name(value)


# Based on frontend/shared/src/__tests__/constants.test.ts
@pytest.mark.parametrize(
    "value",
    [
        # should fail to match invalid characters
        "!@#$%^&*()_+-=[]{}|;':\",./<>?",
        # should fail to match digits
        "1234567890",
    ],
)
def test_validate_name_with_invalid_input(value):
    with pytest.raises(ValidationError):
        validate_name(value)


@pytest.mark.parametrize(
    "value",
    [
        "00000",
        "11470",
        "23407",
        "25584",
        "43853",
        "45948",
        "57694",
        "61764",
        "83746",
        "85415",
        "96121",
        "99999",
    ],
)
def test_validate_postcode_with_valid_input(value):
    validate_postcode(value)


@pytest.mark.parametrize("value", get_invalid_postcode_values())
def test_validate_postcode_with_invalid_input(value):
    with pytest.raises(ValidationError):
        validate_postcode(value)


@pytest.mark.parametrize("value", get_valid_json_test_values())
def test_validate_json_with_valid_input(value):
    validate_json(value)


@pytest.mark.parametrize(
    "value", get_invalid_json_test_values() + get_empty_test_values()
)
def test_validate_json_with_invalid_input(value):
    with pytest.raises(ValidationError):
        validate_json(value)


@pytest.mark.parametrize(
    "value", get_valid_json_test_values() + get_empty_test_values()
)
def test_validate_optional_json_with_valid_input(value):
    validate_optional_json(value)


@pytest.mark.parametrize("value", get_invalid_json_test_values())
def test_validate_optional_json_with_invalid_input(value):
    with pytest.raises(ValidationError):
        validate_optional_json(value)


@pytest.mark.parametrize(
    "values_string,allow_null,allow_blank,expect_validation_error",
    [
        # Normal valid cases
        ("test_value", False, False, False),
        ("CamelCase", False, False, False),
        ("something else", False, False, False),
        ("test_value,CamelCase", False, False, False),
        ("something else,CamelCase,test_value", False, False, False),
        ("test_value,something else,CamelCase", False, False, False),
        ("CamelCase,test_value,something else", False, False, False),
        # Whitespace/empty string cases without allow_blank
        (" ", False, False, True),
        ("test_value,", False, False, True),
        (",", False, False, True),
        (" something else", False, False, True),
        ("something else ", False, False, True),
        ("something  else", False, False, True),
        ("test_value ", False, False, True),
        (" test_value", False, False, True),
        (" test_value ", False, False, True),
        ("\tCamelCase\n  \n", False, False, True),
        ("test_value,,CamelCase", False, False, True),
        # Value not in choices
        ("invalid_value", False, False, True),
        ("test_value,invalid_value,CamelCase", False, False, True),
        # Duplicates
        ("test_value,test_value", False, False, True),
        ("test_value,CamelCase,something else,CamelCase", False, False, True),
        ("test_value,something else,something else,CamelCase", False, False, True),
        ("test_value,test_value,CamelCase,CamelCase", False, False, True),
        ("test_value,test_value,CamelCase,test_value,CamelCase", False, False, True),
        # Wrong types
        (1, False, False, True),
        (None, False, False, True),
        (3.14, False, False, True),
        (TestChoices, False, False, True),
        (["test_value"], False, False, True),
        ({"test_value"}, False, False, True),
        ({"test_value": True}, False, False, True),
        (("test_value",), False, False, True),
        (("test_value,CamelCase",), False, False, True),
        (("test_value", "CamelCase"), False, False, True),
        # Testing allow_null and allow_blank combinations
        ("", False, False, True),
        ("", False, True, False),
        ("", True, False, True),
        ("", True, True, False),
        (None, False, False, True),
        (None, False, True, True),
        (None, True, False, False),
        (None, True, True, False),
        (" ", False, False, True),
        (" ", False, True, True),
        (" ", True, False, True),
        (" ", True, True, True),
        ("\n", False, False, True),
        ("\n", False, True, True),
        ("\n", True, False, True),
        ("\n", True, True, True),
        ([], False, False, True),
        ([], False, True, True),
        ([], True, False, True),
        ([], True, True, True),
        (",", False, False, True),
        (",", False, True, True),
        (",", True, False, True),
        (",", True, True, True),
        (" ,", False, False, True),
        (" ,", False, True, True),
        (" ,", True, False, True),
        (" ,", True, True, True),
        ("test_value,,CamelCase", False, False, True),
        ("test_value,,CamelCase", False, True, True),
        ("test_value,,CamelCase", True, False, True),
        ("test_value,,CamelCase", True, True, True),
        ("test_value, ,CamelCase", False, False, True),
        ("test_value, ,CamelCase", False, True, True),
        ("test_value, ,CamelCase", True, False, True),
        ("test_value, ,CamelCase", True, True, True),
    ],
)
def test_validate_unique_comma_separated_choices(
    values_string, allow_null, allow_blank, expect_validation_error
):
    test_func = partial(
        validate_unique_comma_separated_choices,
        values_string=values_string,
        choices_class=TestChoices,
        allow_null=allow_null,
        allow_blank=allow_blank,
    )

    if expect_validation_error:
        with pytest.raises(ValidationError):
            test_func()
    else:
        test_func()
