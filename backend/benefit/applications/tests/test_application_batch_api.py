import copy
import uuid
from datetime import datetime
from unittest.mock import patch

import pytest
import pytz
from applications.api.v1.serializers import ApplicationBatchSerializer
from applications.enums import AhjoDecision, ApplicationBatchStatus, ApplicationStatus
from applications.models import Application, ApplicationBatch
from applications.tests.conftest import *  # noqa
from applications.tests.factories import ApplicationFactory
from applications.tests.test_applications_api import get_detail_url
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from rest_framework.reverse import reverse


def get_batch_detail_url(application_batch):
    return reverse("v1:applicationbatch-detail", kwargs={"pk": application_batch.id})


def test_get_application_batch(api_client, application_batch):
    response = api_client.get(get_batch_detail_url(application_batch))
    assert response.status_code == 200
    assert len(response.data["applications"]) == 2


def test_applications_batch_list(api_client, application_batch):
    response = api_client.get(reverse("v1:applicationbatch-list"))
    assert len(response.data) == 1
    assert response.status_code == 200


def test_applications_batch_list_with_filter(api_client, application_batch):
    application_batch.status = ApplicationBatchStatus.DRAFT
    application_batch.save()
    url1 = reverse("v1:applicationbatch-list") + "?status=draft"
    response = api_client.get(url1)
    assert len(response.data) == 1
    assert response.status_code == 200

    url2 = reverse("v1:applicationbatch-list") + "?status=awaiting_ahjo_decision"
    response = api_client.get(url2)
    assert len(response.data) == 0
    assert response.status_code == 200

    url3 = reverse("v1:applicationbatch-list") + "?status=awaiting_ahjo_decision,draft"
    response = api_client.get(url3)
    assert len(response.data) == 1
    assert response.status_code == 200


@pytest.mark.parametrize(
    "status,batch_status,expected_decision",
    [
        (ApplicationStatus.DRAFT, ApplicationBatchStatus.DRAFT, None),
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
    api_client, application_batch, status, batch_status, expected_decision
):
    application_batch.status = batch_status
    if expected_decision:
        application_batch.proposal_for_decision = expected_decision
    elif status == ApplicationStatus.ACCEPTED:
        application_batch.proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
    else:
        application_batch.proposal_for_decision = AhjoDecision.DECIDED_REJECTED

    application_batch.save()
    application_batch.applications.all().update(status=status)
    application = application_batch.applications.all().first()
    response = api_client.get(get_detail_url(application))
    assert response.status_code == 200
    assert response.data["ahjo_decision"] == expected_decision
    assert response.data["batch"]["status"] == batch_status


def test_application_post_success(api_client, application_batch):
    """
    Create a new application batch
    """
    data = ApplicationBatchSerializer(application_batch).data
    application_batch.delete()
    assert len(ApplicationBatch.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    response = api_client.post(
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


def test_application_post_success_with_applications(api_client, application_batch):
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
    response = api_client.post(
        reverse("v1:applicationbatch-list"),
        data,
    )
    assert response.status_code == 201
    assert set(response.data["applications"]) == {application1.pk, application2.pk}
    assert (
        len(ApplicationBatch.objects.get(pk=response.data["id"]).applications.all())
        == 2
    )


def test_application_batch_put_edit_fields(api_client, application_batch):
    """
    modify existing application batch
    """
    data = ApplicationBatchSerializer(application_batch).data
    data["proposal_for_decision"] = AhjoDecision.DECIDED_ACCEPTED
    application_batch.applications.all().update(status=ApplicationStatus.ACCEPTED)
    data["decision_maker_title"] = "abcd"
    data["decision_maker_name"] = "Matti Haavikko"
    data["section_of_the_law"] = "abcd"
    data["decision_date"] = "2021-08-02"
    data["expert_inspector_name"] = "Matti Haavikko"
    data["expert_inspector_email"] = "test@example.com"

    response = api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == 200
    assert response.data["proposal_for_decision"] == AhjoDecision.DECIDED_ACCEPTED
    assert response.data["decision_maker_title"] == "abcd"
    assert response.data["decision_maker_name"] == "Matti Haavikko"
    assert response.data["section_of_the_law"] == "abcd"
    assert response.data["decision_date"] == "2021-08-02"
    assert response.data["expert_inspector_name"] == "Matti Haavikko"
    assert response.data["expert_inspector_email"] == "test@example.com"

    application_batch.refresh_from_db()
    assert application_batch.decision_maker_title == "abcd"


def test_application_batch_put_read_only_fields(api_client, application_batch):
    """
    Read-only fields are ignored when editing a batch
    """

    data = ApplicationBatchSerializer(application_batch).data
    original_data = data.copy()

    data["id"] = str(uuid.uuid4())
    data["created_at"] = "2021-08-19T11:23:56"

    response = api_client.put(
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
    ],
)
def test_application_batch_status_change(
    api_client, application_batch, from_status, to_status, expected_code
):
    """
    modify existing application_batch
    """
    application_batch.status = from_status
    application_batch.save()
    data = ApplicationBatchSerializer(application_batch).data
    data["status"] = to_status

    response = api_client.put(
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
    api_client,
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

    response = api_client.put(
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


def test_application_batch_delete_applications(api_client, application_batch):
    """
    modify existing application batch: add a new application to batch
    """
    data = ApplicationBatchSerializer(application_batch).data
    data["applications"] = []

    response = api_client.put(
        get_batch_detail_url(application_batch),
        data,
    )
    assert response.status_code == 200
    assert response.data["applications"] == []
    assert Application.objects.all().count() == 2
    assert (
        Application.objects.filter(batch__isnull=True).count() == 2
    )  # "batch" field is set to NULL when application is removed from batch


def test_application_delete(api_client, application_batch):
    response = api_client.delete(get_batch_detail_url(application_batch))
    assert len(ApplicationBatch.objects.all()) == 0
    assert (
        len(Application.objects.all()) == 2
    )  # applications are not deleted with the batch
    assert response.status_code == 204


@patch("applications.api.v1.application_batch_views.export_application_batch")
def test_application_batch_export(mock_export, api_client, application_batch):
    # Mock export pdf function to reduce test time, the unittest for the export feature will be run separately
    mock_export.return_value = {}
    # Export invalid batch
    application_batch.status = ApplicationBatchStatus.SENT_TO_TALPA
    application_batch.save()
    response = api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    assert response.status_code == 400

    # Export draft batch then change it status
    application_batch.status = ApplicationBatchStatus.DRAFT
    application_batch.save()
    response = api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    application_batch.refresh_from_db()
    assert application_batch.status == ApplicationBatchStatus.AWAITING_AHJO_DECISION

    assert response.headers["Content-Type"] == "application/x-zip-compressed"
    assert response.status_code == 200

    # Export empty batch
    application_batch.applications.clear()
    response = api_client.get(
        reverse("v1:applicationbatch-export-batch", kwargs={"pk": application_batch.id})
    )
    application_batch.refresh_from_db()
    assert response.status_code == 400
