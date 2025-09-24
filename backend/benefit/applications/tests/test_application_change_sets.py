from datetime import timedelta
from unittest import mock

import faker
from freezegun import freeze_time
from rest_framework.reverse import reverse

from applications.api.v1.serializers.application import (
    ApplicantApplicationSerializer,
    HandlerApplicationSerializer,
)
from applications.enums import ApplicationActions, ApplicationStatus, AttachmentType
from applications.tests.conftest import *  # noqa
from applications.tests.test_applications_api import (
    _upload_pdf,
    add_attachments_to_application,
)
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa


def get_handler_detail_url(application):
    return reverse("v1:handler-application-detail", kwargs={"pk": application.id})


def get_applicant_detail_url(application):
    return reverse("v1:applicant-application-detail", kwargs={"pk": application.id})


def _flatten_dict(d, parent_key="", sep="."):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(_flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


handler_edit_payloads = [
    {
        "change_reason": (
            "Change employee first & last name, company contact's phone number"
        ),
        "company_contact_person_phone_number": "+35850000000",
        "employee": {
            "first_name": "Firstname1",
            "last_name": "Lastname1",
        },
    },
    {
        "change_reason": "Change employee last name and company contact's phone number",
        "company_contact_person_phone_number": "+35850000001",
        "employee": {
            "last_name": "Lastname2",
        },
    },
    {
        "change_reason": "Change employee last name",
        "employee": {
            "last_name": faker.Faker().last_name(),
        },
    },
    {
        "change_reason": "Edit many many fields",
        "employee": {
            "first_name": "Cool",
            "last_name": "Kanerva",
            "social_security_number": "211081-2043",
            "employee_language": "sv",
            "job_title": "Some-asiantuntija",
            "monthly_pay": 1111,
            "vacation_money": 222,
            "other_expenses": 333,
            "working_hours": 18.0,
            "collective_bargaining_agreement": "TES",
            "birthday": "1987-01-01",
        },
        "company": {
            "street_address": "Maasalontie 952",
            "postcode": "80947",
            "city": "Haapavesi",
            "bank_account_number": "FI7600959247562223",
        },
        "official_company_street_address": "Maasalontie 952",
        "official_company_city": "Haapavesi",
        "official_company_postcode": "80947",
        "use_alternative_address": False,
        "company_bank_account_number": "FI6547128581000605",
        "company_contact_person_first_name": "Malla",
        "company_contact_person_last_name": "Jout-Sen",
        "company_contact_person_phone_number": "+358401234567",
        "company_contact_person_email": "yjdh-helsinkilisa@example.net",
        "applicant_language": "fi",
        "co_operation_negotiations": True,
        "co_operation_negotiations_description": "Aenean fringilla lorem tellus",
        "additional_pay_subsidy_percent": None,
        "apprenticeship_program": None,
        "start_date": "2024-01-01",
        "end_date": "2024-02-02",
    },
    {"change_reason": None, "status": ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED},
]


applicant_edit_payloads = [
    {
        "change_reason": None,
        "company_contact_person_first_name": "Tette",
        "company_contact_person_last_name": "Tötterström",
        "company_contact_person_phone_number": "+358501234567",
        "company_contact_person_email": "yjdh@example.net",
        "applicant_language": "en",
        "co_operation_negotiations": False,
        "co_operation_negotiations_description": "",
    },
    {
        "change_reason": None,
        "status": ApplicationStatus.HANDLING,
        "employee": {
            "first_name": "Aura",
            "last_name": "Muumaamustikka",
            "employee_language": "en",
            "job_title": "Metsän henki",
            "monthly_pay": 1234,
            "vacation_money": 321,
            "other_expenses": 313,
            "working_hours": 33.0,
            "collective_bargaining_agreement": "JES",
            "birthday": "2008-01-01",
        },
        "start_date": "2023-12-01",
        "end_date": "2024-01-02",
    },
]


def compare_fields(edit_payloads, changes):
    # Assert that each field change exist in change sets
    for i, expected_change in enumerate(edit_payloads):
        assert changes[i]["reason"] == expected_change["change_reason"]
        expected_change.pop("change_reason")

        expected_fields = dict(_flatten_dict(expected_change))

        changed_fields = {
            change["field"]: change["new"] for change in changes[i]["changes"]
        }

        for key in changed_fields:
            assert (
                str(expected_fields[key]) == str(changed_fields[key])
                if isinstance(expected_fields[key], str)
                else float(expected_fields[key]) == float(changed_fields[key])
            )


def check_handler_changes(handler_edit_payloads, changes):
    # Reverse the payloads to match the order of the changes
    handler_edit_payloads.reverse()

    # Add a mock row which gets inserted when application status changes to "handling"
    handler_edit_payloads.append({"change_reason": None, "handler": "Unknown user"})
    handler_edit_payloads.append(
        {"change_reason": None, "status": ApplicationStatus.HANDLING}
    )

    compare_fields(handler_edit_payloads, changes)
    assert len(changes) == len(handler_edit_payloads)


def check_applicant_changes(applicant_edit_payloads, changes, application):
    # Reverse the payloads to match the order of the changes
    applicant_edit_payloads.reverse()
    applicant_edit_payloads.append(
        {
            "change_reason": None,
            "attachments": application.attachments.last().attachment_file.name,
        }
    )

    compare_fields(applicant_edit_payloads, changes)

    assert len(changes) == len(applicant_edit_payloads)


def test_application_history_change_sets(
    request, handler_api_client, api_client, application
):
    payload = HandlerApplicationSerializer(application).data
    payload["status"] = ApplicationStatus.RECEIVED
    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        add_attachments_to_application(request, application)
        response = handler_api_client.put(
            get_handler_detail_url(application),
            payload,
        )

    assert response.status_code == 200

    application.refresh_from_db()
    payload = HandlerApplicationSerializer(application).data
    payload["status"] = ApplicationStatus.HANDLING
    response = handler_api_client.put(
        get_handler_detail_url(application),
        payload,
    )
    assert response.status_code == 200

    # Set up the handler edits
    def update_handler_application(application_payload, frozen_datetime):
        frozen_datetime.tick(delta=timedelta(seconds=1))
        application.refresh_from_db()
        payload = HandlerApplicationSerializer(application).data
        payload["action"] = ApplicationActions.HANDLER_ALLOW_APPLICATION_EDIT
        response = handler_api_client.put(
            get_handler_detail_url(application),
            {**payload, **application_payload},
        )
        assert response.status_code == 200
        return response

    # Set up the applicant edits
    def update_applicant_application(application_payload, frozen_datetime):
        frozen_datetime.tick(delta=timedelta(seconds=1))
        application.refresh_from_db()
        payload = ApplicantApplicationSerializer(application).data
        response = api_client.put(
            get_applicant_detail_url(application),
            {**payload, **application_payload},
        )
        assert response.status_code == 200
        return response

    with freeze_time("2024-01-01") as frozen_datetime:
        for application_payload in handler_edit_payloads:
            response = update_handler_application(application_payload, frozen_datetime)

    changes = response.data["changes"]
    check_handler_changes(handler_edit_payloads, changes)
    with freeze_time("2024-01-02") as frozen_datetime:
        with mock.patch(
            "terms.models.ApplicantTermsApproval.terms_approval_needed",
            return_value=False,
        ):
            # add the required attachments except consent
            response = _upload_pdf(
                request,
                api_client,
                application,
                attachment_type=AttachmentType.HELSINKI_BENEFIT_VOUCHER,
            )
            assert response.status_code == 201

            for application_payload in applicant_edit_payloads:
                response = update_applicant_application(
                    application_payload, frozen_datetime
                )

    changes = handler_api_client.get(get_handler_detail_url(application)).data[
        "changes"
    ]

    # Just split from the head of changes - we don't want to check handler's changes
    # again
    # Plus one for the attachment change
    applicant_changes = changes[0 : len(applicant_edit_payloads) + 1]

    check_applicant_changes(applicant_edit_payloads, applicant_changes, application)
