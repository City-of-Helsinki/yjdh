import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework import status

from applications.api.youth_application_views import YouthApplicationExportFilterSet
from applications.models import YouthApplication
from applications.target_groups import get_target_group_choices
from common.tests.factories import HandlerUserFactory, YouthApplicationFactory

pytestmark = pytest.mark.django_db

VALID_KEY = "test_key_with_at_least_32_characters_long_123"
VALID_ANONYMOUS_KEY = "anon_key_with_at_least_32_characters_long_123"


@override_settings(YOUTH_EXPORT_API_KEY="")
def test_export_missing_key_config_returns_forbidden(api_client):
    url = reverse("reporting-youth-applications")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(YOUTH_EXPORT_API_KEY="too_short")
def test_export_short_key_config_returns_forbidden(api_client):
    url = reverse("reporting-youth-applications")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(YOUTH_EXPORT_API_KEY=VALID_KEY)
def test_export_requires_api_key(api_client):
    url = reverse("reporting-youth-applications")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(YOUTH_EXPORT_API_KEY=VALID_KEY)
def test_export_wrong_api_key(api_client):
    url = reverse("reporting-youth-applications")
    response = api_client.get(
        url, HTTP_X_API_KEY="wrong_key_that_is_long_enough_123456789"
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(YOUTH_EXPORT_API_KEY=VALID_KEY)
def test_export_returns_records(api_client):
    # DRAFT status apps are not included in base_queryset, we need SUBMITTED
    app = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
    )
    url = reverse("reporting-youth-applications")
    response = api_client.get(f"{url}?limit=10", HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == str(app.id)


@pytest.mark.parametrize(
    "filter_name,filter_value,field_name,matching_value,non_matching_value",
    [
        ("postcode", "00100", "postcode", "00100", "00200"),
        ("language", "fi", "language", "fi", "sv"),
        ("is_vtj_data_restricted", True, "is_vtj_data_restricted", True, False),
        ("status", "accepted", "status", "accepted", "rejected"),
    ],
)
def test_youth_application_export_exact_filters(
    filter_name, filter_value, field_name, matching_value, non_matching_value
):
    app_matching = YouthApplicationFactory(
        status="submitted", receipt_confirmed_at="2026-08-20T10:00:00Z"
    )
    setattr(app_matching, field_name, matching_value)
    app_matching.save()

    app_non_matching = YouthApplicationFactory(
        status="submitted", receipt_confirmed_at="2026-08-20T10:00:00Z"
    )
    setattr(app_non_matching, field_name, non_matching_value)
    app_non_matching.save()

    qs = YouthApplication.objects.all()
    filterset = YouthApplicationExportFilterSet(
        data={filter_name: filter_value}, queryset=qs
    )

    assert filterset.is_valid(), filterset.errors
    filtered_qs = filterset.qs

    assert app_matching in filtered_qs
    assert app_non_matching not in filtered_qs


def test_youth_application_export_target_group_filter():
    valid_choices = [c[0] for c in get_target_group_choices()]
    tg1 = valid_choices[0]
    tg2 = valid_choices[1] if len(valid_choices) > 1 else valid_choices[0]

    app_matching = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
        target_group=tg1,
    )
    app_non_matching = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
        target_group=tg2,
    )

    qs = YouthApplication.objects.all()
    filterset = YouthApplicationExportFilterSet(data={"target_group": tg1}, queryset=qs)

    assert filterset.is_valid(), filterset.errors
    filtered_qs = filterset.qs

    assert app_matching in filtered_qs
    if tg1 != tg2:
        assert app_non_matching not in filtered_qs


def test_youth_application_export_handler_filter():
    handler1 = HandlerUserFactory()
    handler2 = HandlerUserFactory()

    app_matching = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
        handler=handler1,
    )
    app_non_matching = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
        handler=handler2,
    )

    qs = YouthApplication.objects.all()
    filterset = YouthApplicationExportFilterSet(
        data={"handler": handler1.pk}, queryset=qs
    )

    assert filterset.is_valid(), filterset.errors
    filtered_qs = filterset.qs

    assert app_matching in filtered_qs
    assert app_non_matching not in filtered_qs


@pytest.mark.parametrize(
    "date_field",
    [
        "created_at",
        "handled_at",
        "additional_info_provided_at",
        "receipt_confirmed_at",
    ],
)
def test_youth_application_export_date_filters(date_field):
    app_early = YouthApplicationFactory(
        status="submitted", receipt_confirmed_at="2026-08-20T10:00:00Z"
    )
    app_early.__dict__[date_field] = "2026-08-10T10:00:00Z"
    app_early.save()
    # for created_at, since it's auto_now_add, we need to update it with QuerySet.update() to avoid save() overwriting it
    if date_field == "created_at":
        YouthApplication.objects.filter(pk=app_early.pk).update(
            created_at="2026-08-10T10:00:00Z"
        )

    app_late = YouthApplicationFactory(
        status="submitted", receipt_confirmed_at="2026-08-20T10:00:00Z"
    )
    app_late.__dict__[date_field] = "2026-08-20T10:00:00Z"
    app_late.save()
    if date_field == "created_at":
        YouthApplication.objects.filter(pk=app_late.pk).update(
            created_at="2026-08-20T10:00:00Z"
        )

    qs = YouthApplication.objects.all()

    # Test GTE
    filterset_gte = YouthApplicationExportFilterSet(
        data={f"{date_field}_gte": "2026-08-15"}, queryset=qs
    )
    assert filterset_gte.is_valid(), filterset_gte.errors
    assert app_late in filterset_gte.qs
    assert app_early not in filterset_gte.qs

    # Test LTE
    filterset_lte = YouthApplicationExportFilterSet(
        data={f"{date_field}_lte": "2026-08-15"}, queryset=qs
    )
    assert filterset_lte.is_valid(), filterset_lte.errors
    assert app_early in filterset_lte.qs
    assert app_late not in filterset_lte.qs


# --- Anonymous Export Tests ---


@override_settings(ANONYMOUS_YOUTH_EXPORT_API_KEY="")
def test_anonymous_export_missing_key_config_returns_forbidden(api_client):
    url = reverse("anonymous-reporting-youth-applications")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(ANONYMOUS_YOUTH_EXPORT_API_KEY=VALID_KEY)
def test_anonymous_export_requires_api_key(api_client):
    url = reverse("anonymous-reporting-youth-applications")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(ANONYMOUS_YOUTH_EXPORT_API_KEY=VALID_KEY)
def test_anonymous_export_returns_records_without_pii(api_client):
    app = YouthApplicationFactory(
        status="submitted",
        receipt_confirmed_at="2026-08-20T10:00:00Z",
    )
    url = reverse("anonymous-reporting-youth-applications")
    response = api_client.get(f"{url}?limit=10", HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1

    record = response.data["results"][0]
    assert record["id"] == str(app.id)
    assert "school" in record
    assert "postcode" in record
    assert "birth_year" in record
    assert "language" in record

    # Assert sensitive PII fields are absent
    sensitive_fields = [
        "email",
        "phone_number",
        "most_official_first_name",
        "most_official_last_name",
        "vtj_last_name",
        "vtj_home_municipality",
        "birthdate",
        "summer_voucher_serial_number",
    ]
    assert all(field not in record for field in sensitive_fields)


@override_settings(
    YOUTH_EXPORT_API_KEY=VALID_KEY, ANONYMOUS_YOUTH_EXPORT_API_KEY=VALID_ANONYMOUS_KEY
)
def test_anonymous_key_rejected_on_full_export(api_client):
    url = reverse("reporting-youth-applications")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_ANONYMOUS_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@override_settings(
    YOUTH_EXPORT_API_KEY=VALID_KEY, ANONYMOUS_YOUTH_EXPORT_API_KEY=VALID_ANONYMOUS_KEY
)
def test_full_key_rejected_on_anonymous_export(api_client):
    url = reverse("anonymous-reporting-youth-applications")
    response = api_client.get(url, HTTP_X_API_KEY=VALID_KEY)
    assert response.status_code == status.HTTP_403_FORBIDDEN
