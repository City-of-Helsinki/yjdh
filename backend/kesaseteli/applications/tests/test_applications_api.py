from unittest import mock

import pytest
from django.test import override_settings
from rest_framework.reverse import reverse
from shared.oidc.tests.factories import EAuthorizationProfileFactory, OIDCProfileFactory

from applications.api.v1.serializers import (
    ApplicationSerializer,
    SummerVoucherSerializer,
)
from applications.enums import ApplicationStatus
from applications.models import Application
from applications.tests.factories import ApplicationFactory, SummerVoucherFactory


def get_detail_url(application):
    return reverse("v1:application-detail", kwargs={"pk": application.id})


@pytest.mark.django_db
def test_applications_list(api_client):
    response = api_client.get(reverse("v1:application-list"))

    assert response.status_code == 200


@pytest.mark.django_db
def test_application_single_read(api_client, application):
    response = api_client.get(get_detail_url(application))

    assert response.status_code == 200


@pytest.mark.django_db
def test_application_put(api_client, application):
    data = ApplicationSerializer(application).data
    data["invoicer_name"] = "test"
    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["invoicer_name"] == "test"


@pytest.mark.django_db
def test_application_patch(api_client):
    application = ApplicationFactory(status=ApplicationStatus.DRAFT)
    data = {"status": ApplicationStatus.REJECTED.value}
    response = api_client.patch(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["status"] == ApplicationStatus.REJECTED

    application.refresh_from_db()
    assert application.status == ApplicationStatus.REJECTED


@pytest.mark.django_db
def test_add_summer_voucher(api_client, application):
    summer_voucher = SummerVoucherFactory(application=application)
    original_summer_voucher_count = application.summer_vouchers.count()

    data = ApplicationSerializer(application).data

    summer_voucher_data = SummerVoucherSerializer(summer_voucher).data
    summer_voucher_data.pop("id")
    data["summer_vouchers"].append(summer_voucher_data)

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200

    application.refresh_from_db()
    summer_voucher_count_after_update = application.summer_vouchers.count()
    assert summer_voucher_count_after_update == original_summer_voucher_count + 1


@pytest.mark.django_db
def test_update_summer_voucher(api_client, application):
    data = ApplicationSerializer(application).data
    data["summer_vouchers"][0]["summer_voucher_id"] = "test"

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["summer_vouchers"][0]["summer_voucher_id"] == "test"


@pytest.mark.django_db
def test_remove_single_summer_voucher(api_client, application):
    SummerVoucherFactory(application=application)
    original_summer_voucher_count = application.summer_vouchers.count()

    data = ApplicationSerializer(application).data
    data["summer_vouchers"].pop()

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200

    application.refresh_from_db()
    summer_voucher_count_after_update = application.summer_vouchers.count()
    assert summer_voucher_count_after_update == original_summer_voucher_count - 1


@pytest.mark.django_db
def test_remove_all_summer_vouchers(api_client, application):
    data = ApplicationSerializer(application).data
    data.pop("summer_vouchers")
    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["summer_vouchers"] == []

    application.refresh_from_db()
    assert application.summer_vouchers.count() == 0


@pytest.mark.django_db
def test_application_create(api_client, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    organization_roles = {
        "name": "Activenakusteri Oy",
        "identifier": "7769480-5",
        "complete": True,
        "roles": ["NIMKO"],
    }

    with mock.patch(
        "companies.services.get_organization_roles", return_value=organization_roles
    ):
        response = api_client.post(
            reverse("v1:application-list"),
            {},
        )

    assert response.status_code == 201
    assert response.data["company"]["name"] == organization_roles["name"]
    assert response.data["company"]["business_id"] == organization_roles["identifier"]

    for field in Application._meta.fields:
        assert field.name in response.data


@pytest.mark.django_db
@override_settings(MOCK_FLAG=True)
def test_application_create_mock(api_client, user):
    oidc_profile = OIDCProfileFactory(user=user)
    EAuthorizationProfileFactory(oidc_profile=oidc_profile)

    response = api_client.post(
        reverse("v1:application-list"),
        {},
    )

    assert response.status_code == 201
    for field in Application._meta.fields:
        assert field.name in response.data


@pytest.mark.django_db
def test_application_delete_not_allowed(api_client, application):
    response = api_client.delete(get_detail_url(application))

    assert response.status_code == 405
