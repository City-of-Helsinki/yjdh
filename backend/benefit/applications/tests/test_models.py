import pytest
from applications.enums import AhjoDecision, ApplicationBatchStatus
from applications.models import Application, ApplicationBatch, Employee
from helsinkibenefit.tests.conftest import *  # noqa


def test_application_model(application):
    assert Application.objects.count() == 1
    assert application.employee


def test_employee_model(employee):
    assert Employee.objects.count() == 1
    assert Application.objects.count() == 1
    assert employee.application


def test_application_batch(application_batch):
    assert ApplicationBatch.objects.count() == 1
    assert application_batch.applications.count() == 2
    for application in application_batch.applications.all():
        assert application_batch.proposal_for_decision == application.status
        assert application.batch == application_batch


@pytest.mark.parametrize(
    "status, expected_result",
    [
        (ApplicationBatchStatus.DRAFT, None),
        (ApplicationBatchStatus.AWAITING_AHJO_DECISION, None),
        (ApplicationBatchStatus.DECIDED_ACCEPTED, AhjoDecision.DECIDED_ACCEPTED),
        (ApplicationBatchStatus.DECIDED_REJECTED, AhjoDecision.DECIDED_REJECTED),
        (ApplicationBatchStatus.RETURNED, None),
        (ApplicationBatchStatus.SENT_TO_TALPA, AhjoDecision.DECIDED_ACCEPTED),
        (ApplicationBatchStatus.COMPLETED, AhjoDecision.DECIDED_ACCEPTED),
    ],
)
def test_application_batch_ahjo_decision(application_batch, status, expected_result):
    application_batch.status = status
    application_batch.save()
    assert application_batch.ahjo_decision == expected_result
    assert all(
        [
            application.ahjo_decision == expected_result
            for application in application_batch.applications.all()
        ]
    )


@pytest.mark.parametrize(
    "status, expected_result",
    [
        (ApplicationBatchStatus.DRAFT, True),
        (ApplicationBatchStatus.AWAITING_AHJO_DECISION, False),
        (ApplicationBatchStatus.DECIDED_ACCEPTED, False),
        (ApplicationBatchStatus.DECIDED_REJECTED, False),
        (ApplicationBatchStatus.RETURNED, True),
        (ApplicationBatchStatus.SENT_TO_TALPA, False),
        (ApplicationBatchStatus.COMPLETED, False),
    ],
)
def test_application_batch_modified(application_batch, status, expected_result):
    application_batch.status = status
    application_batch.save()
    assert application_batch.applications_can_be_modified == expected_result
