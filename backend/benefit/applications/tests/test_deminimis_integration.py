import csv
from io import StringIO

import pytest
from django.urls import reverse


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
