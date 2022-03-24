from functools import partial

import pytest
from django.core.exceptions import ValidationError

from applications.api.v1.validators import validate_additional_info_user_reasons
from applications.enums import AdditionalInfoUserReason


@pytest.mark.parametrize(
    "input_reasons_list,allow_empty_list,expect_validation_error",
    [
        # Normal valid cases
        ([AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], False, False),
        ([AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE.value], False, False),
        (
            [AdditionalInfoUserReason.OTHER, AdditionalInfoUserReason.UNLISTED_SCHOOL],
            False,
            False,
        ),
        (
            [
                AdditionalInfoUserReason.OTHER,
                AdditionalInfoUserReason.UNLISTED_SCHOOL,
                AdditionalInfoUserReason.MOVING_TO_HELSINKI,
            ],
            False,
            False,
        ),
        (list(AdditionalInfoUserReason.values), False, False),
        (list(AdditionalInfoUserReason.values), True, False),
        # Test allow_empty_list combinations
        ([], False, True),
        ([], True, False),
        # Invalid values in list
        (["invalid_value"], False, True),
        (["invalid_value", AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], False, True),
        (list(AdditionalInfoUserReason.values) + ["invalid_value"], False, True),
        (["invalid_value"] + list(AdditionalInfoUserReason.values), False, True),
        ([[], AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], False, True),
        ([[], AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], True, True),
        (["", AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], False, True),
        (["", AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], True, True),
        # Duplicates
        (
            list(AdditionalInfoUserReason.values) + [AdditionalInfoUserReason.OTHER],
            False,
            True,
        ),
        (2 * [AdditionalInfoUserReason.OTHER], False, True),
        (2 * [AdditionalInfoUserReason.OTHER.value], False, True),
        # Wrong types
        ("", False, True),
        ("", True, True),
        (set(), False, True),
        (set(), True, True),
        (tuple(), False, True),
        (tuple(), True, True),
        (1, False, True),
        (3.14, False, True),
        (AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE, False, True),
        ((AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE,), False, True),
        ({AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE}, False, True),
        ({AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE: True}, False, True),
    ],
)
def test_validate_additional_info_user_reasons(
    input_reasons_list, allow_empty_list, expect_validation_error
):
    test_func = partial(
        validate_additional_info_user_reasons,
        input_reasons_list=input_reasons_list,
        allow_empty_list=allow_empty_list,
    )

    if expect_validation_error:
        with pytest.raises(ValidationError):
            test_func()
    else:
        test_func()
