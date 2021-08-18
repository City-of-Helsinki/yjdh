import pytest
from applications.enums import ApplicationBatchStatus
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
    assert application_batch.applications.count() == 1
    for application in application_batch.applications.all():
        assert application_batch.proposal_for_decision == application.status
        assert application.batch == application_batch


@pytest.mark.parametrize(
    "status, expected_result",
    [
        (ApplicationBatchStatus.DRAFT, True),
        (ApplicationBatchStatus.AWAITING_AHJO_DECISION, False),
        (ApplicationBatchStatus.DECIDED, False),
        (ApplicationBatchStatus.RETURNED, True),
        (ApplicationBatchStatus.SENT_TO_TALPA, False),
        (ApplicationBatchStatus.COMPLETED, False),
    ],
)
def test_application_batch_modified(application_batch, status, expected_result):
    application_batch.status = status
    application_batch.save()
    assert application_batch.applications_can_be_modified == expected_result
