import pytest
from django.test import override_settings
from freezegun import freeze_time
from rest_framework.reverse import reverse

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
)
from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication
from common.tests.factories import (
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    YouthSummerVoucherFactory,
)
from shared.audit_log.models import AuditLogEntry


def get_list_url():
    return reverse("v1:employerapplication-list")


def get_detail_url(application: EmployerApplication):
    return reverse("v1:employerapplication-detail", kwargs={"pk": application.id})


@pytest.mark.django_db
def test_applications_list(api_client, company):
    response = api_client.get(get_list_url())

    assert response.status_code == 200


@pytest.mark.django_db
def test_application_single_read(api_client, application):
    response = api_client.get(get_detail_url(application))

    assert response.status_code == 200


@pytest.mark.django_db
def test_application_put(api_client, application):
    data = EmployerApplicationSerializer(application).data
    data["invoicer_name"] = "test"
    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["invoicer_name"] == "test"


@pytest.mark.django_db
def test_application_post_not_allowed(api_client, application):
    data = EmployerApplicationSerializer(application).data
    data["invoicer_name"] = "test"
    response = api_client.post(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 405


@pytest.mark.django_db
def test_application_put_invalid_data(api_client, application):
    data = EmployerApplicationSerializer(application).data
    data["language"] = "asd"
    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400
    assert "language" in response.data


@pytest.mark.django_db
def test_application_patch(api_client, application):
    data = {"status": EmployerApplicationStatus.SUBMITTED.value}
    response = api_client.patch(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["status"] == EmployerApplicationStatus.SUBMITTED

    application.refresh_from_db()
    assert application.status == EmployerApplicationStatus.SUBMITTED


@pytest.mark.django_db
def test_add_summer_voucher(api_client, application, summer_voucher):
    original_summer_voucher_count = application.summer_vouchers.count()

    data = EmployerApplicationSerializer(application).data

    summer_voucher_data = EmployerSummerVoucherSerializer(summer_voucher).data
    summer_voucher_data.pop("id")
    data["summer_vouchers"].append(summer_voucher_data)

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert (
        response.data["summer_vouchers"][-1]["ordering"]
        == original_summer_voucher_count
    )  # Index starts from 0

    application.refresh_from_db()
    summer_voucher_count_after_update = application.summer_vouchers.count()
    assert summer_voucher_count_after_update == original_summer_voucher_count + 1


@pytest.mark.django_db
def test_add_empty_summer_voucher(api_client, application):
    original_summer_voucher_count = application.summer_vouchers.count()

    data = EmployerApplicationSerializer(application).data

    data["summer_vouchers"].append({})

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200

    application.refresh_from_db()
    summer_voucher_count_after_update = application.summer_vouchers.count()
    assert summer_voucher_count_after_update == original_summer_voucher_count + 1


@pytest.mark.django_db
def test_update_summer_voucher(api_client, application, summer_voucher):
    data = EmployerApplicationSerializer(application).data
    summer_voucher_id = summer_voucher.id
    new_youth_summer_voucher = YouthSummerVoucherFactory()
    assert (
        summer_voucher.youth_summer_voucher_id
        != new_youth_summer_voucher.summer_voucher_serial_number
    )
    data["summer_vouchers"][0]["summer_voucher_serial_number"] = str(
        new_youth_summer_voucher.summer_voucher_serial_number
    )

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["summer_vouchers"][0]["summer_voucher_serial_number"] == str(
        new_youth_summer_voucher.summer_voucher_serial_number
    )
    # Make sure that the summer voucher ID stays the same
    assert response.data["summer_vouchers"][0]["id"] == str(summer_voucher_id)
    # Make sure the EmployerSummerVoucher is linked to the new YouthSummerVoucher
    summer_voucher.refresh_from_db()
    assert summer_voucher.youth_summer_voucher == new_youth_summer_voucher


@pytest.mark.django_db
def test_update_summer_voucher_with_invalid_data(
    api_client, application, summer_voucher
):
    data = EmployerApplicationSerializer(application).data
    data["summer_vouchers"][0]["target_group"] = "test"

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400
    assert "target_group" in str(response.data)


@pytest.mark.django_db
def test_remove_single_summer_voucher(api_client, application, summer_voucher):
    EmployerSummerVoucherFactory(application=application)  # Add a second voucher
    application.refresh_from_db()
    original_summer_voucher_count = application.summer_vouchers.count()

    data = EmployerApplicationSerializer(application).data
    data["summer_vouchers"].pop()
    existing_summer_voucher = data["summer_vouchers"][0]

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200

    application.refresh_from_db()
    summer_voucher_count_after_update = application.summer_vouchers.count()
    assert summer_voucher_count_after_update == original_summer_voucher_count - 1
    assert response.data["summer_vouchers"][0]["id"] == existing_summer_voucher["id"]


@pytest.mark.django_db
def test_remove_all_summer_vouchers(api_client, application):
    EmployerSummerVoucherFactory.create_batch(size=3, application=application)
    data = EmployerApplicationSerializer(application).data
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
def test_application_create(api_client, company):
    response = api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 201
    assert EmployerApplication.objects.count() == 1
    assert response.data["company"]["name"] == company.name
    assert response.data["company"]["business_id"] == company.business_id

    for field in [
        field
        for field in EmployerApplication._meta.fields
        if field.name not in ["created_at", "modified_at"]
    ]:
        assert field.name in response.data


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_application_create_mock(api_client, company):
    response = api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 201
    for field in [
        field
        for field in EmployerApplication._meta.fields
        if field.name not in ["created_at", "modified_at"]
    ]:
        assert field.name in response.data


@pytest.mark.django_db
def test_application_delete_not_allowed(api_client, application):
    response = api_client.delete(get_detail_url(application))

    assert response.status_code == 405


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_application_create_writes_audit_log(api_client, user, company):
    response = api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 201

    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["actor"] == {
        "ip_address": "127.0.0.1",
        "role": "USER",
        "user_id": str(user.pk),
        "provider": "",
    }
    assert audit_event["operation"] == "CREATE"
    assert audit_event["target"] == {
        "id": response.data["id"],
        "type": "EmployerApplication",
    }
    assert audit_event["status"] == "SUCCESS"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_application_update_writes_audit_log(api_client, user, application):
    application.invoicer_name = "test1"
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["invoicer_name"] = "test2"
    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["invoicer_name"] == "test2"

    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["actor"] == {
        "ip_address": "127.0.0.1",
        "role": "USER",
        "user_id": str(user.pk),
        "provider": "",
    }
    assert audit_event["operation"] == "UPDATE"
    assert audit_event["target"] == {
        "id": response.data["id"],
        "type": "EmployerApplication",
        "changes": ["invoicer_name changed from test1 to test2"],
    }
    assert audit_event["status"] == "SUCCESS"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_application_create_writes_audit_log_if_not_authenticated(
    unauthenticated_api_client,
):
    response = unauthenticated_api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 403

    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["actor"] == {
        "ip_address": "127.0.0.1",
        "role": "ANONYMOUS",
        "user_id": "",
        "provider": "",
    }
    assert audit_event["operation"] == "CREATE"
    assert audit_event["target"]["type"] == "EmployerApplication"
    assert audit_event["status"] == "FORBIDDEN"


@pytest.mark.django_db
def test_application_create_double(api_client, company):
    response = api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 201

    response = api_client.post(
        get_list_url(),
        {},
    )

    assert response.status_code == 400
    assert str(response.data[0]) == "Company & user can have only one draft application"


@pytest.mark.django_db
def test_applications_list_only_finds_own_application(
    api_client, application, company, user
):
    EmployerApplicationFactory()
    EmployerApplicationFactory(company=company)
    EmployerApplicationFactory(user=user)

    assert EmployerApplication.objects.count() == 4

    response = api_client.get(get_list_url())

    assert response.status_code == 200
    assert len(response.data) == 1
    assert str(response.data[0]["id"]) == str(application.id)


@pytest.mark.django_db
def test_application_get_only_finds_own_application(
    api_client, application, company, user
):
    app1 = EmployerApplicationFactory()
    app2 = EmployerApplicationFactory(company=company)
    app3 = EmployerApplicationFactory(user=user)

    assert EmployerApplication.objects.count() == 4

    applications_404 = [app1, app2, app3]
    for app in applications_404:
        response = api_client.get(get_detail_url(app))
        assert response.status_code == 404

    response = api_client.get(get_detail_url(application))
    assert response.status_code == 200
    assert str(response.data["id"]) == str(application.id)


@pytest.mark.django_db
def test_application_update_submitted_application(api_client, submitted_application):
    data = EmployerApplicationSerializer(submitted_application).data
    data["invoicer_name"] = "test"
    response = api_client.put(
        get_detail_url(submitted_application),
        data,
    )

    assert response.status_code == 400
    assert "Only DRAFT applications can be updated" in response.data


@pytest.mark.django_db
def test_applications_view_permissions(api_client, application, submitted_application):
    response = api_client.get(get_list_url())

    assert response.status_code == 200
    assert any(x["id"] == str(application.id) for x in response.data)
    assert any(x["id"] == str(submitted_application.id) for x in response.data)


@pytest.mark.django_db
def test_pagination_is_disabled_with_default_settings(
    api_client, company, user, settings
):
    """Test that pagination is disabled with the default settings."""
    assert settings.REST_FRAMEWORK.get("PAGE_SIZE") is None
    EmployerApplicationFactory.create_batch(
        company=company, user=user, status=EmployerApplicationStatus.DRAFT, size=10
    )

    response = api_client.get(get_list_url())

    assert response.status_code == 200
    assert len(response.data) == 10
    assert "count" not in response.data
    assert isinstance(response.data, list)


@pytest.mark.django_db
def test_pagination_with_small_limit(api_client, company, user):
    """Test pagination with small limit using LimitOffsetPagination."""
    EmployerApplicationFactory.create_batch(
        company=company, user=user, status=EmployerApplicationStatus.DRAFT, size=5
    )

    response = api_client.get(get_list_url(), {"limit": 2})

    assert response.status_code == 200
    assert response.data["count"] == 5
    assert len(response.data["results"]) == 2
    assert response.data["next"] is not None
    assert response.data["previous"] is None

    # Test offset parameter
    response = api_client.get(get_list_url(), {"limit": 2, "offset": 2})
    assert response.status_code == 200
    assert len(response.data["results"]) == 2
    assert response.data["next"] is not None
    assert response.data["previous"] is not None

    # Test last page
    response = api_client.get(get_list_url(), {"limit": 2, "offset": 4})
    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["next"] is None
    assert response.data["previous"] is not None


@pytest.mark.django_db
def test_pagination_with_large_limit(api_client, company, user):
    """Test pagination with large limit returns all results in single page."""
    EmployerApplicationFactory.create_batch(
        company=company, user=user, status=EmployerApplicationStatus.SUBMITTED, size=50
    )

    response = api_client.get(get_list_url(), {"limit": 100})

    assert response.status_code == 200
    assert response.data["count"] == 50
    assert len(response.data["results"]) == 50
    assert response.data["next"] is None
    assert response.data["previous"] is None


@pytest.mark.django_db
def test_applications_ordering_by_created_at(api_client, company, user):
    """Test that employer applications are ordered by -created_at (newest first)."""
    # Create applications in non-chronological order to verify ordering works
    with freeze_time("2024-01-01 11:00:00"):
        app_middle = EmployerApplicationFactory(
            company=company, user=user, status=EmployerApplicationStatus.SUBMITTED
        )

    with freeze_time("2024-01-01 12:00:00"):
        app_newest = EmployerApplicationFactory(
            company=company, user=user, status=EmployerApplicationStatus.DRAFT
        )

    with freeze_time("2024-01-01 10:00:00"):
        app_oldest = EmployerApplicationFactory(
            company=company, user=user, status=EmployerApplicationStatus.DRAFT
        )

    response = api_client.get(get_list_url(), {"limit": 10})

    assert response.status_code == 200
    assert response.data["count"] == 3
    results = response.data["results"]

    assert str(results[0]["id"]) == str(app_newest.id)
    assert str(results[1]["id"]) == str(app_middle.id)
    assert str(results[2]["id"]) == str(app_oldest.id)
