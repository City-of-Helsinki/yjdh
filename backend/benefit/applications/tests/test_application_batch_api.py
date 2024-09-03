import base64
import copy
import uuid
from datetime import date, datetime
from unittest.mock import patch

import pytest
import pytz
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.http import HttpResponse
from rest_framework.reverse import reverse

from applications.api.v1.serializers.application import ApplicationBatchSerializer
from applications.enums import (
    AhjoDecision,
    ApplicationBatchStatus,
    ApplicationStatus,
    ApplicationTalpaStatus,
)
from applications.exceptions import BatchTooManyDraftsError
from applications.models import Application, ApplicationBatch
from applications.tests.conftest import *  # noqa
from applications.tests.factories import (
    ApplicationBatchFactory,
    ApplicationFactory,
    DecidedApplicationFactory,
)
from applications.tests.faker import get_faker
from applications.tests.test_applications_api import get_handler_detail_url


@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    from applications.tests.before_after import before_test_reseed

    before_test_reseed([])
    yield


def get_valid_batch_completion_data():
    return {
        "decision_maker_title": get_faker().job(),
        "decision_maker_name": get_faker().name(),
        "section_of_the_law": "$1234",
        "decision_date": date.today(),
        "expert_inspector_name": get_faker().name(),
        "expert_inspector_title": get_faker().job(),
        "p2p_inspector_name": get_faker().name(),
        "p2p_inspector_email": get_faker().email(),
        "p2p_checker_name": get_faker().name(),
    }


def get_valid_rejected_batch_completion_data():
    return {
        "decision_maker_title": get_faker().job(),
        "decision_maker_name": get_faker().name(),
        "section_of_the_law": "$1234",
        "decision_date": date.today(),
    }


def get_valid_p2p_batch_completion_data():
    return {
        "decision_maker_title": get_faker().job(),
        "decision_maker_name": get_faker().name(),
        "section_of_the_law": "$1234",
        "decision_date": date.today(),
        "p2p_inspector_name": get_faker().name(),
        "p2p_inspector_email": get_faker().email(),
        "p2p_checker_name": get_faker().name(),
    }


def get_valid_ahjo_batch_completion_data():
    return {
        "decision_maker_title": get_faker().job(),
        "decision_maker_name": get_faker().name(),
        "section_of_the_law": "$1234",
        "decision_date": date.today(),
        "expert_inspector_name": get_faker().name(),
        "expert_inspector_title": get_faker().job(),
        "p2p_checker_name": get_faker().name(),
    }


def fill_as_valid_batch_completion_and_save(
    batch: ApplicationBatch, status: ApplicationBatchStatus = None
):
    data = get_valid_batch_completion_data()
    for key in data:
        setattr(batch, key, data[key])
    if status:
        batch.status = status
    batch.save()


def get_batch_detail_url(application_batch, uri=""):
    return (
        reverse("v1:applicationbatch-detail", kwargs={"pk": application_batch.id}) + uri
    )


def test_get_application_batch_unauthenticated(anonymous_client, application_batch):
    response = anonymous_client.get(get_batch_detail_url(application_batch))
    assert response.status_code == 403


def test_get_application_batch_as_applicant(api_client, application_batch):
    response = api_client.get(get_batch_detail_url(application_batch))
    assert response.status_code == 403


def test_get_application_batch(handler_api_client, application_batch):
    response = handler_api_client.get(get_batch_detail_url(application_batch))
    assert response.status_code == 200
    assert len(response.data["applications"]) == 2


def test_applications_batch_list(handler_api_client, application_batch):
    response = handler_api_client.get(reverse("v1:applicationbatch-list"))
    assert len(response.data) == 1
    assert response.status_code == 200


def test_applications_batch_list_with_filter(handler_api_client, application_batch):
    application_batch.status = ApplicationBatchStatus.DRAFT
    application_batch.save()
    url1 = reverse("v1:applicationbatch-list") + "?status=draft"
    response = handler_api_client.get(url1)
    assert response.status_code == 200
    assert len(response.data) == 1
    for batch in response.data:
        assert batch["status"] == ApplicationBatchStatus.DRAFT

    application_batch.status = ApplicationBatchStatus.AWAITING_AHJO_DECISION
    application_batch.save()
    url2 = reverse("v1:applicationbatch-list") + "?status=awaiting_ahjo_decision"
    response = handler_api_client.get(url2)
    assert response.status_code == 200
    assert len(response.data) == 1
    for batch in response.data:
        assert batch["status"] == ApplicationBatchStatus.AWAITING_AHJO_DECISION

    application_batch2 = ApplicationBatchFactory()
    application_batch2.status = ApplicationBatchStatus.DRAFT
    application_batch2.save()
    url3 = reverse("v1:applicationbatch-list") + "?status=awaiting_ahjo_decision,draft"
    response = handler_api_client.get(url3)
    assert response.status_code == 200
    assert len(response.data) == 2
    statuses = [response.data[0]["status"], response.data[1]["status"]]
    assert (
        ApplicationBatchStatus.AWAITING_AHJO_DECISION in statuses
        and ApplicationBatchStatus.DRAFT in statuses
    )


def test_application_batch_creation(handler_api_client):
    apps = [
        ApplicationFactory(status=ApplicationStatus.ACCEPTED),
        ApplicationFactory(status=ApplicationStatus.ACCEPTED),
        ApplicationFactory(status=ApplicationStatus.REJECTED),
        ApplicationFactory(status=ApplicationStatus.DRAFT),
    ]

    for app in apps:
        app.save()

    response = handler_api_client.patch(
        reverse("v1:applicationbatch-assign-applications"),
        {
            "status": ApplicationStatus.ACCEPTED,
            "application_ids": [apps[0].id, apps[1].id, apps[2].id, apps[3].id],
        },
    )

    assert len(response.data["applications"]) == 2
    assert apps[0].id in response.data["applications"]
    assert apps[1].id in response.data["applications"]
    assert apps[2].id not in response.data["applications"]
    assert apps[3].id not in response.data["applications"]
    assert response.status_code == 200

    response = handler_api_client.patch(
        reverse("v1:applicationbatch-assign-applications"),
        {
            "status": ApplicationStatus.REJECTED,
            "application_ids": [apps[0].id, apps[1].id, apps[2].id, apps[3].id],
        },
    )

    assert len(response.data["applications"]) == 1
    assert apps[0].id not in response.data["applications"]
    assert apps[1].id not in response.data["applications"]
    assert apps[2].id in response.data["applications"]
    assert apps[3].id not in response.data["applications"]
    assert response.status_code == 200

    # Wrong type for application_ids
    response = handler_api_client.patch(
        reverse("v1:applicationbatch-assign-applications"),
        {
            "status": ApplicationStatus.ACCEPTED,
            "application_ids": "04e9f0e3-5090-44e1-b35f-c536e598ceba",
        },
    )
    assert response.status_code == 400

    # Wrong status
    response = handler_api_client.patch(
        reverse("v1:applicationbatch-assign-applications"),
        {"status": ApplicationStatus.DRAFT, "application_ids": [apps[0].id]},
    )
    assert response.status_code == 400


def test_deassign_applications_from_batch(handler_api_client, application_batch):
    url = get_batch_detail_url(application_batch, "deassign_applications/")
    apps = Application.objects.filter(batch=application_batch)

    first_app_id = apps[0].id
    last_app_id = apps[1].id

    assert len(apps) == 2

    app_list = [first_app_id]
    apps = [
        DecidedApplicationFactory(),
        DecidedApplicationFactory(),
        DecidedApplicationFactory(),
    ]
    for app in apps:
        app.batch = application_batch
        app_list.append(app.id)
        app.save()

    apps = Application.objects.filter(batch=application_batch)
    assert len(apps) == 5

    response = handler_api_client.patch(
        url,
        {
            "application_ids": app_list,
            "batch_id": application_batch.id,
        },
    )
    assert response.status_code == 200
    apps = Application.objects.filter(batch=application_batch)
    assert len(apps) == 1
    assert str(apps.first().id) == str(last_app_id)

    # No applications found
    response = handler_api_client.patch(
        url,
        {
            "application_ids": [first_app_id],
        },
    )

    assert response.status_code == 404

    # No batch found
    application_batch.delete()
    response = handler_api_client.patch(
        url,
        {
            "application_ids": [last_app_id],
        },
    )

    assert response.status_code == 404


def test_deassign_applications_from_batch_all(handler_api_client, application_batch):
    apps = Application.objects.filter(batch=application_batch)
    url = get_batch_detail_url(application_batch, "deassign_applications/")
    response = handler_api_client.patch(
        url,
        {
            "application_ids": list(map(lambda app: app.id, apps)),
            "batch_id": application_batch.id,
        },
    )
    assert response.status_code == 200
    with pytest.raises(ApplicationBatch.DoesNotExist):
        application_batch.refresh_from_db()


@pytest.mark.parametrize(
    "batch_status,status_code,changed_status",
    [
        (ApplicationBatchStatus.COMPLETED, 200, None),
        (ApplicationBatchStatus.SENT_TO_TALPA, 400, None),
        (ApplicationBatchStatus.RETURNED, 400, None),
        (ApplicationBatchStatus.DECIDED_ACCEPTED, 200, None),
        (ApplicationBatchStatus.DECIDED_REJECTED, 200, None),
        (ApplicationBatchStatus.DRAFT, 200, ApplicationBatchStatus.DRAFT),
        (
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            200,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
        ),
        (
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
            200,
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
        ),
    ],
)
def test_batch_status_change(
    handler_api_client, application_batch, batch_status, status_code, changed_status
):
    url = get_batch_detail_url(application_batch, "status/")
    response = handler_api_client.patch(url, {"status": batch_status})
    assert response.status_code == status_code
    if changed_status:
        assert response.data["status"] == changed_status


def test_batch_too_many_drafts(application_batch):
    # Create a second batch to get to two batch limit
    ApplicationBatchFactory(
        status=ApplicationBatchStatus.DRAFT,
        proposal_for_decision=ApplicationStatus.REJECTED,
    ),

    # Create a batch with different status and try putting it in draft
    batch_with_status_change = ApplicationBatchFactory(
        status=ApplicationBatchStatus.AWAITING_AHJO_DECISION,
        proposal_for_decision=ApplicationStatus.REJECTED,
    )
    batch_with_status_change.status = ApplicationBatchStatus.DRAFT
    with pytest.raises(BatchTooManyDraftsError):
        batch_with_status_change.save()

    # Create more drafts, accepted and rejected, should fail
    with pytest.raises(BatchTooManyDraftsError):
        ApplicationBatchFactory(
            status=ApplicationBatchStatus.DRAFT,
            proposal_for_decision=ApplicationStatus.ACCEPTED,
        )
    with pytest.raises(BatchTooManyDraftsError):
        ApplicationBatchFactory(
            status=ApplicationBatchStatus.DRAFT,
            proposal_for_decision=ApplicationStatus.REJECTED,
        )


@pytest.mark.parametrize(
    "batch_status,delta_months,delta_days",
    [
        (ApplicationBatchStatus.DECIDED_ACCEPTED, 3, 1),
        (ApplicationBatchStatus.DECIDED_ACCEPTED, -3, -1),
        (ApplicationBatchStatus.DECIDED_REJECTED, 3, 1),
        (ApplicationBatchStatus.DECIDED_REJECTED, -3, -1),
    ],
)
def test_batch_status_decided(
    handler_api_client, application_batch, batch_status, delta_months, delta_days
):
    def remove_inspection_data_from_batch(batch):
        batch.p2p_inspector_name = ""
        batch.p2p_inspector_email = ""
        batch.p2p_checker_name = ""
        batch.expert_inspector_name = ""
        batch.expert_inspector_title = ""
        batch.save()

    url = get_batch_detail_url(application_batch, "status/")
    payload = (
        get_valid_batch_completion_data()
        if batch_status == ApplicationBatchStatus.DECIDED_ACCEPTED
        else get_valid_rejected_batch_completion_data()
    )
    payload["status"] = batch_status

    # With exact months
    payload["decision_date"] = date.today() + relativedelta(months=(delta_months))
    response = handler_api_client.patch(url, payload)
    assert response.status_code == 200

    # Use Ahjo inspector
    remove_inspection_data_from_batch(application_batch)
    payload = get_valid_ahjo_batch_completion_data()
    payload["decision_date"] = date.today() + relativedelta(months=(delta_months))
    payload["status"] = batch_status
    response = handler_api_client.patch(url, payload)
    assert response.status_code == 200

    # Use Talpa/P2P inspector
    remove_inspection_data_from_batch(application_batch)
    payload = get_valid_p2p_batch_completion_data()
    payload["status"] = batch_status
    payload["decision_date"] = date.today() + relativedelta(months=(delta_months))
    response = handler_api_client.patch(url, payload)
    assert response.status_code == 200


@pytest.mark.parametrize(
    "status,batch_status,expected_decision",
    [
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            None,
        ),
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.RETURNED,
            None,
        ),
        (
            ApplicationStatus.REJECTED,
            ApplicationBatchStatus.RETURNED,
            None,
        ),
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
        ),
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
            AhjoDecision.DECIDED_REJECTED,
        ),
        (
            ApplicationStatus.REJECTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
            AhjoDecision.DECIDED_REJECTED,
        ),
        (
            ApplicationStatus.REJECTED,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
        ),
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.SENT_TO_TALPA,
            AhjoDecision.DECIDED_ACCEPTED,
        ),
        (
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.COMPLETED,
            AhjoDecision.DECIDED_ACCEPTED,
        ),
    ],
)
def test_get_application_with_ahjo_decision(
    handler_api_client,
    application_batch,
    status,
    batch_status,
    expected_decision,
    mock_get_organisation_roles_and_create_company,
):
    company = mock_get_organisation_roles_and_create_company
    application_batch.status = batch_status
    if expected_decision:
        application_batch.proposal_for_decision = expected_decision
    elif status == ApplicationStatus.ACCEPTED:
        application_batch.proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
    else:
        application_batch.proposal_for_decision = AhjoDecision.DECIDED_REJECTED

    application_batch.applications.all().update(status=status, company=company)

    fill_as_valid_batch_completion_and_save(application_batch)
    application = application_batch.applications.all().first()
    response = handler_api_client.get(get_handler_detail_url(application))
    assert response.status_code == 200
    assert response.data["ahjo_decision"] == expected_decision
    assert response.data["batch"]["status"] == batch_status


def test_application_post_success(handler_api_client, application_batch):
    """
    Create a new application batch
    """
    data = ApplicationBatchSerializer(
        application_batch, context={"request": handler_api_client}
    ).data
    application_batch.delete()
    assert len(ApplicationBatch.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    response = handler_api_client.post(
        reverse("v1:applicationbatch-list"),
        data,
    )
    assert response.status_code == 201
    assert response.data["proposal_for_decision"] == data["proposal_for_decision"]
    assert response.data["decision_maker_title"] == data["decision_maker_title"]
    assert response.data["decision_maker_name"] == data["decision_maker_name"]
    assert response.data["section_of_the_law"] == data["section_of_the_law"]
    assert response.data["decision_date"] == data["decision_date"]
    assert response.data["expert_inspector_name"] == data["expert_inspector_name"]
    assert response.data["expert_inspector_email"] == data["expert_inspector_email"]

    new_application_batch = ApplicationBatch.objects.all().first()
    assert new_application_batch.decision_maker_title == data["decision_maker_title"]
    assert datetime.fromisoformat(data["created_at"]) == datetime(
        2021, 6, 4, tzinfo=pytz.UTC
    )


def test_application_post_success_with_applications(
    handler_api_client, application_batch
):
    """
    Create a new application batch with applications
    """
    application_batch.status = ApplicationBatchStatus.DRAFT
    application_batch.proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
    application1 = ApplicationFactory(status=ApplicationStatus.ACCEPTED)
    application2 = ApplicationFactory(status=ApplicationStatus.ACCEPTED)
    data = ApplicationBatchSerializer(application_batch).data
    application_batch.delete()
    assert len(ApplicationBatch.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    data["applications"] = [application1.pk, application2.pk]
    response = handler_api_client.post(
        reverse("v1:applicationbatch-list"),
        data,
    )
    assert response.status_code == 201
    assert set(response.data["applications"]) == {application1.pk, application2.pk}
    assert (
        len(ApplicationBatch.objects.get(pk=response.data["id"]).applications.all())
        == 2
    )


def test_application_batch_put_edit_fields(handler_api_client, application_batch):
    """
    modify existing application batch
    """
    data = ApplicationBatchSerializer(application_batch).data
    data["proposal_for_decision"] = AhjoDecision.DECIDED_ACCEPTED
    application_batch.applications.all().update(status=ApplicationStatus.ACCEPTED)
    data["decision_maker_title"] = get_faker().job()
    data["decision_maker_name"] = get_faker().name()
    data["section_of_the_law"] = "$1234"
    data["decision_date"] = "2021-08-02"
    data["expert_inspector_name"] = get_faker().name()
    data["expert_inspector_email"] = get_faker().email()

    response = handler_api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == 200
    assert response.data["proposal_for_decision"] == AhjoDecision.DECIDED_ACCEPTED
    assert response.data["decision_maker_title"] == data["decision_maker_title"]
    assert response.data["decision_maker_name"] == data["decision_maker_name"]
    assert response.data["section_of_the_law"] == data["section_of_the_law"]
    assert response.data["decision_date"] == data["decision_date"]
    assert response.data["expert_inspector_name"] == data["expert_inspector_name"]
    assert response.data["expert_inspector_email"] == data["expert_inspector_email"]

    application_batch.refresh_from_db()
    assert application_batch.decision_maker_title == data["decision_maker_title"]


def test_application_batch_put_read_only_fields(handler_api_client, application_batch):
    """
    Read-only fields are ignored when editing a batch
    """

    data = ApplicationBatchSerializer(application_batch).data
    original_data = data.copy()

    data["id"] = str(uuid.uuid4())
    data["created_at"] = "2021-08-19T11:23:56"

    response = handler_api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == 200
    assert original_data["id"] == response.data["id"]
    assert original_data["created_at"] == response.data["created_at"]


@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (
            ApplicationBatchStatus.DRAFT,
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
            200,
        ),
        (
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            200,
        ),
        (
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            200,
        ),
        (
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            ApplicationBatchStatus.DECIDED_REJECTED,
            200,
        ),
        (
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            ApplicationBatchStatus.RETURNED,
            200,
        ),
        (
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.SENT_TO_TALPA,
            200,
        ),
        (ApplicationBatchStatus.RETURNED, ApplicationBatchStatus.DRAFT, 200),
        (ApplicationBatchStatus.SENT_TO_TALPA, ApplicationBatchStatus.COMPLETED, 200),
        (
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            400,
        ),
        (
            ApplicationBatchStatus.DECIDED_REJECTED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            400,
        ),
        (
            ApplicationBatchStatus.RETURNED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            400,
        ),
        (ApplicationBatchStatus.RETURNED, ApplicationBatchStatus.SENT_TO_TALPA, 400),
        (
            ApplicationBatchStatus.DECIDED_REJECTED,
            ApplicationBatchStatus.SENT_TO_TALPA,
            400,
        ),
        (ApplicationBatchStatus.COMPLETED, ApplicationBatchStatus.DRAFT, 400),
        (
            ApplicationBatchStatus.DRAFT,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            400,
        ),
        (
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            400,
        ),
    ],
)
def test_application_batch_status_change(
    handler_api_client, application_batch, from_status, to_status, expected_code
):
    """
    modify existing application_batch
    """
    application_batch.status = from_status
    fill_as_valid_batch_completion_and_save(application_batch)
    data = ApplicationBatchSerializer(application_batch).data
    data["status"] = to_status

    response = handler_api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == expected_code
    application_batch.refresh_from_db()
    if expected_code == 200:
        assert application_batch.status == to_status
    else:
        assert application_batch.status == from_status


@pytest.mark.parametrize(
    "status,proposal_for_decision,batch_status,expected_result",
    [
        (
            ApplicationStatus.ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DRAFT,
            200,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoDecision.DECIDED_REJECTED,
            ApplicationBatchStatus.DRAFT,
            200,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            400,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
            ApplicationBatchStatus.COMPLETED,
            400,
        ),
        (
            ApplicationStatus.ACCEPTED,
            AhjoDecision.DECIDED_REJECTED,
            ApplicationBatchStatus.DRAFT,
            400,
        ),
        (
            ApplicationStatus.REJECTED,
            AhjoDecision.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DRAFT,
            400,
        ),
    ],
)
def test_application_batch_add_applications(
    handler_api_client,
    application_batch,
    application,
    status,
    proposal_for_decision,
    batch_status,
    expected_result,
):
    """
    modify existing application batch: add a new application to batch
    """
    application_batch.status = batch_status
    application_batch.proposal_for_decision = proposal_for_decision
    application_batch.save()
    Application.objects.all().update(status=status)
    application_batch.refresh_from_db()
    data = ApplicationBatchSerializer(application_batch).data
    original_data = copy.deepcopy(data)
    data["applications"].append(application.pk)

    response = handler_api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == expected_result
    if expected_result == 200:
        assert set(response.data["applications"]) == set(data["applications"])
    else:
        application_batch.refresh_from_db()
        assert {
            application.pk for application in application_batch.applications.all()
        } == set(original_data["applications"])


def test_application_batch_delete_applications(handler_api_client, application_batch):
    """
    modify existing application batch: add a new application to batch
    """
    data = ApplicationBatchSerializer(application_batch).data
    data["applications"] = []

    response = handler_api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == 200
    assert response.data["applications"] == []
    assert Application.objects.all().count() == 2
    assert (
        Application.objects.filter(batch__isnull=True).count() == 2
    )  # "batch" field is set to NULL when application is removed from batch


def test_application_delete(handler_api_client, application_batch):
    response = handler_api_client.delete(get_batch_detail_url(application_batch))
    assert len(ApplicationBatch.objects.all()) == 0
    assert (
        len(Application.objects.all()) == 2
    )  # applications are not deleted with the batch
    assert response.status_code == 204


@patch("applications.api.v1.application_batch_views.export_application_batch")
def test_application_batch_export(mock_export, handler_api_client, application_batch):
    # Mock export pdf function to reduce test time, the unittest for the export feature will be run separately
    mock_export.return_value = {}
    # Export invalid batch
    application_batch.status = ApplicationBatchStatus.SENT_TO_TALPA
    application_batch.save()
    response = handler_api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    assert response.status_code == 400

    # Export draft batch then change it status
    application_batch.status = ApplicationBatchStatus.DRAFT
    application_batch.save()
    response = handler_api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    application_batch.refresh_from_db()
    assert application_batch.status == ApplicationBatchStatus.AHJO_REPORT_CREATED

    assert response.headers["Content-Type"] == "application/x-zip-compressed"
    assert response.status_code == 200

    # Export draft batch again
    response = handler_api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    application_batch.refresh_from_db()
    assert application_batch.status == ApplicationBatchStatus.AHJO_REPORT_CREATED

    assert response.headers["Content-Type"] == "application/x-zip-compressed"
    assert response.status_code == 200

    # Export empty batch
    application_batch.applications.clear()
    response = handler_api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    application_batch.refresh_from_db()
    assert response.status_code == 400


def test_application_batches_talpa_export(anonymous_client, application_batch):
    response = anonymous_client.get(reverse("v1:applicationbatch-talpa-export-batch"))
    assert response.status_code == 401

    # Add basic auth header
    credentials = base64.b64encode(settings.TALPA_ROBOT_AUTH_CREDENTIAL.encode("utf-8"))
    anonymous_client.credentials(
        HTTP_AUTHORIZATION="Basic {}".format(credentials.decode("utf-8"))
    )

    # Export invalid batch
    application_batch.status = ApplicationBatchStatus.DECIDED_REJECTED
    fill_as_valid_batch_completion_and_save(application_batch)
    response = anonymous_client.get(reverse("v1:applicationbatch-talpa-export-batch"))
    assert response.status_code == 404
    assert "There is no available application to export" in response.data["detail"]

    application_batch.status = ApplicationBatchStatus.DECIDED_ACCEPTED
    application_batch.save()

    # Let's create another accepted batch
    app_batch_2 = ApplicationBatchFactory()
    app_batch_2.status = ApplicationBatchStatus.DECIDED_ACCEPTED
    fill_as_valid_batch_completion_and_save(app_batch_2)

    url = reverse("v1:applicationbatch-talpa-export-batch")

    # Export accepted batches then change it status
    response = anonymous_client.get(f"{url}?skip_update=0")

    application_batch.refresh_from_db()
    app_batch_2.refresh_from_db()
    assert application_batch.status == ApplicationBatchStatus.SENT_TO_TALPA
    assert app_batch_2.status == ApplicationBatchStatus.SENT_TO_TALPA

    applications = Application.objects.filter(
        batch__in=[application_batch, app_batch_2]
    )
    for application in applications:
        assert (
            application.talpa_status
            == ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA
        )
        assert application.archived is True

    assert isinstance(response, HttpResponse)
    assert response.headers["Content-Type"] == "text/csv"
    assert response.status_code == 200
