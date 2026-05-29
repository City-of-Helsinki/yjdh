"""Tests that Kesäseteli API endpoints match their documented request and response formats.

Those formats are defined by serializers in ``applications.api.v1.serializers``.
"""

import pytest
from django.http import HttpResponse
from django.test import Client
from rest_framework import serializers, status
from rest_framework.reverse import reverse

from applications.api.v1.serializers import (
    NonVtjYouthApplicationSerializer,
    YouthApplicationCreateWithoutSsnInputSerializer,
    YouthApplicationFetchEmployeeDataInputSerializer,
    YouthApplicationFetchEmployeeDataOutputSerializer,
    YouthApplicationOutputSerializer,
)
from applications.models import YouthApplication
from applications.tests.data.create_without_ssn_examples import (
    CREATE_WITHOUT_SSN_EXAMPLES,
)
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_restricted_content,
)
from common.tests.factories import (
    AcceptedYouthApplicationFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
)
from common.urls import get_create_without_ssn_url

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


def test_create_without_ssn_input_fields_match_non_vtj_client_fields():
    """Input serializer fields must stay aligned with NonVtj client field set."""
    input_fields = set(YouthApplicationCreateWithoutSsnInputSerializer().fields.keys())
    non_vtj_client_fields = set(NonVtjYouthApplicationSerializer.Meta.fields) - set(
        NonVtjYouthApplicationSerializer.Meta.read_only_fields
    )
    assert input_fields == non_vtj_client_fields


@pytest.mark.django_db
def test_create_without_ssn_contract(staff_client: Client):
    """The create-without-SSN endpoint must accept and return the declared shapes."""
    payload: dict = build_required_payload(
        YouthApplicationCreateWithoutSsnInputSerializer,
        CREATE_WITHOUT_SSN_EXAMPLES,
    )

    request_serializer = YouthApplicationCreateWithoutSsnInputSerializer(data=payload)
    assert request_serializer.is_valid(), request_serializer.errors

    response: HttpResponse = staff_client.post(
        get_create_without_ssn_url(),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    response_serializer = YouthApplicationOutputSerializer(data=response.json())
    assert response_serializer.is_valid(), response_serializer.errors
    assert YouthApplication.objects.filter(id=response.json()["id"]).exists()


@pytest.mark.django_db
def test_fetch_employee_data_contract(user_client: Client):
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
        YouthApplicationFetchEmployeeDataInputSerializer,
        FETCH_EMPLOYEE_DATA_EXAMPLES,
    )
    payload["employer_summer_voucher_id"] = str(employer_summer_voucher.id)

    request_serializer = YouthApplicationFetchEmployeeDataInputSerializer(data=payload)
    assert request_serializer.is_valid(), request_serializer.errors

    response: HttpResponse = user_client.post(
        reverse("v1:youthapplication-fetch-employee-data"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_200_OK
    response_serializer = YouthApplicationFetchEmployeeDataOutputSerializer(
        data=response.json()
    )
    assert response_serializer.is_valid(), response_serializer.errors
    assert response.json()["employee_name"] == "John Doe"
    assert response.json()["employee_postcode"] == "00100"


def test_fetch_employee_data_response_accepts_null_employee_home_city():
    """
    Regression test for turvakielto applicants with no home municipality.

    Some applicants have turvakielto. VTJ does not give us their home municipality.
    The response serializer must still accept a null home city field.

    Further context in PR #4089:
    https://github.com/City-of-Helsinki/yjdh/pull/4089
    """
    serializer = YouthApplicationFetchEmployeeDataOutputSerializer(
        data={
            "employer_summer_voucher_id": FETCH_EMPLOYEE_DATA_EXAMPLES[
                "employer_summer_voucher_id"
            ],
            "employee_name": "John Doe",
            "employee_birthdate": "1911-11-11",
            "employee_phone_number": "123456789",
            "employee_home_city": None,
            "employee_postcode": "00100",
            "employee_school": "Test school",
        }
    )
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["employee_home_city"] is None


@pytest.mark.django_db
def test_fetch_employee_data_contract_restricted_vtj_home_municipality(
    user_client: Client,
):
    """
    Regression test that employee lookup works when home municipality is missing.

    Employers find accepted applicants by last name and summer voucher number.
    With turvakielto, we may not know the home municipality. The API must still
    return 200 and the other employee details.

    Further context in PR #4089:
    https://github.com/City-of-Helsinki/yjdh/pull/4089
    """
    employer_summer_voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory()
    )
    youth_application = AcceptedYouthApplicationFactory(
        last_name="Turvakielto",
        is_vtj_data_restricted=True,
        encrypted_original_vtj_json=mock_vtj_person_id_query_restricted_content(
            first_name="Testi",
            last_name="Turvakielto",
            social_security_number="010101-0101",
        ),
    )
    # API lookup decodes user-showable serials (base32), not the raw DB integer.
    summer_voucher_serial_number = (
        youth_application.youth_summer_voucher.user_showable_serial_number
    )

    payload: dict = {
        "employer_summer_voucher_id": str(employer_summer_voucher.id),
        "employee_name": "Turvakielto",
        "summer_voucher_serial_number": summer_voucher_serial_number,
    }

    response: HttpResponse = user_client.post(
        reverse("v1:youthapplication-fetch-employee-data"),
        data=payload,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_200_OK
    response_body = response.json()
    assert response_body["employee_home_city"] is None
    response_serializer = YouthApplicationFetchEmployeeDataOutputSerializer(
        data=response_body
    )
    assert response_serializer.is_valid(), response_serializer.errors
