import csv
from io import StringIO

import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_deminimis_callback_success(
    deminimis_client,
    decided_application_with_decision_date,
):
    application = decided_application_with_decision_date
    batch = application.batch
    assert batch.de_minimis_grant_send is False

    url = reverse("deminimis_callback_url")
    payload = {
        "status": "Success",
        "successful_applications": [application.application_number],
        "failed_applications": [],
    }

    response = deminimis_client.post(url, data=payload, format="json")

    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    batch.refresh_from_db()
    assert batch.de_minimis_grant_send is True


@pytest.mark.django_db
def test_deminimis_callback_failure(
    deminimis_client,
    decided_application_with_decision_date,
):
    application = decided_application_with_decision_date
    batch = application.batch

    url = reverse("deminimis_callback_url")
    payload = {
        "status": "Failure",
        "successful_applications": [],
        "failed_applications": [application.application_number],
    }

    response = deminimis_client.post(url, data=payload, format="json")

    assert response.status_code == 200
    assert response.data == {"message": "Callback received"}

    batch.refresh_from_db()
    assert batch.de_minimis_grant_send is False


@pytest.mark.parametrize(
    "payload",
    [
        # Missing status field
        {
            "successful_applications": [100001],
            "failed_applications": [],
        },
        # Invalid status value
        {
            "status": "InvalidStatus",
            "successful_applications": [100001],
            "failed_applications": [],
        },
        # Both lists empty
        {
            "status": "Success",
            "successful_applications": [],
            "failed_applications": [],
        },
    ],
)
@pytest.mark.django_db
def test_deminimis_callback_invalid_payload(deminimis_client, payload):
    url = reverse("deminimis_callback_url")
    response = deminimis_client.post(url, data=payload, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_get_deminimis_data(deminimis_client, decided_application_with_decision_date):
    application = decided_application_with_decision_date
    batch = application.batch
    url = (
        reverse("deminimis_integration_url")
        + f"?decision_date_after={batch.decision_date}"
        + f"&decision_date_before={batch.decision_date}"
    )

    response = deminimis_client.get(url)
    assert response["Content-Type"] == "text/csv"

    content = "".join([chunk.decode("utf-8") for chunk in response.streaming_content])

    # Parse CSV content
    csv_reader = csv.reader(StringIO(content), delimiter=";")
    rows = list(csv_reader)

    # Assert CSV has a header and at least one data row
    assert len(rows) > 1
    header = rows[0]
    assert '\ufeff"Hakemusnumero"' in header
    assert "TOL-koodi" in header

    assert rows[1][header.index('\ufeff"Hakemusnumero"')] == str(
        application.application_number
    )
