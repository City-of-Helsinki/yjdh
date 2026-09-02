import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from applications.enums import JobType


def test_job_type_list_api_unauthenticated():
    client = APIClient()
    url = reverse("job-type-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert len(data) == len(JobType.choices)

    identifiers = [item["id"] for item in data]
    for value, _ in JobType.choices:
        assert value in identifiers

    first_item = data[0]
    assert "id" in first_item
    assert "name" in first_item


@pytest.mark.parametrize(
    "lang,expected_name",
    [
        ("fi", "Liikunta ja vapaa-aika"),
        ("sv", "Sport och fritid"),
        ("en", "Sports and leisure"),
    ],
)
def test_job_type_list_api_translations(lang, expected_name):
    client = APIClient()
    url = reverse("job-type-list")
    response = client.get(url, HTTP_ACCEPT_LANGUAGE=lang)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    sports_item = next(
        (item for item in data if item["id"] == "sports_and_leisure"), None
    )
    assert sports_item is not None
    assert sports_item["name"] == expected_name
