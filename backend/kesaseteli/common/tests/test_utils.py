import pytest
from django.core.exceptions import ValidationError

from common.utils import (
    are_same_text_lists,
    are_same_texts,
    has_whitespace,
    is_uppercase,
    normalize_for_string_comparison,
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


@pytest.mark.parametrize(
    "test_value,expected_result",
    [
        (None, "".casefold()),
        (0, "0".casefold()),
        ("", "".casefold()),
        (" ", "".casefold()),
        ("   \t\n", "".casefold()),
        ("Test", "Test".casefold()),
        ("test", "Test".casefold()),
        ("TEST", "Test".casefold()),
        ("  First \t SECOND\n\nThird \n\n  ", "first \t second\n\nthird".casefold()),
    ],
)
def test_normalize_for_string_comparison(test_value, expected_result):
    assert normalize_for_string_comparison(test_value) == expected_result


@pytest.mark.parametrize(
    "test_value_1,test_value_2,expected_result",
    [
        (None, "", True),
        (None, "  ", True),
        ("", None, True),
        ("\n ", None, True),
        (0, "0", True),
        (1, "1", True),
        ("  1   \n", 1, True),
        ("", "  ", True),
        (" ", "  ", True),
        ("test", "Test", True),
        ("Test", "TEST", True),
        ("TeSt", "teST", True),
        (" Testing\n combINATIONS!\t\n ", "testing\n combinations!", True),
        ("testing\n combinations!", " Testing\n combINATIONS!\t\n ", True),
        (" Testing\n combINATIONS!\t\n ", "testinf\n combinations!", False),
        (" Testing\n combINATIONS!\t\n ", "testing \n combinations!", False),
        ("test", "te st", False),
    ],
)
def test_are_same_texts(test_value_1, test_value_2, expected_result):
    assert are_same_texts(test_value_1, test_value_2) == expected_result


@pytest.mark.parametrize(
    "test_value_1,test_value_2,expected_result",
    [
        ([None, "", "  "], ["", "", ""], True),
        ([0, 1, "0", "   1  \n", None, " "], ["0", "1", "0", "1", "", ""], True),
        (["test", "  TEsT", " TEST", "TeST"], ["TEST", "TEST", "TEST", "TEST"], True),
        (["test", "  TEsT", " TE ST", "TeST"], ["TEST", "TEST", "TEST", "TEST"], False),
        ([None, "", "  ", ""], 3 * [""], False),
    ],
)
def test_are_same_text_lists(test_value_1, test_value_2, expected_result):
    assert are_same_text_lists(test_value_1, test_value_2) == expected_result
