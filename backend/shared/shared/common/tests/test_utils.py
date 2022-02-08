import pytest
from django.db.models import Q

from shared.common.utils import _ALWAYS_FALSE_Q_FILTER, any_of_q_filter


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
