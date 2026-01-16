import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from applications.target_groups import (
    NinthGraderTargetGroup,
    UpperSecondaryFirstYearTargetGroup,
)


@pytest.mark.django_db
def test_target_group_list_api():
    client = APIClient()
    url = reverse("target-group-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert len(data) >= 2

    # Check that known groups are present
    identifiers = [item["id"] for item in data]
    assert NinthGraderTargetGroup().identifier in identifiers
    assert UpperSecondaryFirstYearTargetGroup().identifier in identifiers

    # Check structure
    first_item = data[0]
    assert "id" in first_item
    assert "name" in first_item
