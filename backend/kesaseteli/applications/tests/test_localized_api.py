import pytest
from django.urls import reverse
from rest_framework import status

from applications.models import SummerVoucherConfiguration

TARGET_GROUP_TEST_CASES = [
    (
        "fi",
        "9. luokkalainen",
        "9. luokkalaiset: 16-vuotiaat, asuinpaikan on oltava Helsinki.",
    ),
    (
        "en",
        "9th grader",
        "9th graders: 16 years old, must live in Helsinki.",
    ),
    (
        "sv",
        "Elev i årskurs 9",
        "9:e-klassister: 16 år gamla, måste bo i Helsingfors.",
    ),
]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language, expected_name, expected_description",
    TARGET_GROUP_TEST_CASES,
)
def test_summer_voucher_configuration_localized_target_groups(
    api_client, language, expected_name, expected_description
):
    # Update or create configuration for the latest year to ensure it's the first in the response
    latest_config = SummerVoucherConfiguration.objects.order_by("-year").first()
    year = latest_config.year if latest_config else 2026

    SummerVoucherConfiguration.objects.update_or_create(
        year=year, defaults={"target_group": ["primary_target_group"]}
    )

    url = reverse("summer-voucher-configuration")

    response = api_client.get(url, HTTP_ACCEPT_LANGUAGE=language)
    assert response.status_code == status.HTTP_200_OK
    data = response.data[0]
    assert data["year"] == year
    target_group = data["target_groups"][0]
    assert target_group["id"] == "primary_target_group"
    assert target_group["name"] == expected_name
    assert target_group["description"] == expected_description


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language, expected_name, expected_description",
    TARGET_GROUP_TEST_CASES,
)
def test_target_group_list_localized(
    api_client, language, expected_name, expected_description
):
    url = reverse("target-group-list")

    response = api_client.get(url, HTTP_ACCEPT_LANGUAGE=language)
    assert response.status_code == status.HTTP_200_OK

    # Find primary_target_group in the list
    target_group = next(
        item for item in response.data if item["id"] == "primary_target_group"
    )
    assert target_group["name"] == expected_name
    assert target_group["description"] == expected_description
