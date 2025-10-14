import pytest
from django.core.management import call_command

from applications.api.v1.serializers.application import HandlerApplicationSerializer
from applications.enums import ApplicationStatus, BenefitType, PaySubsidyGranted
from applications.models import Application
from applications.tests.factories import (
    CancelledApplicationFactory,
    DecidedApplicationFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
)

data_for_application = {
    "status": ApplicationStatus.CANCELLED,
    "archived": False,
    "use_alternative_address": False,
    "de_minimis_aid_set": [],
    "de_minimis_aid": False,
    "application_step": "step_6",
    "employee": {},
    "pay_subsidy_granted": PaySubsidyGranted.NOT_GRANTED,
    "bases": [],
    "company_contact_person_first_name": "Test",
    "company_contact_person_last_name": "Tester",
    "co_operation_negotiations": False,
    "benefit_type": BenefitType.SALARY_BENEFIT,
    "start_date": "2021-01-01",
    "end_date": "2021-01-31",
    "company_contact_person_phone_number": "05012345678",
    "company_contact_person_email": "test@example.com",
    "company_bank_account_number": "FI8149754587000402",
    "handled_by_ahjo_automation": False,
}


@pytest.mark.django_db
def test_decision_proposal_drafting():
    # Create a new application, set the other one as cancelled
    application = ReceivedApplicationFactory(application_number=100002)
    CancelledApplicationFactory(application_number=100002)
    DecidedApplicationFactory(application_number=100003)
    HandlingApplicationFactory(application_number=100004)

    application.status = ApplicationStatus.RECEIVED
    application.save()
    serializer = HandlerApplicationSerializer(
        application,
        data=data_for_application,
    )
    serializer.is_valid()
    serializer.save()

    apps = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    assert len(apps) == 2 and apps[0].archived is True and apps[1].archived is True

    application.status = ApplicationStatus.RECEIVED
    application.archived = False
    application.save()
    apps = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    call_command("set_cancelled_as_archived")
    assert len(apps) == 1

    serializer = HandlerApplicationSerializer(
        application,
        data=data_for_application,
    )
    serializer.is_valid()
    serializer.save()
    call_command("set_cancelled_as_archived")
    apps = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    assert len(apps) == 2
