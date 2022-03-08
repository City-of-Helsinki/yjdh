import pytest
from django.core.exceptions import ValidationError

from common.utils import (
    has_whitespace,
    is_uppercase,
    normalize_whitespace,
    validate_finnish_social_security_number,
    validate_optional_finnish_social_security_number,
)


def get_empty_values():
    return [None, ""]


@pytest.mark.parametrize(
    "test_value,expected_result",
    [
        ("a", False),
        (" a", True),
        ("a ", True),
        (" a ", True),
        ("a b", True),
        (" a b", True),
        ("a b ", True),
        (" a b ", True),
        ("a\n", True),
        ("a\tb", True),
        (" a b   c  \t\nd", True),
    ],
)
def test_has_whitespace(test_value, expected_result):
    assert has_whitespace(test_value) == expected_result


@pytest.mark.parametrize(
    "test_value,expected_result",
    [
        ("test", False),
        ("Test", False),
        ("TEST", True),
        ("1234", True),
        ("EDWARD THE 5TH, SR.", True),
    ],
)
def test_is_uppercase(test_value, expected_result):
    assert is_uppercase(test_value) == expected_result


@pytest.mark.parametrize(
    "test_value,expected_result",
    [
        ("Test", "Test"),
        ("  Test", "Test"),
        ("Test  ", "Test"),
        ("  Test    ", "Test"),
        ("Te   st", "Te st"),
        ("T  e s    t", "T e s t"),
        ("   T     e  s  t    ", "T e s t"),
        ("\n \tT\tes\nt  \ni\nn\t\n   g  ", "T es t i n g"),
    ],
)
def test_normalize_whitespace(test_value, expected_result):
    assert normalize_whitespace(test_value) == expected_result


@pytest.mark.parametrize("test_value", get_empty_values())
def test_validate_finnish_social_security_number_invalid_empty(test_value):
    with pytest.raises(ValidationError):
        validate_finnish_social_security_number(test_value)


@pytest.mark.parametrize("test_value", get_empty_values())
def test_validate_optional_finnish_social_security_number_valid_empty(test_value):
    validate_optional_finnish_social_security_number(test_value)
