"""Contract tests for Kesäseteli OpenAPI request and response serializers."""

import pytest
from django.http import HttpResponse
from django.test import Client
from rest_framework import serializers, status
from rest_framework.reverse import reverse

from applications.api.v1.openapi_serializers import (
    YouthApplicationCreateWithoutSsnRequestSerializer,
    YouthApplicationFetchEmployeeDataRequestSerializer,
    YouthApplicationFetchEmployeeDataResponseSerializer,
    YouthApplicationIdResponseSerializer,
)
from applications.target_groups import NinthGraderTargetGroup
from applications.tests.data.mock_vtj import mock_vtj_person_id_query_found_content
from common.tests.factories import (
    AcceptedYouthApplicationFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
)
from common.urls import get_create_without_ssn_url

CREATE_WITHOUT_SSN_EXAMPLES: dict = {
    "first_name": "Testi",
    "last_name": "Testaaja",
    "email": "test@example.org",
    "school": "Testikoulu",
    "phone_number": "+358-50-1234567",
    "postcode": "00123",
    "language": "sv",
    "non_vtj_birthdate": "2012-12-31",
    "additional_info_description": "Testilisätiedot",
    "target_group": NinthGraderTargetGroup.identifier,
}

FETCH_EMPLOYEE_DATA_EXAMPLES: dict = {
    "employer_summer_voucher_id": "01234567-89ab-cdef-0123-456789abcdef",
    "employee_name": "John Doe",
    "summer_voucher_serial_number": "123",
}


def build_required_payload(
    serializer_class: type[serializers.Serializer],
    examples: dict,
) -> dict:
    """Build the smallest payload that satisfies the required fields.

    Args:
        serializer_class: Serializer class whose required fields define the
            payload shape.
        examples: Example values keyed by serializer field name.

    Returns:
        A minimal payload containing the required serializer fields.

    Raises:
        AssertionError: If a required field does not have an example value.
    """
    serializer = serializer_class()
    payload: dict = {}

    for field_name, field in serializer.fields.items():
        if field.read_only or not field.required:
            continue
        if field_name not in examples:
            raise AssertionError(
                f"Missing example value for required field {field_name!r} in "
                f"{serializer_class.__name__}"
            )
        payload[field_name] = examples[field_name]

    return payload


@pytest.mark.django_db
def test_create_without_ssn_contract(staff_client: Client) -> None:
    """The create-without-SSN endpoint must accept and return the declared shapes."""
    payload: dict = build_required_payload(
        YouthApplicationCreateWithoutSsnRequestSerializer,
        CREATE_WITHOUT_SSN_EXAMPLES,
    )

    request_serializer = YouthApplicationCreateWithoutSsnRequestSerializer(data=payload)
    assert request_serializer.is_valid(), request_serializer.errors

    response: HttpResponse = staff_client.post(
        get_create_without_ssn_url(),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    response_serializer = YouthApplicationIdResponseSerializer(data=response.json())
    assert response_serializer.is_valid(), response_serializer.errors


@pytest.mark.django_db
def test_fetch_employee_data_contract(user_client: Client) -> None:
    """The employee-data lookup endpoint must accept and return the declared shapes."""
    employer_summer_voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory()
    )
    AcceptedYouthApplicationFactory(
        first_name="John",
        last_name="Doe",
        youth_summer_voucher__summer_voucher_serial_number=123,
        social_security_number="111111-111C",
        phone_number="123456789",
        postcode="00100",
        school="Test school",
        encrypted_original_vtj_json=mock_vtj_person_id_query_found_content(
            first_name="John",
            last_name="Doe",
            social_security_number="111111-111C",
            is_alive=True,
            is_home_municipality_helsinki=True,
        ),
    )

    payload: dict = build_required_payload(
        YouthApplicationFetchEmployeeDataRequestSerializer,
        FETCH_EMPLOYEE_DATA_EXAMPLES,
    )
    payload["employer_summer_voucher_id"] = str(employer_summer_voucher.id)

    request_serializer = YouthApplicationFetchEmployeeDataRequestSerializer(
        data=payload
    )
    assert request_serializer.is_valid(), request_serializer.errors

    response: HttpResponse = user_client.post(
        reverse("v1:youthapplication-fetch-employee-data"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_200_OK
    response_serializer = YouthApplicationFetchEmployeeDataResponseSerializer(
        data=response.json()
    )
    assert response_serializer.is_valid(), response_serializer.errors
