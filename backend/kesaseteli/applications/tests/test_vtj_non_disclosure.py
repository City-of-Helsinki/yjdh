import json

import pytest
from django.conf import settings
from django.test import override_settings
from django.utils import timezone
from rest_framework import status

from applications.enums import VtjTestCase
from applications.models import SummerVoucherConfiguration, YouthApplication
from applications.services import VTJService
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_restricted_content,
)
from common.tests.factories import YouthApplicationFactory
from common.urls import get_list_url


@pytest.mark.django_db
class TestVTJNonDisclosure:
    def test_vtj_service_detection(self):
        # Restricted case
        restricted_json = json.loads(
            mock_vtj_person_id_query_restricted_content(
                first_name="Testi",
                last_name="Turvakielto",
                social_security_number="010101-0101",
            )
        )
        assert VTJService.is_response_restricted(restricted_json) is True

        # Normal case
        normal_json = json.loads(
            mock_vtj_person_id_query_found_content(
                first_name="Testi",
                last_name="Testaaja",
                social_security_number="010101-0101",
                is_alive=True,
                is_home_municipality_helsinki=True,
            )
        )
        assert VTJService.is_response_restricted(normal_json) is False

        # Failed search case
        failed_json = {"Paluukoodi": {"@koodi": "0001"}}
        assert VTJService.is_response_restricted(failed_json) is False

    def test_youth_application_need_additional_info_with_restriction(self):
        app = YouthApplicationFactory.build(is_vtj_data_restricted=True)
        assert app.need_additional_info is True

    def test_application_creation_with_restricted_test_case(self, api_client):
        # Ensure configuration exists for the current year
        SummerVoucherConfiguration.objects.get_or_create(
            year=timezone.now().year,
            defaults={
                "voucher_value": 350,
                "min_work_compensation": 500,
                "min_work_hours": 60,
                "target_group": settings.SUMMER_VOUCHER_DEFAULT_TARGET_GROUPS,
            },
        )

        with override_settings(
            NEXT_PUBLIC_MOCK_FLAG=True, NEXT_PUBLIC_DISABLE_VTJ=False
        ):
            social_security_number = "010101-0101"
            data = {
                "first_name": VtjTestCase.first_name(),
                "last_name": VtjTestCase.RESTRICTED.value,
                "social_security_number": social_security_number,
                "school": "Testikoulu",
                "is_unlisted_school": False,
                "email": "test@example.com",
                "phone_number": "0401234567",
                "postcode": "00100",
                "target_group": settings.SUMMER_VOUCHER_DEFAULT_TARGET_GROUPS[0],
                "language": "fi",
            }

            response = api_client.post(get_list_url(), data)
            assert response.status_code == status.HTTP_201_CREATED, response.content

            app = YouthApplication.objects.get(pk=response.data["id"])
            assert app.is_vtj_data_restricted is True
            assert app.need_additional_info is True

    def test_update_vtj_restriction_status_preserves_state_on_none(self):
        app = YouthApplicationFactory.build(is_vtj_data_restricted=True)
        app.update_vtj_restriction_status(None)
        assert app.is_vtj_data_restricted is True

        app.is_vtj_data_restricted = False
        app.update_vtj_restriction_status(None)
        assert app.is_vtj_data_restricted is False
