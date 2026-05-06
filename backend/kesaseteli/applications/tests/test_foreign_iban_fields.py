import pytest
from django.urls import reverse
from rest_framework import status

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
)
from applications.enums import EmployerApplicationStatus


@pytest.mark.django_db
class TestForeignIbanFields:
    def test_application_foreign_iban_fields_persistence(self, api_client, application):
        """
        Verify that foreign IBAN fields are correctly saved and retrieved via the API.
        """
        url = reverse("v1:employerapplication-detail", kwargs={"pk": application.id})
        data = EmployerApplicationSerializer(application).data

        data.update(
            {
                "payee_name": "Foreign Payee",
                "payee_address": "Foreign Address 123",
                "bank_swift_bic_code": "SWIFT123",
                "bank_name": "Foreign Bank",
                "bank_address": "Bank Street 456",
            }
        )

        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK

        assert response.data["payee_name"] == "Foreign Payee"
        assert response.data["payee_address"] == "Foreign Address 123"
        assert response.data["bank_swift_bic_code"] == "SWIFT123"
        assert response.data["bank_name"] == "Foreign Bank"
        assert response.data["bank_address"] == "Bank Street 456"

        application.refresh_from_db()
        assert application.payee_name == "Foreign Payee"
        assert application.payee_address == "Foreign Address 123"
        assert application.bank_swift_bic_code == "SWIFT123"
        assert application.bank_name == "Foreign Bank"
        assert application.bank_address == "Bank Street 456"

    @pytest.mark.parametrize(
        "field_name",
        [
            "payee_name",
            "payee_address",
            "bank_swift_bic_code",
            "bank_name",
            "bank_address",
        ],
    )
    def test_required_foreign_iban_fields_on_submission(
        self, api_client, application, summer_voucher, field_name
    ):
        """
        Verify that foreign IBAN fields are required when submitting an application with a foreign IBAN.
        """
        url = reverse("v1:employerapplication-detail", kwargs={"pk": application.id})
        data = EmployerApplicationSerializer(application).data

        # Set a foreign IBAN (German)
        data["bank_account_number"] = "DE89370400440532013000"
        data["status"] = EmployerApplicationStatus.SUBMITTED

        # Initialize all required foreign fields to valid values first
        data.update(
            {
                "payee_name": "Test Payee",
                "payee_address": "Test Address",
                "bank_swift_bic_code": "TESTBIC",
                "bank_name": "Test Bank",
                "bank_address": "Bank Address",
            }
        )

        # Then empty the specific field we want to test
        data[field_name] = ""

        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert field_name in response.data
        assert "field is required" in str(response.data).lower()
