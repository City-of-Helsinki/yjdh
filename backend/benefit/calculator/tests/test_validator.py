import pytest

from unittest.mock import MagicMock
from rest_framework import serializers
from datetime import datetime

from calculator.enums import InstalmentStatus
from calculator.api.v1.validators import InstalmentStatusValidator

from calculator.models import Calculation, Instalment
from calculator.tests.factories import CalculationFactory

@pytest.mark.parametrize(
    "from_status, to_status",
    [
        (InstalmentStatus.WAITING, InstalmentStatus.REQUESTED),
        (InstalmentStatus.WAITING, InstalmentStatus.ACCEPTED),
        (InstalmentStatus.WAITING, InstalmentStatus.CANCELLED),
        (InstalmentStatus.WAITING, InstalmentStatus.PENDING),
        (InstalmentStatus.ACCEPTED, InstalmentStatus.PAID),
        (InstalmentStatus.ACCEPTED, InstalmentStatus.WAITING),
        (InstalmentStatus.PAID, InstalmentStatus.COMPLETED),
        (InstalmentStatus.CANCELLED, InstalmentStatus.WAITING),
        (InstalmentStatus.CANCELLED, InstalmentStatus.COMPLETED),
        (InstalmentStatus.ERROR_IN_TALPA, InstalmentStatus.WAITING),
        (InstalmentStatus.ERROR_IN_TALPA, InstalmentStatus.ACCEPTED),
        (InstalmentStatus.ERROR_IN_TALPA, InstalmentStatus.PAID),
        (InstalmentStatus.REQUESTED, InstalmentStatus.ACCEPTED),
        (InstalmentStatus.REQUESTED, InstalmentStatus.CANCELLED),
        (InstalmentStatus.REQUESTED, InstalmentStatus.RESPONDED),
        (InstalmentStatus.REQUESTED, InstalmentStatus.PENDING),
        (InstalmentStatus.RESPONDED, InstalmentStatus.ACCEPTED),
        (InstalmentStatus.RESPONDED, InstalmentStatus.CANCELLED),
        (InstalmentStatus.RESPONDED, InstalmentStatus.PENDING),
        (InstalmentStatus.PENDING, InstalmentStatus.ACCEPTED),
        (InstalmentStatus.PENDING, InstalmentStatus.CANCELLED),
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


@pytest.mark.parametrize(
    "to_date, expected_due_date, expected_status_code",
    [
        ("2026-03-26", "25.03.2026", 200),   # Valid date change
        ("2026-01-01", "15.05.2026", 400),    # Date cannot be before first instalment due date; unchanged
        ("2026-06-30", "15.05.2026", 400),   # Date cannot be after current due date; unchanged
    ],
)
@pytest.mark.django_db
def test_instalment_date_change(to_date, expected_due_date, expected_status_code, handler_api_client):
    """Test date changes for instalments."""
    calculation = CalculationFactory()
    calculation.save()

    due_date_1 = datetime.strptime("01.02.2026", "%d.%m.%Y")
    Instalment.objects.create(
        calculation=calculation,
        amount=9000,
        instalment_number=1,
        status=InstalmentStatus.PAID,
        due_date=due_date_1,
    )
    due_date_2 = datetime.strptime("15.05.2026", "%d.%m.%Y")
    instalment_2 = Instalment.objects.create(
        calculation=calculation,
        amount=1000,
        instalment_number=2,
        status=InstalmentStatus.ACCEPTED,
        due_date=due_date_2,
    )

    url = f"/v1/handlerinstalments/{instalment_2.id}/"
    data = {"due_date": to_date}
    response = handler_api_client.patch(url, data, format="json")

    assert response.status_code == expected_status_code

    instalment_2.refresh_from_db()
    assert instalment_2.due_date.strftime("%d.%m.%Y") == expected_due_date
