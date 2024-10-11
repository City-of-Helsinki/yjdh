from datetime import timedelta
from unittest import mock

import faker
from freezegun import freeze_time
from rest_framework.reverse import reverse

from applications.api.v1.serializers.application import HandlerApplicationSerializer
from applications.enums import ApplicationActions, ApplicationStatus
from applications.tests.conftest import *  # noqa
from applications.tests.test_applications_api import add_attachments_to_application
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa


def get_handler_detail_url(application):
    return reverse("v1:handler-application-detail", kwargs={"pk": application.id})


def _flatten_dict(d, parent_key="", sep="."):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(_flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


update_payloads = [
    {
        "change_reason": "Change employee first & last name, company contact's phone number",
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
]


def test_application_history_change_sets(request, handler_api_client, application):
    # Setup application to handling status
    with freeze_time("2021-01-01") as frozen_datetime:
        add_attachments_to_application(request, application)

    payload = HandlerApplicationSerializer(application).data
    payload["status"] = ApplicationStatus.RECEIVED
    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
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

    # Mock the actual handler edits
    with freeze_time("2024-01-01") as frozen_datetime:

        def update_application(application_payload):
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

        response = None
        for application_payload in update_payloads:
            response = update_application(application_payload)

        changes = response.data["changes"]

        update_payloads.reverse()

        # Add a mock row which gets inserted when application status changes to "handling"
        update_payloads.append({"change_reason": None, "handler": "Unknown user"})
        update_payloads.append(
            {"change_reason": None, "status": ApplicationStatus.HANDLING}
        )

        assert len(changes) == len(update_payloads)

        # Assert that each field change exist in change sets
        for i, row in enumerate(update_payloads):
            assert changes[i]["reason"] == row["change_reason"]
            row.pop("change_reason")

            input_fields = dict(_flatten_dict(row))

            changed_fields = {
                change["field"]: change["new"] for change in changes[i]["changes"]
            }

            for key in changed_fields:
                assert (
                    str(input_fields[key]) == str(changed_fields[key])
                    if isinstance(input_fields[key], str)
                    else float(input_fields[key]) == float(changed_fields[key])
                )
