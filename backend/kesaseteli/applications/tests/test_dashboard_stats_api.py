import pytest
from django.test import override_settings
from rest_framework import status
from rest_framework.reverse import reverse

from applications.enums import EmployerApplicationStatus, YouthApplicationStatus
from common.tests.factories import (
    EmployerApplicationFactory,
    YouthApplicationFactory,
)
from shared.common.tests.factories import UserFactory


@pytest.mark.django_db
def test_dashboard_stats_api_staff_success(staff_client, django_assert_max_num_queries):
    # Create Youth Applications
    YouthApplicationFactory(status=YouthApplicationStatus.AWAITING_MANUAL_PROCESSING)
    YouthApplicationFactory.create_batch(2, status=YouthApplicationStatus.ACCEPTED)
    YouthApplicationFactory(status=YouthApplicationStatus.REJECTED)
    YouthApplicationFactory(
        status=YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
    )

    # Create Employer Applications
    EmployerApplicationFactory.create_batch(
        2, status=EmployerApplicationStatus.SUBMITTED
    )
    EmployerApplicationFactory(
        status=EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
    )
    EmployerApplicationFactory(status=EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT)

    # We expect at most 4 queries for the data aggregation:
    # 2 for the session and user fetching (caused by the permission decorator).
    # 2 for the actual data aggregation (youth_counts and employer_counts).
    with django_assert_max_num_queries(4):
        response = staff_client.get(reverse("dashboard-stats"))
    assert response.status_code == status.HTTP_200_OK

    # Strict snapshot value validation:
    assert response.data == {
        "youth_applications": {
            "pending": 2,
            "processed": 3,
            "raw_counts": {
                "awaiting_manual_processing": 1,
                "additional_information_provided": 1,
                "accepted": 2,
                "rejected": 1,
            },
        },
        "employer_applications": {
            "pending": 3,
            "processed": 1,
            "raw_counts": {
                "submitted": 2,
                "additional_information_provided": 1,
                "accepted_for_payment": 1,
            },
        },
    }


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_dashboard_stats_api_unauthenticated_returns_401(client):
    response = client.get(
        reverse("dashboard-stats"), headers={"Accept": "application/json"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_dashboard_stats_api_unauthorized_returns_403(client):
    user = UserFactory()
    client.force_login(user)
    response = client.get(
        reverse("dashboard-stats"), headers={"Accept": "application/json"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
