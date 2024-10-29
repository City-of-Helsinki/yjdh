import uuid
from datetime import date, datetime

from freezegun import freeze_time
from freezegun.api import FakeDate
from rest_framework.reverse import reverse

from applications.enums import (
    ApplicationBatchStatus,
    ApplicationOrigin,
    ApplicationStatus,
    ApplicationStep,
    ApplicationTalpaStatus,
    BenefitType,
    PaySubsidyGranted,
)
from applications.tests.conftest import Application
from applications.tests.factories import (
    ApplicationBatchFactory,
    AttachmentFactory,
    DecidedApplicationFactory,
)
from shared.common.tests.factories import UserFactory

# from common.tests.conftest import *  # noqa
# from companies.tests.conftest import *  # noqa
# from helsinkibenefit.tests.conftest import *  # noqa
# from terms.tests.conftest import *  # noqa

application_fields = {
    "copied": [
        "additional_pay_subsidy_percent",
        "alternative_company_city",
        "alternative_company_postcode",
        "alternative_company_street_address",
        "applicant_language",
        "application_origin",
        "apprenticeship_program",
        "association_has_business_activities",
        "association_immediate_manager_check",
        "benefit_type",
        "co_operation_negotiations",
        "co_operation_negotiations_description",
        "company",
        "company_bank_account_number",
        "company_contact_person_email",
        "company_contact_person_first_name",
        "company_contact_person_last_name",
        "company_contact_person_phone_number",
        "company_department",
        "company_form",
        "company_form_code",
        "company_name",
        "de_minimis_aid",
        "de_minimis_aid_set",
        "end_date",
        "handled_by_ahjo_automation",
        "official_company_city",
        "official_company_postcode",
        "official_company_street_address",
        "paper_application_date",
        "pay_subsidy_granted",
        "pay_subsidy_percent",
        "start_date",
        "use_alternative_address",
    ],
    "not_copied": [
        "ahjo_case_guid",
        "ahjo_case_id",
        "application_number",
        "application_step",
        "archived",
        "batch",
        "created_at",
        "handler",
        "id",
        "modified_at",
        "status",
        "talpa_status",
    ],
}

attachment_fields = {
    "copied": [
        "attachment_type",
    ],
    "not_copied": [
        "id",
        "created_at",
        "modified_at",
        "application",
        "content_type",
        "attachment_file_name",
        "attachment_file",
        "ahjo_version_series_id",
    ],
    "skipped": ["ahjo_version_series_id", "downloaded_by_ahjo", "ahjo_hash_value"],
    "attachment_types": [
        "employment_contract",
        "pay_subsidy_decision",
        "education_contract",
        "helsinki_benefit_voucher",
        "employee_consent",
    ],
}

calculator_fields = {
    "not_copied": [
        "id",
        "created_at",
        "modified_at",
        "handler",
        "application",
    ],
    "copied": [
        "monthly_pay",
        "vacation_money",
        "other_expenses",
        "start_date",
        "end_date",
        "state_aid_max_percentage",
        "calculated_benefit_amount",
        "override_monthly_benefit_amount",
        "granted_as_de_minimis_aid",
        "target_group_check",
        "override_monthly_benefit_amount_comment",
    ],
}

pay_subsidy_fields = {
    "copied": [
        "start_date",
        "end_date",
        "pay_subsidy_percent",
        "work_time_percent",
        "ordering",
        "disability_or_illness",
    ],
    "not_copied": [
        "created_at",
        "modified_at",
        "id",
        "application",
    ],
}

training_compensation_fields = {
    "copied": ["start_date", "end_date", "monthly_amount", "ordering"],
    "not_copied": [
        "created_at",
        "modified_at",
        "id",
        "application",
    ],
}

de_minimis_aid_fields = {
    "copied": [
        "amount",
        "granted_at",
        "granter",
    ],
    "not_copied": [
        "created_at",
        "modified_at",
        "id",
        "ordering",
        "application",
    ],
}

employee_fields = {
    "copied": [
        "first_name",
        "last_name",
        "social_security_number",
        "is_living_in_helsinki",
        "job_title",
        "monthly_pay",
        "vacation_money",
        "other_expenses",
        "working_hours",
        "collective_bargaining_agreement",
        "encrypted_social_security_number",
        "encrypted_first_name",
        "encrypted_last_name",
        "phone_number",
        "email",
        "employee_language",
        "commission_amount",
        "commission_description",
    ],
    "not_copied": ["created_at", "modified_at", "id", "application"],
}


def test_application_full_clone(api_client, handler_api_client, settings):
    settings.PAYMENT_INSTALMENTS_ENABLED = True
    application = _set_up_decided_application()
    # Endpoint should only be available for handlers
    response = api_client.get(
        reverse("v1:handler-application-clone-as-draft", kwargs={"pk": application.id}),
    )
    assert response.status_code == 403

    # Access endpoint as a handler and a bit later than the original application created at
    with freeze_time("2024-10-23"):
        response = handler_api_client.get(
            reverse(
                "v1:handler-application-clone-as-draft", kwargs={"pk": application.id}
            ),
        )

    assert response.status_code == 201
    data = response.json()
    assert len(data["id"]) == 36  # Has to return a valid UUID

    cloned_application = Application.objects.get(id=data["id"])
    assert cloned_application

    _check_application_fields(application, cloned_application)
    _check_company(application, cloned_application)
    _check_employee_fields(application, cloned_application)
    _check_calculation_fields(application, cloned_application)
    _check_pay_subsidies(application, cloned_application)
    _check_training_compensations(application, cloned_application)
    _check_de_minimis_aids(application, cloned_application)
    _check_attachments(application, cloned_application)


def _set_up_decided_application():
    application = DecidedApplicationFactory(
        benefit_type=BenefitType.SALARY_BENEFIT,
        ahjo_case_id="HEL 2024-123456",
        ahjo_case_guid=uuid.uuid4(),
        archived=True,
        apprenticeship_program=True,
        association_has_business_activities=False,
        handled_by_ahjo_automation=True,
        co_operation_negotiations=True,
        co_operation_negotiations_description="Very co-operation. Much contract.",
        paper_application_date="2024-10-23",
        pay_subsidy_granted=PaySubsidyGranted.GRANTED,
        application_origin=ApplicationOrigin.HANDLER,
        application_step=ApplicationStep.STEP_6,
        batch=ApplicationBatchFactory(
            proposal_for_decision=ApplicationStatus.ACCEPTED,
            status=ApplicationBatchStatus.COMPLETED,
        ),
        handler=UserFactory(is_staff=True, is_active=True, is_superuser=True),
        talpa_status=ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA,
        use_alternative_address=True,
    )
    application.official_company_street_address = application.company.street_address
    application.calculation.monthly_pay = application.employee.monthly_pay
    application.calculation.vacation_money = application.employee.vacation_money
    application.calculation.other_expenses = application.employee.other_expenses
    application.calculation.save()
    application.calculation.init_calculator()
    application.calculation.calculate()
    application.association_immediate_manager_check = False
    application.pay_subsidies.all().update(disability_or_illness=True)

    for attachment_type in attachment_fields["attachment_types"]:
        AttachmentFactory(
            application=application,
            attachment_type=attachment_type,
        )

    application.save()

    return application


def _check_fields(original, cloned, fields):
    types_to_compare_as_string = (datetime, date, uuid.UUID, FakeDate)

    for field in original._meta.fields:
        if fields.get("skipped") and field.name in fields["skipped"]:
            continue

        original_value = (
            str(getattr(original, field.name))
            if isinstance(getattr(original, field.name), types_to_compare_as_string)
            else getattr(original, field.name)
        )
        cloned_value = (
            str(getattr(cloned, field.name))
            if isinstance(getattr(cloned, field.name), types_to_compare_as_string)
            else getattr(cloned, field.name)
        )
        if field.name in fields["copied"]:
            assert (
                original_value == cloned_value
            ), f"Field {field.name} should match, {original_value} != {cloned_value}"

        if field.name in fields["not_copied"]:
            assert (
                original_value != cloned_value
            ), f"Field {field.name} should not match, {original_value} != {cloned_value}"

        if field.name not in fields["copied"] + fields["not_copied"]:
            assert False, f"Unidentified field '{field.name}', please take this "
            "field into account when renaming, removing, or adding fields"


def _check_application_fields(application, cloned_application):
    _check_fields(application, cloned_application, application_fields)


def _check_company(application, cloned_application):
    assert application.company.id == cloned_application.company.id


def _check_calculation_fields(application, cloned_application):
    _check_fields(
        application.calculation, cloned_application.calculation, calculator_fields
    )


def _check_pay_subsidies(application, cloned_application):
    original_pay_subsidies = list(application.pay_subsidies.all())
    cloned_pay_subsidies = list(cloned_application.pay_subsidies.all())

    assert len(original_pay_subsidies) == len(
        cloned_pay_subsidies
    ), "Number of pay subsidies should match"

    for original_pay_subsidy in original_pay_subsidies:
        matched_subsidy = next(
            (
                cloned_pay_subsidy
                for cloned_pay_subsidy in cloned_pay_subsidies
                if cloned_pay_subsidy.start_date == original_pay_subsidy.start_date
                and cloned_pay_subsidy.end_date == original_pay_subsidy.end_date
                and cloned_pay_subsidy.pay_subsidy_percent
                == original_pay_subsidy.pay_subsidy_percent
                and cloned_pay_subsidy.work_time_percent
                == original_pay_subsidy.work_time_percent
            ),
            None,
        )
        assert (
            matched_subsidy is not None
        ), "Matching pay subsidy not found in cloned subsidies"
        _check_fields(original_pay_subsidy, matched_subsidy, pay_subsidy_fields)


def _check_training_compensations(application, cloned_application):
    original_training_compensations = list(application.training_compensations.all())
    cloned_training_compensations = list(
        cloned_application.training_compensations.all()
    )

    assert len(cloned_training_compensations) == len(
        original_training_compensations
    ), "Number of training compensations should match"

    for original_compensation in original_training_compensations:
        matched_compensation = next(
            (
                cloned_compensation
                for cloned_compensation in cloned_training_compensations
                if cloned_compensation.start_date == original_compensation.start_date
                and cloned_compensation.end_date == original_compensation.end_date
                and cloned_compensation.monthly_amount
                == original_compensation.monthly_amount
                and cloned_compensation.ordering == original_compensation.ordering
            ),
            None,
        )
        assert (
            matched_compensation is not None
        ), "Matching compensation not found in cloned compensations"
        _check_fields(
            original_compensation, matched_compensation, training_compensation_fields
        )


def _check_de_minimis_aids(application, cloned_application):
    original_de_minimis_aids = list(application.de_minimis_aid_set.all())
    cloned_de_minimis_aids = list(cloned_application.de_minimis_aid_set.all())

    assert len(cloned_de_minimis_aids) == len(
        original_de_minimis_aids
    ), "Number of de minimis aids should match"

    for original_aid in original_de_minimis_aids:
        matched_aid = next(
            (
                cloned_aid
                for cloned_aid in cloned_de_minimis_aids
                if cloned_aid.amount == original_aid.amount
                and cloned_aid.granted_at == original_aid.granted_at
                and cloned_aid.granter == original_aid.granter
            ),
            None,
        )
        assert matched_aid is not None, "Matching aid not found in cloned aids"
        _check_fields(original_aid, matched_aid, de_minimis_aid_fields)


def _check_attachments(application, cloned_application):
    for attachment_type in attachment_fields["attachment_types"]:
        original_attachment = application.attachments.filter(
            attachment_type=attachment_type
        ).first()
        cloned_attachment = cloned_application.attachments.filter(
            attachment_type=attachment_type
        ).first()
        _check_fields(original_attachment, cloned_attachment, attachment_fields)


def _check_employee_fields(application, cloned_application):
    _check_fields(application.employee, cloned_application.employee, employee_fields)
