from datetime import date

import faker
import pytest
from dateutil.relativedelta import relativedelta
from rest_framework.reverse import reverse

from applications.enums import ApplicationAlterationState, ApplicationAlterationType
from applications.models import ApplicationAlteration
from companies.tests.factories import CompanyFactory


def test_application_alteration_create_terminated(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_einvoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201


def test_application_alteration_create_suspended(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "resume_date": application.start_date + relativedelta(days=14),
            "use_einvoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201


def test_application_alteration_create_missing_resume_date(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_einvoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 1


def test_application_alteration_create_missing_einvoice_fields(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_einvoice": True,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 3


def test_application_alteration_create_missing_contact_person_name(
    api_client, application
):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_einvoice": False,
            "contact_person_name": "",
        },
    )
    assert response.status_code == 400
    assert "contact_person_name" in response.data
    assert len(response.data.keys()) == 1


def test_application_alteration_create_use_einvoice(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_einvoice": True,
            "einvoice_provider_name": "Basware Oyj",
            "einvoice_provider_identifier": "BAWCFI22",
            "einvoice_address": "001100223300",
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201


def test_application_alteration_create_outside_application_date_range(
    api_client, application
):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=-7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.end_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "resume_date": application.end_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data


def test_application_alteration_create_reversed_suspension_dates(
    api_client, application
):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=14),
            "resume_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 1


def test_application_alteration_create_overlapping_alteration(api_client, application):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "resume_date": application.start_date + relativedelta(days=14),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201

    alteration_pk = response.data["id"]
    alteration = ApplicationAlteration.objects.get(pk=alteration_pk)
    alteration.recovery_start_date = application.start_date + relativedelta(days=7)
    alteration.recovery_end_date = application.start_date + relativedelta(days=14)
    alteration.recovery_amount = 600
    alteration.save()

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=9),
            "resume_date": application.start_date + relativedelta(days=16),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 1

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=5),
            "resume_date": application.start_date + relativedelta(days=12),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 1

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=5),
            "resume_date": application.start_date + relativedelta(days=16),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data
    assert len(response.data["non_field_errors"]) == 1


def test_application_alteration_create_non_overlapping_alteration(
    api_client, application
):
    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "resume_date": application.start_date + relativedelta(days=14),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201

    alteration_pk = response.data["id"]
    alteration = ApplicationAlteration.objects.get(pk=alteration_pk)
    alteration.recovery_start_date = application.start_date + relativedelta(days=7)
    alteration.recovery_end_date = application.start_date + relativedelta(days=14)
    alteration.recovery_amount = 600
    alteration.save()

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "suspension",
            "reason": "Keskeytynyt",
            "end_date": application.start_date + relativedelta(days=16),
            "resume_date": application.start_date + relativedelta(days=23),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 201


def test_application_alteration_create_forbidden_anonymous(
    anonymous_client, application
):
    pk = application.id

    response = anonymous_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 403


def test_application_alteration_create_forbidden_another_company(
    api_client, application
):
    another_company = CompanyFactory()
    application.company = another_company
    application.save()

    pk = application.id

    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 403


def test_application_alteration_forbidden_applicant_in_handler_api(
    api_client, application
):
    pk = application.id

    response = api_client.post(
        reverse("v1:handler-application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 403


def test_application_alteration_forbidden_handler_in_applicant_api(
    handler_api_client, application
):
    pk = application.id

    response = handler_api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )
    assert response.status_code == 403


def test_application_alteration_create_ignored_fields_applicant(
    api_client,
    application,
):
    pk = application.id
    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "state": "handled",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "handled_at": application.start_date + relativedelta(days=10),
            "recovery_start_date": application.start_date + relativedelta(days=7),
            "recovery_end_date": application.end_date,
            "recovery_amount": 4000,
            "is_recoverable": True,
            "handled_by": 1,
            "contact_person_name": "Ella Esimerkki",
        },
    )

    assert response.status_code == 201
    assert response.data["state"] == "received"
    assert response.data["recovery_start_date"] is None
    assert response.data["recovery_end_date"] is None
    assert response.data["recovery_amount"] is None
    assert response.data["is_recoverable"] is False
    assert response.data["handled_by"] is None
    assert response.data["handled_at"] is None


def test_application_alteration_create_ignored_fields_handler(
    handler_api_client, application
):
    pk = application.id

    response = handler_api_client.post(
        reverse("v1:handler-application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "state": "handled",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "recovery_start_date": application.start_date + relativedelta(days=7),
            "recovery_end_date": application.end_date,
            "recovery_amount": 4000.97,
            "contact_person_name": "Ella Esimerkki",
        },
    )

    assert response.status_code == 201
    assert response.data["state"] == "handled"
    assert (
        response.data["recovery_start_date"]
        == (application.start_date + relativedelta(days=7)).isoformat()
    )
    assert response.data["recovery_end_date"] == application.end_date.isoformat()
    assert response.data["recovery_amount"] == "4000.00"


def test_application_alteration_patch_applicant(api_client, application):
    pk = application.id
    response = api_client.post(
        reverse("v1:application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )

    response = api_client.patch(
        reverse("v1:application-alteration-detail", kwargs={"pk": response.data["id"]}),
        {
            "end_date": application.start_date + relativedelta(days=12),
            "recovery_amount": 4000,
        },
    )
    assert response.status_code == 200
    assert (
        response.data["end_date"]
        == (application.start_date + relativedelta(days=12)).isoformat()
    )
    assert response.data["recovery_amount"] is None


def test_application_alteration_patch_handler(handler_api_client, application):
    pk = application.id
    response = handler_api_client.post(
        reverse("v1:handler-application-alteration-list"),
        {
            "application": pk,
            "alteration_type": "termination",
            "reason": "Päättynyt",
            "end_date": application.start_date + relativedelta(days=7),
            "use_invoice": False,
            "contact_person_name": "Ella Esimerkki",
        },
    )

    response = handler_api_client.patch(
        reverse(
            "v1:handler-application-alteration-detail",
            kwargs={"pk": response.data["id"]},
        ),
        {
            "end_date": application.start_date + relativedelta(days=12),
            "recovery_amount": 4000.45,
        },
    )
    assert response.status_code == 200
    assert (
        response.data["end_date"]
        == (application.start_date + relativedelta(days=12)).isoformat()
    )
    assert response.data["recovery_amount"] == "4000.00"


def test_application_alteration_handler_automatic_state_change_fields(
    handler_api_client, application, admin_user
):
    alteration = _create_application_alteration(application)
    today = date.today()

    assert alteration.handled_at is None
    assert alteration.handled_by is None
    assert alteration.cancelled_at is None
    assert alteration.cancelled_by is None

    response = handler_api_client.patch(
        reverse(
            "v1:handler-application-alteration-detail",
            kwargs={"pk": alteration.id},
        ),
        {
            "state": "handled",
        },
    )
    assert response.status_code == 200
    assert response.data["state"] == "handled"
    assert date.fromisoformat(response.data["handled_at"]) == today
    assert response.data["handled_by"]["id"] == str(admin_user.id)
    assert response.data["cancelled_at"] is None
    assert response.data["cancelled_by"] is None

    response = handler_api_client.patch(
        reverse(
            "v1:handler-application-alteration-detail",
            kwargs={"pk": alteration.id},
        ),
        {
            "state": "cancelled",
        },
    )

    assert response.status_code == 200
    assert response.data["state"] == "cancelled"
    assert date.fromisoformat(response.data["handled_at"]) == today
    assert response.data["handled_by"]["id"] == str(admin_user.id)


@pytest.mark.parametrize(
    "initial_state,result",
    [
        (ApplicationAlterationState.RECEIVED, 200),
        (ApplicationAlterationState.OPENED, 200),
        (ApplicationAlterationState.HANDLED, 403),
        (ApplicationAlterationState.CANCELLED, 403),
    ],
)
def test_application_alteration_patch_allowed_edit_states_handler(
    handler_api_client, application, initial_state, result
):
    alteration = _create_application_alteration(application)
    alteration.state = initial_state
    alteration.save()

    response = handler_api_client.patch(
        reverse(
            "v1:handler-application-alteration-detail", kwargs={"pk": alteration.pk}
        ),
        {
            "end_date": application.start_date + relativedelta(days=12),
        },
    )
    assert response.status_code == result


@pytest.mark.parametrize(
    "initial_state,result",
    [
        (ApplicationAlterationState.RECEIVED, 200),
        (ApplicationAlterationState.OPENED, 403),
        (ApplicationAlterationState.HANDLED, 403),
        (ApplicationAlterationState.CANCELLED, 403),
    ],
)
def test_application_alteration_patch_allowed_edit_states_applicant(
    api_client, application, initial_state, result
):
    alteration = _create_application_alteration(application)
    alteration.state = initial_state
    alteration.save()

    response = api_client.patch(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk}),
        {
            "end_date": application.start_date + relativedelta(days=12),
        },
    )
    assert response.status_code == result


def test_application_alteration_patch_forbidden_another_company(
    api_client, application
):
    another_company = CompanyFactory()
    application.company = another_company
    application.save()

    alteration = _create_application_alteration(application)

    response = api_client.patch(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk}),
        {
            "end_date": application.start_date + relativedelta(days=12),
        },
    )
    assert response.status_code == 403


@pytest.mark.parametrize(
    "initial_state,result",
    [
        (ApplicationAlterationState.RECEIVED, 204),
        (ApplicationAlterationState.OPENED, 403),
        (ApplicationAlterationState.HANDLED, 403),
        (ApplicationAlterationState.CANCELLED, 403),
    ],
)
def test_application_alteration_allowed_delete_states_applicant(
    api_client, application, initial_state, result
):
    alteration = _create_application_alteration(application)
    alteration.state = initial_state
    alteration.save()

    response = api_client.delete(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk})
    )
    assert response.status_code == result


@pytest.mark.parametrize(
    "initial_state,result",
    [
        (ApplicationAlterationState.RECEIVED, 204),
        (ApplicationAlterationState.OPENED, 204),
        (ApplicationAlterationState.HANDLED, 204),
        (ApplicationAlterationState.CANCELLED, 204),
    ],
)
def test_application_alteration_delete_handler(
    handler_api_client, application, initial_state, result
):
    alteration = _create_application_alteration(application)
    alteration.state = initial_state
    alteration.save()

    response = handler_api_client.delete(
        reverse(
            "v1:handler-application-alteration-detail", kwargs={"pk": alteration.pk}
        )
    )
    assert response.status_code == result


def test_application_alteration_delete_forbidden_another_company(
    api_client, application
):
    another_company = CompanyFactory()
    application.company = another_company
    application.save()

    alteration = _create_application_alteration(application)

    response = api_client.delete(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk})
    )
    assert response.status_code == 403


def test_application_alteration_patch_forbidden_applicant_get_requests(
    api_client, application
):
    alteration = _create_application_alteration(application)

    response = api_client.get(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk}),
    )
    assert response.status_code == 405

    response = api_client.get(
        reverse("v1:application-alteration-list"),
    )
    assert response.status_code == 405

    response = api_client.get(
        reverse(
            "v1:handler-application-alteration-detail", kwargs={"pk": alteration.pk}
        ),
    )
    assert response.status_code == 403

    response = api_client.get(
        reverse("v1:handler-application-alteration-list"),
    )
    assert response.status_code == 403


def test_application_alteration_patch_handler_get_requests(
    handler_api_client, application
):
    alteration = _create_application_alteration(application)

    response = handler_api_client.get(
        reverse("v1:application-alteration-detail", kwargs={"pk": alteration.pk}),
    )
    assert response.status_code == 403

    response = handler_api_client.get(
        reverse("v1:application-alteration-list"),
    )
    assert response.status_code == 403

    response = handler_api_client.get(
        reverse(
            "v1:handler-application-alteration-detail", kwargs={"pk": alteration.pk}
        ),
    )
    assert response.status_code == 200
    assert response.data["id"] == alteration.pk

    response = handler_api_client.get(
        reverse("v1:handler-application-alteration-list"),
    )
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["id"] == alteration.pk


def _create_application_alteration(application):
    f = faker.Faker()

    alteration = ApplicationAlteration()
    alteration.application = application
    alteration.alteration_type = ApplicationAlterationType.TERMINATION
    alteration.end_date = application.start_date + relativedelta(days=7)
    alteration.reason = f.sentence()
    alteration.contact_person_name = "Ella Esimerkki"
    alteration.use_einvoice = False
    alteration.save()

    return alteration
