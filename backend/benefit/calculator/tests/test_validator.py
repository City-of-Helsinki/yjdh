
import pytest

from unittest.mock import MagicMock
from rest_framework import serializers

from calculator.enums import InstalmentStatus
from calculator.api.v1.validators import InstalmentStatusValidator


@pytest.mark.parametrize(
    "from_status, to_status",
    [
        (InstalmentStatus.WAITING,InstalmentStatus.REQUESTED),
        (InstalmentStatus.WAITING,InstalmentStatus.ACCEPTED),
        (InstalmentStatus.WAITING,InstalmentStatus.CANCELLED),
        (InstalmentStatus.ACCEPTED,InstalmentStatus.PAID),
        (InstalmentStatus.ACCEPTED,InstalmentStatus.WAITING),
        (InstalmentStatus.PAID,InstalmentStatus.COMPLETED),
        (InstalmentStatus.CANCELLED,InstalmentStatus.WAITING),
        (InstalmentStatus.CANCELLED,InstalmentStatus.COMPLETED),
        (InstalmentStatus.ERROR_IN_TALPA,InstalmentStatus.WAITING),
        (InstalmentStatus.ERROR_IN_TALPA,InstalmentStatus.ACCEPTED),
        (InstalmentStatus.ERROR_IN_TALPA,InstalmentStatus.PAID),
        (InstalmentStatus.REQUESTED,InstalmentStatus.CANCELLED),
        (InstalmentStatus.REQUESTED,InstalmentStatus.RESPONDED),
        (InstalmentStatus.RESPONDED,InstalmentStatus.ACCEPTED),
        (InstalmentStatus.RESPONDED,InstalmentStatus.CANCELLED),
        (InstalmentStatus.RESPONDED,InstalmentStatus.PENDING),
        (InstalmentStatus.PENDING,InstalmentStatus.ACCEPTED),
        (InstalmentStatus.PENDING,InstalmentStatus.CANCELLED),
    ],
)
def test_instalment_status_transitions(from_status, to_status):
    """Allowed state transitions do not raise validation errors."""
    validator = InstalmentStatusValidator()
    field = MagicMock()
    field.parent.instance = MagicMock()
    field.parent.instance.status = from_status

    validated_status = None
    try:
        validated_status = validator(to_status, field)
    except serializers.ValidationError:
        pytest.fail("Unexpected ValidationError")
    assert validated_status == to_status
