from datetime import date

import pytest
import stdnum.exceptions
from django.db.models import Q

from shared.common.utils import (
    _ALWAYS_FALSE_Q_FILTER,
    any_of_q_filter,
    set_setting_to_value_or_del_with_none,
    social_security_number_birthdate,
)

_TEST_SETTING_NAMES = [
    "INEXISTENT_SETTING",
    "EXISTING_TRUE_SETTING",
    "EXISTING_FALSE_SETTING",
]


@pytest.fixture
def _test_settings(settings):
    settings.EXISTING_TRUE_SETTING = True
    settings.EXISTING_FALSE_SETTING = False
    if hasattr(settings, "INEXISTENT_SETTING"):
        delattr(settings, "INEXISTENT_SETTING")
    return settings


def test_test_settings(_test_settings):
    assert getattr(_test_settings, "EXISTING_TRUE_SETTING") is True
    assert getattr(_test_settings, "EXISTING_FALSE_SETTING") is False
    assert not hasattr(_test_settings, "INEXISTENT_SETTING")


@pytest.mark.parametrize("setting_name", _TEST_SETTING_NAMES)
def test_setting_deletion_with_set_setting_to_value_or_del_with_none(
    _test_settings, setting_name
):
    set_setting_to_value_or_del_with_none(setting_name, None)
    assert not hasattr(_test_settings, setting_name)


@pytest.mark.parametrize(
    "setting_name,setting_value",
    [
        (setting_name, setting_value)
        for setting_name in _TEST_SETTING_NAMES
        for setting_value in [False, True, 1, "test"]
    ],
)
def test_setting_value_with_set_setting_to_value_or_del_with_none(
    _test_settings, setting_name, setting_value
):
    set_setting_to_value_or_del_with_none(setting_name, setting_value)
    assert getattr(_test_settings, setting_name) == setting_value


@pytest.mark.parametrize(
    "input_kwargs,expected_q_filter",
    [
        ({}, _ALWAYS_FALSE_Q_FILTER),
        ({"a": 1}, Q(a=1)),
        ({"a__lt": 1}, Q(a__lt=1)),
        ({"a": 1, "b": "test"}, Q(a=1) | Q(b="test")),
        ({"a": 1, "b": "test", "c": None}, Q(a=1) | Q(b="test") | Q(c=None)),
        ({"a__gte": 1, "b__isnull": True}, Q(a__gte=1) | Q(b__isnull=True)),
        ({"a": 1, "b__lt": 2, "not__c__gte": 3}, Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3)),
    ],
)
def test_any_of_q_filter(input_kwargs, expected_q_filter):
    assert any_of_q_filter(**input_kwargs) == expected_q_filter


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value,expected_result",
    [
        ("010203-1230", date(year=1903, month=2, day=1)),
        ("121212A899H", date(year=2012, month=12, day=12)),
        ("111111-002V", date(year=1911, month=11, day=11)),
        ("111111-111C", date(year=1911, month=11, day=11)),
        ("111111A111C", date(year=2011, month=11, day=11)),
        ("111111-900U", date(year=1911, month=11, day=11)),
        ("111111-9991", date(year=1911, month=11, day=11)),
        ("300522A0024", date(year=2022, month=5, day=30)),
        # Case-insensitive and leading/trailing whitespace allowed
        ("  111111a111c   ", date(year=2011, month=11, day=11)),
    ],
)
def test_valid_social_security_number_birthdate(test_value, expected_result):
    assert social_security_number_birthdate(test_value) == expected_result


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        "111111-000T",  # Invalid number after dash, must be 002-999
        "111111-001U",  # Invalid number after dash, must be 002-999
        "30052 2A0025",  # Inner whitespace
        "111111 -111x",  # Invalid checksum, inner whitespace
        "320522A002T",  # Invalid date because no 32 days in any month
        "311322A002E",  # Invalid date because no 13 months in any year
        # Invalid checksum
        "111111-111X",  # "111111-111C" would be valid
        "111111A111W",  # "111111A111C" would be valid
        "010203-123A",  # "010203-1230" would be valid
        "121212A899F",  # "121212A899H" would be valid
        "111111-900X",  # "111111-900U" would be valid
        "111111-9996",  # "111111-9991" would be valid
        "300522A0025",  # "300522A0024" would be valid
    ],
)
def test_invalid_social_security_number_birthdate(test_value):
    with pytest.raises(stdnum.exceptions.ValidationError):
        social_security_number_birthdate(test_value)
