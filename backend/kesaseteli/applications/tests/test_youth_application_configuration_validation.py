import pytest
from django.utils import timezone
from rest_framework import status

from applications.models import SummerVoucherConfiguration, YouthApplication
from common.tests.utils import get_random_social_security_number_for_year
from common.urls import get_create_without_ssn_url, get_list_url


@pytest.mark.django_db
def test_create_youth_application_without_configuration(api_client):
    """
    Test that creating a youth application fails if no SummerVoucherConfiguration exists for the current year.
    """
    # Ensure no configuration exists for current year
    SummerVoucherConfiguration.objects.filter(year=timezone.now().year).delete()

    data = {
        "first_name": "Test",
        "last_name": "Applicant",
        "social_security_number": get_random_social_security_number_for_year(year=2009),
        "school": "Test School",
        "is_unlisted_school": False,
        "email": "test@example.com",
        "phone_number": "0401234567",
        "postcode": "00100",
        "language": "fi",
    }

    response = api_client.post(get_list_url(), data, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # The error message can be nested or a list. Checking if string is in the stringified response data.
    assert "Summer voucher configuration for current year does not exist" in str(
        response.data
    ), f"Response data: {response.data}"
    # Also verify no application was created
    assert YouthApplication.objects.count() == 0


@pytest.mark.django_db
def test_create_youth_application_with_configuration(api_client, settings):
    """
    Test that creating a youth application succeeds if SummerVoucherConfiguration exists for the current year.
    """
    settings.NEXT_PUBLIC_DISABLE_VTJ = True
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    # SummerVoucherConfiguration for current year (2026) is created by the autouse fixture in conftest.py
    # so we don't need to create it manually.
    assert SummerVoucherConfiguration.objects.filter(year=timezone.now().year).exists()

    data = {
        "first_name": "Test",
        "last_name": "Applicant",
        "social_security_number": get_random_social_security_number_for_year(year=2009),
        "school": "Test School",
        "is_unlisted_school": False,
        "email": "test@example.com",
        "phone_number": "0401234567",
        "postcode": "00100",
        "language": "fi",
    }

    response = api_client.post(get_list_url(), data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert YouthApplication.objects.count() == 1


@pytest.mark.django_db
def test_create_youth_application_without_ssn_without_configuration(
    api_client, staff_client
):
    """
    Test that creating a non-VTJ youth application fails if no SummerVoucherConfiguration exists for the current year.
    """
    # Ensure no configuration exists for current year
    SummerVoucherConfiguration.objects.filter(year=timezone.now().year).delete()

    data = {
        "first_name": "Test",
        "last_name": "Applicant",
        "non_vtj_birthdate": "2009-01-01",
        "non_vtj_home_municipality": "Helsinki",
        "school": "Test School",
        "email": "test@example.com",
        "phone_number": "0401234567",
        "postcode": "00100",
        "language": "fi",
        "additional_info_description": "Reason",
    }

    response = staff_client.post(get_create_without_ssn_url(), data, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Summer voucher configuration for current year does not exist" in str(
        response.data
    ), f"Response data: {response.data}"
    assert YouthApplication.objects.count() == 0


@pytest.mark.django_db
def test_create_youth_application_without_ssn_with_configuration(
    api_client, staff_client
):
    """
    Test that creating a non-VTJ youth application succeeds if SummerVoucherConfiguration exists for the current year.
    """
    # SummerVoucherConfiguration for current year (2026) is created by the autouse fixture.
    assert SummerVoucherConfiguration.objects.filter(year=timezone.now().year).exists()

    data = {
        "first_name": "Test",
        "last_name": "Applicant",
        "non_vtj_birthdate": "2009-01-01",
        "non_vtj_home_municipality": "Helsinki",
        "school": "Test School",
        "email": "test@example.com",
        "phone_number": "0401234567",
        "postcode": "00100",
        "language": "fi",
        "additional_info_description": "Reason",
    }

    response = staff_client.post(get_create_without_ssn_url(), data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert YouthApplication.objects.count() == 1
