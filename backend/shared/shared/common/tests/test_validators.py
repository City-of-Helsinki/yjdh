import pytest
from django.core.exceptions import ValidationError

from shared.common.validators import validate_name, validate_phone_number


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
