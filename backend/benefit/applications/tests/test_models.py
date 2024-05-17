from datetime import date

import pytest

from applications.enums import AhjoDecision, ApplicationBatchStatus
from applications.exceptions import BatchCompletionRequiredFieldsError
from applications.models import AhjoSetting, Application, ApplicationBatch, Employee
from applications.services.ahjo_decision_service import AhjoDecisionDetails
from applications.tests.factories import BaseApplicationBatchFactory
from applications.tests.test_application_batch_api import (
    fill_as_valid_batch_completion_and_save,
)
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


@pytest.fixture
def p2p_settings():
    return AhjoSetting.objects.create(
        name="p2p_settings",
        data={
            "acceptor_name": "Test Test",
            "inspector_name": "Test Inspector",
            "inspector_email": "inspector@test.test",
        },
    )


@pytest.fixture
def decision_details():
    return AhjoDecisionDetails(
        decision_maker_name="Test Test",
        decision_maker_title="Test Title",
        section_of_the_law="16 §",
        decision_date=date.today(),
    )


@pytest.mark.parametrize(
    "batch_status, proposal_for_decision",
    [
        (ApplicationBatchStatus.DECIDED_ACCEPTED, AhjoDecision.DECIDED_ACCEPTED),
        (ApplicationBatchStatus.DECIDED_REJECTED, AhjoDecision.DECIDED_REJECTED),
    ],
)
def test_application_batch_update_after_details_request(
    application_with_ahjo_decision,
    batch_status,
    decision_details,
    p2p_settings,
    proposal_for_decision,
):
    application_batch = ApplicationBatch.objects.create(
        status=ApplicationBatchStatus.DRAFT,
        handler=application_with_ahjo_decision.calculation.handler,
        proposal_for_decision=proposal_for_decision,
        auto_generated_by_ahjo=True,
    )

    application_batch.update_batch_after_details_request(batch_status, decision_details)
    assert application_batch.decision_maker_name == decision_details.decision_maker_name
    assert (
        application_batch.decision_maker_title == decision_details.decision_maker_title
    )
    assert application_batch.section_of_the_law == decision_details.section_of_the_law
    assert application_batch.decision_date == decision_details.decision_date

    assert application_batch.p2p_checker_name == p2p_settings.data["acceptor_name"]
    assert application_batch.p2p_inspector_name == p2p_settings.data["inspector_name"]
    assert application_batch.p2p_inspector_email == p2p_settings.data["inspector_email"]

    assert application_batch.status == batch_status


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
    if status in [
        ApplicationBatchStatus.DECIDED_ACCEPTED,
        ApplicationBatchStatus.DECIDED_REJECTED,
    ]:
        # need to create a new batch because factory has already created valid fields using ApplicationBatchFactory
        application_batch.delete()
        application_batch = BaseApplicationBatchFactory(
            status=ApplicationBatchStatus.DRAFT,
            proposal_for_decision=status,
            decision_date=date.today(),
        )
        with pytest.raises(BatchCompletionRequiredFieldsError):
            application_batch.status = status
            application_batch.save()
        fill_as_valid_batch_completion_and_save(application_batch)
    else:
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
    if status in [
        ApplicationBatchStatus.DECIDED_ACCEPTED,
        ApplicationBatchStatus.DECIDED_REJECTED,
    ]:
        # need to create a new batch because factory has already created valid fields using ApplicationBatchFactory
        application_batch.delete()
        application_batch = BaseApplicationBatchFactory(
            status=ApplicationBatchStatus.DRAFT,
            proposal_for_decision=status,
            decision_date=date.today(),
        )

        with pytest.raises(BatchCompletionRequiredFieldsError):
            application_batch.status = status
            application_batch.save()
        fill_as_valid_batch_completion_and_save(application_batch)
    else:
        application_batch.save()
    assert application_batch.applications_can_be_modified == expected_result


def test_application_address(application):
    application.official_company_city = "official city"
    application.alternative_company_city = "alternative city"
    application.official_company_street_address = "official address"
    application.alternative_company_street_address = "alternative address"
    application.official_company_postcode = "00100"
    application.alternative_company_postcode = "00200"
    application.use_alternative_address = False
    assert application.effective_company_city == application.official_company_city
    assert (
        application.effective_company_street_address
        == application.official_company_street_address
    )
    assert (
        application.effective_company_postcode == application.official_company_postcode
    )
    application.use_alternative_address = True
    assert application.effective_company_city == application.alternative_company_city
    assert (
        application.effective_company_street_address
        == application.alternative_company_street_address
    )
    assert (
        application.effective_company_postcode
        == application.alternative_company_postcode
    )


def test_encrypted_searchable_social_security_number(employee):
    # test exact ssn searches on the hashed field
    assert employee.social_security_number
    initial_ssn = employee.social_security_number
    initial_encrypted_ssn = employee.encrypted_social_security_number
    assert Employee.objects.filter(social_security_number=initial_ssn).count() == 1
    assert Employee.objects.filter(social_security_number="does_not_exist").count() == 0
    employee.social_security_number = ""
    employee.save()
    employee.refresh_from_db()
    assert employee.encrypted_social_security_number != initial_encrypted_ssn
    assert employee.social_security_number == ""
    assert Employee.objects.filter(social_security_number=initial_ssn).count() == 0
    assert Employee.objects.filter(social_security_number="").count() == 1
