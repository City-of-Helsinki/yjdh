import pytest
from django.urls import reverse
from rest_framework import status

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
)
from applications.enums import EmployerApplicationStatus, YouthApplicationStatus
from applications.models import (
    EmployerSummerVoucher,
    YouthSummerVoucher,
)
from common.tests.factories import EmployerApplicationFactory
from shared.common.tests.factories import UserFactory

"""
This test suite verifies the validation and permission logic for Employer Applications.
It ensures that:
- Vouchers are correctly linked only when student data matches.
- Vouchers cannot be reused across different applications.
- Users within the same company have visibility and update access to company applications.
- Vouchers can only be linked if the source Youth Application is in ACCEPTED status.
"""


def get_detail_url(application):
    return reverse("v1:employerapplication-detail", kwargs={"pk": str(application.id)})


@pytest.fixture
def active_voucher(accepted_youth_application):
    """A voucher derived from the global accepted_youth_application fixture."""
    return accepted_youth_application.youth_summer_voucher


@pytest.fixture(autouse=True)
def disable_mock_flag(settings):
    """Disable mock flag to ensure real company logic is tested."""
    settings.NEXT_PUBLIC_MOCK_FLAG = False


@pytest.mark.django_db
class TestEmployerApplicationValidation:
    def test_update_permission_allowed_for_company_colleague(self, api_client, company):
        """
        Verify that a company colleague CAN update a draft application belonging to their company.
        """
        # 1. Create a draft application for a specific company.
        application = EmployerApplicationFactory(
            company=company, status=EmployerApplicationStatus.DRAFT
        )

        # 2. Authenticate as a completely different user (the "colleague").
        # Note: In this system, company access isn't tied to the User model itself.
        # Instead, it's tied to the "organization_roles" stored in the active SESSION.
        # The api_client fixture already has the 'company' in its session via `store_company_in_session`.
        api_client.force_authenticate(user=UserFactory())

        # 3. Even though the User changed, the 'api_client' fixture preserves its session.
        # That session already contains 'company.business_id' (set by store_company_in_session).
        # This simulates a different person logged into the same organizational context.
        data = EmployerApplicationSerializer(application).data
        data["street_address"] = "New Company Address"

        # 4. Attempt to update the application via the API.
        # The backend's permission logic will fetch the company from the session,
        # find that it matches the application's company, and allow the update.
        response = api_client.put(get_detail_url(application), data)

        assert response.status_code == status.HTTP_200_OK, response.data
        application.refresh_from_db()
        assert application.street_address == "New Company Address"

    def test_link_voucher_success(self, api_client, application, active_voucher):
        """
        Verify that a voucher is correctly linked via Application PUT.
        """
        data = EmployerApplicationSerializer(application).data
        youth_app = active_voucher.youth_application

        new_voucher_data = {
            "summer_voucher_serial_number": str(
                active_voucher.summer_voucher_serial_number
            ),
            "employee_name": f"{youth_app.first_name} {youth_app.last_name}",
            "employee_phone_number": "0401234567",
            "employment_postcode": "00100",
        }

        if not data.get("summer_vouchers"):
            data["summer_vouchers"] = [new_voucher_data]
        else:
            data["summer_vouchers"][0].update(new_voucher_data)

        response = api_client.put(get_detail_url(application), data)
        assert response.status_code == status.HTTP_200_OK, response.data
        assert EmployerSummerVoucher.objects.filter(
            application=application, youth_summer_voucher=active_voucher
        ).exists()

    def test_link_voucher_failure_youth_application_not_accepted(
        self, api_client, application, youth_application
    ):
        """
        Verify that a voucher CANNOT be linked if the associated YouthApplication is NOT in ACCEPTED status.
        """
        youth_application.status = YouthApplicationStatus.SUBMITTED
        youth_application.save()

        # Ensure a voucher exists
        voucher, _ = YouthSummerVoucher.objects.get_or_create(
            youth_application=youth_application,
            defaults={
                "summer_voucher_serial_number": YouthSummerVoucher.get_next_serial_number()
            },
        )

        data = EmployerApplicationSerializer(application).data
        new_voucher_data = {
            "summer_voucher_serial_number": str(voucher.summer_voucher_serial_number),
            "employee_name": f"{youth_application.first_name} {youth_application.last_name}",
            "employee_phone_number": "0401234567",
            "employment_postcode": "00100",
        }

        if not data.get("summer_vouchers"):
            data["summer_vouchers"] = [new_voucher_data]
        else:
            data["summer_vouchers"][0].update(new_voucher_data)

        response = api_client.put(get_detail_url(application), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "not yet valid for attachment" in str(response.data).lower()

    def test_voucher_reuse_prevention(self, api_client, application, active_voucher):
        """
        Verify that a voucher cannot be used in two different applications.
        """
        # First linkage
        EmployerSummerVoucher.objects.create(
            application=application, youth_summer_voucher=active_voucher
        )

        # Attempt to link to a second application.
        # Ensure it belongs to the same company/user so it's visible in get_queryset.
        application2 = EmployerApplicationFactory(
            company=application.company, user=application.user
        )
        data = EmployerApplicationSerializer(application2).data
        youth_app = active_voucher.youth_application

        new_voucher_data = {
            "summer_voucher_serial_number": str(
                active_voucher.summer_voucher_serial_number
            ),
            "employee_name": f"{youth_app.first_name} {youth_app.last_name}",
            "employee_phone_number": "0401234567",
            "employment_postcode": "00100",
        }

        if not data.get("summer_vouchers"):
            data["summer_vouchers"] = [new_voucher_data]
        else:
            data["summer_vouchers"][0].update(new_voucher_data)

        response = api_client.put(get_detail_url(application2), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already been used" in str(response.data).lower()
