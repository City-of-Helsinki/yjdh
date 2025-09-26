from datetime import date

import pytest
import stdnum.exceptions
from django.db.models import Q

from shared.common.tests.utils import (
    create_finnish_social_security_number,
    set_setting_to_value_or_del_with_none,
)
from shared.common.utils import (
    _ALWAYS_FALSE_Q_FILTER,
    any_of_q_filter,
    social_security_number_birthdate,
    validate_finnish_social_security_number,
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
    assert _test_settings.EXISTING_TRUE_SETTING is True
    assert _test_settings.EXISTING_FALSE_SETTING is False
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


@pytest.mark.parametrize(
    "expected_result,birthdate,century_variant,individual_number",
    [
        ("010100+002H", date(year=1800, month=1, day=1), 0, 2),
        ("010100+002H", date(year=1800, month=1, day=1), 99, 2),
        ("010203-1230", date(year=1903, month=2, day=1), 0, 123),
        ("121212A899H", date(year=2012, month=12, day=12), 0, 899),
        ("121212A899H", date(year=2012, month=12, day=12), 30, 899),
        ("121212B899H", date(year=2012, month=12, day=12), 1, 899),
        ("121212B899H", date(year=2012, month=12, day=12), 31, 899),
        ("121212C899H", date(year=2012, month=12, day=12), 2, 899),
        ("121212C899H", date(year=2012, month=12, day=12), 32, 899),
        ("121212D899H", date(year=2012, month=12, day=12), 3, 899),
        ("121212D899H", date(year=2012, month=12, day=12), 33, 899),
        ("121212E899H", date(year=2012, month=12, day=12), 4, 899),
        ("121212E899H", date(year=2012, month=12, day=12), 34, 899),
        ("121212F899H", date(year=2012, month=12, day=12), 5, 899),
        ("121212F899H", date(year=2012, month=12, day=12), 35, 899),
        ("111111-002V", date(year=1911, month=11, day=11), 0, 2),
        ("111111-111C", date(year=1911, month=11, day=11), 0, 111),
        ("111111Y111C", date(year=1911, month=11, day=11), 1, 111),
        ("111111Y111C", date(year=1911, month=11, day=11), 61, 111),
        ("111111X111C", date(year=1911, month=11, day=11), 2, 111),
        ("111111X111C", date(year=1911, month=11, day=11), 62, 111),
        ("111111W111C", date(year=1911, month=11, day=11), 3, 111),
        ("111111W111C", date(year=1911, month=11, day=11), 63, 111),
        ("111111V111C", date(year=1911, month=11, day=11), 4, 111),
        ("111111V111C", date(year=1911, month=11, day=11), 64, 111),
        ("111111U111C", date(year=1911, month=11, day=11), 5, 111),
        ("111111U111C", date(year=1911, month=11, day=11), 65, 111),
        ("111111A111C", date(year=2011, month=11, day=11), 0, 111),
        ("111111-900U", date(year=1911, month=11, day=11), 0, 900),
        ("111111-9991", date(year=1911, month=11, day=11), 0, 999),
        ("300522A0024", date(year=2022, month=5, day=30), 0, 2),
        ("300522B0024", date(year=2022, month=5, day=30), 1, 2),
        ("311299A999E", date(year=2099, month=12, day=31), 0, 999),
        ("311299F999E", date(year=2099, month=12, day=31), 5, 999),
        # Go through all the possible checksum characters & before first & beyond last
        ("111111B098Y", date(year=2011, month=11, day=11), 1, 98),
        ("111111B0990", date(year=2011, month=11, day=11), 1, 99),
        ("111111B1001", date(year=2011, month=11, day=11), 1, 100),
        ("111111B1012", date(year=2011, month=11, day=11), 1, 101),
        ("111111B1023", date(year=2011, month=11, day=11), 1, 102),
        ("111111B1034", date(year=2011, month=11, day=11), 1, 103),
        ("111111B1045", date(year=2011, month=11, day=11), 1, 104),
        ("111111B1056", date(year=2011, month=11, day=11), 1, 105),
        ("111111B1067", date(year=2011, month=11, day=11), 1, 106),
        ("111111B1078", date(year=2011, month=11, day=11), 1, 107),
        ("111111B1089", date(year=2011, month=11, day=11), 1, 108),
        ("111111B109A", date(year=2011, month=11, day=11), 1, 109),
        ("111111B110B", date(year=2011, month=11, day=11), 1, 110),
        ("111111B111C", date(year=2011, month=11, day=11), 1, 111),
        ("111111B112D", date(year=2011, month=11, day=11), 1, 112),
        ("111111B113E", date(year=2011, month=11, day=11), 1, 113),
        ("111111B114F", date(year=2011, month=11, day=11), 1, 114),
        ("111111B115H", date(year=2011, month=11, day=11), 1, 115),
        ("111111B116J", date(year=2011, month=11, day=11), 1, 116),
        ("111111B117K", date(year=2011, month=11, day=11), 1, 117),
        ("111111B118L", date(year=2011, month=11, day=11), 1, 118),
        ("111111B119M", date(year=2011, month=11, day=11), 1, 119),
        ("111111B120N", date(year=2011, month=11, day=11), 1, 120),
        ("111111B121P", date(year=2011, month=11, day=11), 1, 121),
        ("111111B122R", date(year=2011, month=11, day=11), 1, 122),
        ("111111B123S", date(year=2011, month=11, day=11), 1, 123),
        ("111111B124T", date(year=2011, month=11, day=11), 1, 124),
        ("111111B125U", date(year=2011, month=11, day=11), 1, 125),
        ("111111B126V", date(year=2011, month=11, day=11), 1, 126),
        ("111111B127W", date(year=2011, month=11, day=11), 1, 127),
        ("111111B128X", date(year=2011, month=11, day=11), 1, 128),
        ("111111B129Y", date(year=2011, month=11, day=11), 1, 129),
        ("111111B1300", date(year=2011, month=11, day=11), 1, 130),
    ],
)
def test_valid_create_finnish_social_security_number(
    expected_result: str, birthdate: date, century_variant: int, individual_number: int
):
    assert validate_finnish_social_security_number(
        expected_result, allow_temporary=True
    )
    assert (
        create_finnish_social_security_number(
            birthdate, century_variant, individual_number
        )
        == expected_result
    )


@pytest.mark.parametrize(
    "birthdate",
    [
        date(year=1800, month=1, day=1),
        date(year=1934, month=10, day=25),
        date(year=2022, month=5, day=30),
        date(year=2023, month=8, day=19),
        date(year=2099, month=12, day=31),
    ],
)
def test_valid_consecutive_create_finnish_social_security_number(birthdate: date):
    """
    Testing consecutive social security numbers for validity to ensure all
    their parts are calculated correctly, including the checksum (i.e. the last
    character).
    """
    for century_variant in range(6):
        for individual_number in range(2, 900):
            result = create_finnish_social_security_number(
                birthdate, century_variant, individual_number
            )
            assert len(result) == 11
            assert validate_finnish_social_security_number(result, allow_temporary=True)
            individual_number_from_result: int = int(result[-4:-1])
            assert individual_number_from_result == individual_number
            assert social_security_number_birthdate(result) == birthdate


@pytest.mark.parametrize(
    "birthdate,century_variant,individual_number",
    [
        (date(year=1799, month=12, day=31), 0, 2),  # Birth year < 1800
        (date(year=2100, month=1, day=1), 0, 2),  # Birth year > 2099
        (date(year=2000, month=1, day=1), -1, 0),  # Century variant < 0
        (date(year=2000, month=1, day=1), 0, -1),  # Individual number < 2
        (date(year=2000, month=1, day=1), 0, 0),  # Individual number < 2
        (date(year=2000, month=1, day=1), 0, 1),  # Individual number < 2
        (date(year=2000, month=1, day=1), 0, 1000),  # Individual number > 999
    ],
)
def test_invalid_create_finnish_social_security_number(
    birthdate: date, century_variant: int, individual_number: int
):
    with pytest.raises(ValueError):
        assert create_finnish_social_security_number(
            birthdate, century_variant, individual_number
        )


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
        "111111/111C",  # Invalid century character
        "111111G111C",  # Invalid century character
        "111111M111C",  # Invalid century character
        "111111R111C",  # Invalid century character
        "111111T111C",  # Invalid century character
        "111111Z111C",  # Invalid century character
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
