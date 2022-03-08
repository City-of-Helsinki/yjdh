import json
import operator
import uuid
from datetime import datetime, timedelta
from enum import auto, Enum
from functools import reduce
from typing import List, Optional
from urllib.parse import urlparse

import factory.random
import langdetect
import pytest
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.models import AnonymousUser
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from shared.audit_log.models import AuditLogEntry
from shared.common.tests.conftest import staff_client, superuser_client
from shared.common.tests.test_validators import get_invalid_postcode_values

from applications.api.v1.serializers import YouthApplicationSerializer
from applications.enums import (
    get_supported_languages,
    YouthApplicationRejectedReason,
    YouthApplicationStatus,
)
from applications.models import YouthApplication, YouthSummerVoucher
from common.permissions import HandlerPermission
from common.tests.conftest import (
    api_client,
    unauthenticated_api_client as unauth_api_client,
)
from common.tests.factories import (
    ActiveYouthApplicationFactory,
    InactiveYouthApplicationFactory,
    YouthApplicationFactory,
)
from common.urls import handler_403_url, handler_youth_application_processing_url


def reverse_youth_application_action(action, pk):
    return reverse(f"v1:youthapplication-{action}", kwargs={"pk": pk})


class RedirectTo(Enum):
    adfs_login = auto()
    handler_403 = auto()
    handler_process = auto()

    @staticmethod
    def get_redirect_url(redirect_to, youth_application_action, youth_application_pk):
        return {
            RedirectTo.adfs_login: get_django_adfs_login_url(
                redirect_url=reverse_youth_application_action(
                    youth_application_action, youth_application_pk
                )
            ),
            RedirectTo.handler_403: handler_403_url(),
            RedirectTo.handler_process: handler_youth_application_processing_url(
                youth_application_pk
            ),
        }[redirect_to]


def get_random_pk() -> uuid.UUID:
    return uuid.uuid4()


def get_required_fields() -> List[str]:
    """
    Required fields of a youth application.
    """
    return [
        "first_name",
        "last_name",
        "social_security_number",
        "school",
        "is_unlisted_school",
        "email",
        "phone_number",
        "postcode",
    ]


def get_optional_fields() -> List[str]:
    """
    Optional fields of a youth application.
    """
    return [
        "language",
    ]


def get_read_only_fields() -> List[str]:
    """
    Read-only fields of a youth application.
    """
    return [
        "id",
        "created_at",
        "modified_at",
        "receipt_confirmed_at",
        "encrypted_vtj_json",
        "status",
        "handler",
        "handled_at",
    ]


def get_handler_fields() -> List[str]:
    """
    Fields that should be viewable by a youth application's handler.
    """
    return get_required_fields() + get_optional_fields() + get_read_only_fields()


def test_youth_application_serializer_fields():
    """
    Test that YouthApplicationSerializer's fields are all handled and categorized
    into required/optional/read-only partitions. Also test that handler views' show all
    fields.

    If this test breaks then update the following:
     - get_required_fields()
     - get_optional_fields()
     - get_read_only_fields()
     - get_handler_fields()
     - YouthApplicationSerializer.Meta.read_only_fields
     - YouthApplicationSerializer.Meta.fields
    """
    assert len(set(get_required_fields())) == len(get_required_fields())
    assert len(set(get_optional_fields())) == len(get_optional_fields())
    assert len(set(get_read_only_fields())) == len(get_read_only_fields())
    assert len(set(get_handler_fields())) == len(get_handler_fields())
    assert len(set(YouthApplicationSerializer.Meta.read_only_fields)) == len(
        YouthApplicationSerializer.Meta.read_only_fields
    )
    assert len(set(YouthApplicationSerializer.Meta.fields)) == len(
        YouthApplicationSerializer.Meta.fields
    )
    assert set(get_required_fields()).isdisjoint(set(get_optional_fields()))
    assert set(get_required_fields()).isdisjoint(set(get_read_only_fields()))
    assert set(get_optional_fields()).isdisjoint(set(get_read_only_fields()))
    assert set(get_required_fields()).issubset(set(get_handler_fields()))
    assert set(get_optional_fields()).issubset(set(get_handler_fields()))
    assert set(get_read_only_fields()).issubset(set(get_handler_fields()))
    assert (
        get_required_fields() + get_optional_fields() + get_read_only_fields()
        == get_handler_fields()
    )
    assert set(YouthApplicationSerializer.Meta.read_only_fields) == set(
        get_read_only_fields()
    )
    assert set(YouthApplicationSerializer.Meta.fields) == set(get_handler_fields())


def get_list_url():
    return reverse("v1:youthapplication-list")


def get_activation_url(pk):
    return reverse_youth_application_action("activate", pk)


def get_detail_url(pk):
    return reverse_youth_application_action("detail", pk)


def get_processing_url(pk):
    return reverse_youth_application_action("process", pk)


def get_django_adfs_login_url(redirect_url):
    return "{login_url}?{redirect_field_name}={redirect_url}".format(
        login_url=reverse("django_auth_adfs:login"),
        redirect_field_name=REDIRECT_FIELD_NAME,
        redirect_url=redirect_url,
    )


def get_test_vtj_json() -> dict:
    return {"first_name": "Maija", "last_name": "Meikäläinen"}


def assert_email_subject_language(email_subject, expected_language):
    detected_language = langdetect.detect(email_subject)
    assert (
        detected_language == expected_language
    ), "Email subject '{}' used language {} instead of expected {}".format(
        email_subject, detected_language, expected_language
    )


def assert_email_body_language(email_body, expected_language):
    detected_language = langdetect.detect(email_body)
    assert (
        detected_language == expected_language
    ), "Email body '{}' used language {} instead of expected {}".format(
        email_body, detected_language, expected_language
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func",
    [
        (mock_flag, client_fixture_func)
        for mock_flag in [False, True]
        for client_fixture_func in [
            unauth_api_client,
            api_client,
            staff_client,
            superuser_client,
        ]
    ],
)
def test_youth_applications_list(request, settings, mock_flag, client_fixture_func):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    response = client_fixture.get(get_list_url())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["status"] == "FORBIDDEN"
    assert audit_event["operation"] == "READ"
    assert audit_event["target"]["id"] == ""
    assert audit_event["target"]["type"] == "YouthApplication"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag, client_fixture_func, http_method, expected_audit_log_operation",
    [
        (mock_flag, client_fixture_func, http_method, expected_audit_log_operation)
        for mock_flag in [False, True]
        for client_fixture_func in [
            unauth_api_client,
            api_client,
            staff_client,
            superuser_client,
        ]
        for http_method, expected_audit_log_operation in [
            ("put", "UPDATE"),
            ("patch", "UPDATE"),
            ("delete", "DELETE"),
        ]
    ],
)
def test_youth_applications_forbidden_modification_methods(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    http_method,
    expected_audit_log_operation,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    client_http_method_func = getattr(client_fixture, http_method)
    response = client_http_method_func(get_detail_url(pk=youth_application.pk))
    assert response.status_code == status.HTTP_403_FORBIDDEN
    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["status"] == "FORBIDDEN"
    assert audit_event["operation"] == expected_audit_log_operation
    assert audit_event["target"]["id"] == str(youth_application.pk)
    assert audit_event["target"]["type"] == "YouthApplication"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 302, RedirectTo.handler_process),
        (False, superuser_client, 302, RedirectTo.handler_process),
        # With mock flag
        (True, unauth_api_client, 302, RedirectTo.handler_process),
        (True, api_client, 302, RedirectTo.handler_process),
        (True, staff_client, 302, RedirectTo.handler_process),
        (True, superuser_client, 302, RedirectTo.handler_process),
    ],
)
def test_youth_applications_process_valid_pk(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    response = client_fixture.get(get_processing_url(pk=youth_application.pk))
    assert response.status_code == expected_status_code
    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "process", youth_application.pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 200, None),
        (False, superuser_client, 200, None),
        # With mock flag
        (True, unauth_api_client, 200, None),
        (True, api_client, 200, None),
        (True, staff_client, 200, None),
        (True, superuser_client, 200, None),
    ],
)
def test_youth_applications_detail_valid_pk(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    response = client_fixture.get(get_detail_url(pk=youth_application.pk))
    assert response.status_code == expected_status_code
    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "detail", youth_application.pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,action,method,client_fixture_func,expected_status_code,expected_redirect_to",
    reduce(
        operator.add,
        [
            [
                # Without mock flag
                (False, action, method, unauth_api_client, 302, RedirectTo.adfs_login),
                (False, action, method, api_client, 302, RedirectTo.handler_403),
                (False, action, method, staff_client, 404, None),
                (False, action, method, superuser_client, 404, None),
                # With mock flag
                (True, action, method, unauth_api_client, 404, None),
                (True, action, method, api_client, 404, None),
                (True, action, method, staff_client, 404, None),
                (True, action, method, superuser_client, 404, None),
            ]
            for action, method in [
                ("accept", "patch"),
                ("detail", "get"),
                ("process", "get"),
                ("reject", "patch"),
            ]
        ],
    ),
)
def test_youth_applications_adfs_login_enforced_action_unused_pk(
    request,
    settings,
    mock_flag,
    action,
    method,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    unused_pk = get_random_pk()
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    client_http_method_func = getattr(client_fixture, method)
    endpoint_url = reverse_youth_application_action(action, unused_pk)
    response = client_http_method_func(endpoint_url)
    assert response.status_code == expected_status_code
    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, action, unused_pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func",
    [
        (mock_flag, client_fixture_func)
        for mock_flag in [False, True]
        for client_fixture_func in [
            unauth_api_client,
            api_client,
            staff_client,
            superuser_client,
        ]
    ],
)
def test_youth_applications_activate_unused_pk(
    request,
    settings,
    mock_flag,
    client_fixture_func,
):
    unused_pk = get_random_pk()
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    endpoint_url = reverse_youth_application_action("activate", unused_pk)
    response = client_fixture.get(endpoint_url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize("field", get_handler_fields())
def test_youth_applications_detail_response_field(api_client, youth_application, field):
    response = api_client.get(get_detail_url(pk=youth_application.pk))
    assert field in response.data


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize(
    "input_encrypted_vtj_json,expected_output_encrypted_vtj_json",
    [
        (None, {}),
        ("", {}),
        (json.dumps(get_test_vtj_json()), get_test_vtj_json()),
    ],
)
def test_youth_applications_detail_encrypted_vtj_json(
    api_client,
    input_encrypted_vtj_json,
    expected_output_encrypted_vtj_json,
):
    app = YouthApplicationFactory.create(encrypted_vtj_json=input_encrypted_vtj_json)
    response = api_client.get(get_detail_url(pk=app.pk))
    output_encrypted_vtj_json = response.data["encrypted_vtj_json"]
    assert output_encrypted_vtj_json == expected_output_encrypted_vtj_json


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,disable_vtj,expected_status_code",
    [
        (
            language,
            disable_vtj,
            status.HTTP_302_FOUND if disable_vtj else status.HTTP_501_NOT_IMPLEMENTED,
        )
        for language in get_supported_languages()
        for disable_vtj in [False, True]
    ],
)
def test_youth_applications_activate_unexpired_inactive(
    api_client,
    make_youth_application_activation_link_unexpired,
    settings,
    language,
    disable_vtj,
    expected_status_code,
):
    settings.DISABLE_VTJ = disable_vtj
    inactive_youth_application = InactiveYouthApplicationFactory(language=language)
    assert not inactive_youth_application.has_youth_summer_voucher
    old_status = inactive_youth_application.status

    assert not inactive_youth_application.is_active
    assert not inactive_youth_application.has_activation_link_expired
    assert inactive_youth_application.language == language

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == expected_status_code
    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == inactive_youth_application.activated_page_url()

    inactive_youth_application.refresh_from_db()
    assert not inactive_youth_application.has_youth_summer_voucher

    if response.status_code == status.HTTP_501_NOT_IMPLEMENTED:
        assert not inactive_youth_application.is_active
        assert inactive_youth_application.status == old_status
    else:
        assert inactive_youth_application.is_active
        assert (
            inactive_youth_application.status
            == YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
        )
    assert inactive_youth_application.handler is None
    assert inactive_youth_application.handled_at is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,disable_vtj",
    [
        (language, disable_vtj)
        for language in get_supported_languages()
        for disable_vtj in [False, True]
    ],
)
def test_youth_applications_activate_unexpired_active(
    api_client,
    make_youth_application_activation_link_unexpired,
    settings,
    language,
    disable_vtj,
):
    settings.DISABLE_VTJ = disable_vtj
    active_youth_application = ActiveYouthApplicationFactory(language=language)
    assert not active_youth_application.has_youth_summer_voucher
    old_status = active_youth_application.status
    old_handler = active_youth_application.handler
    old_handled_at = active_youth_application.handled_at

    assert active_youth_application.is_active
    assert not active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == active_youth_application.already_activated_page_url()

    active_youth_application.refresh_from_db()
    assert not active_youth_application.has_youth_summer_voucher
    assert active_youth_application.is_active
    assert active_youth_application.status == old_status
    assert active_youth_application.handler == old_handler
    assert active_youth_application.handled_at == old_handled_at


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,disable_vtj",
    [
        (language, disable_vtj)
        for language in get_supported_languages()
        for disable_vtj in [False, True]
    ],
)
def test_youth_applications_activate_expired_inactive(
    api_client,
    make_youth_application_activation_link_expired,
    settings,
    language,
    disable_vtj,
):
    settings.DISABLE_VTJ = disable_vtj
    inactive_youth_application = InactiveYouthApplicationFactory(language=language)
    assert not inactive_youth_application.has_youth_summer_voucher
    old_status = inactive_youth_application.status

    assert not inactive_youth_application.is_active
    assert inactive_youth_application.has_activation_link_expired
    assert inactive_youth_application.language == language

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == inactive_youth_application.expired_page_url()

    inactive_youth_application.refresh_from_db()
    assert not inactive_youth_application.has_youth_summer_voucher
    assert not inactive_youth_application.is_active
    assert inactive_youth_application.status == old_status
    assert inactive_youth_application.handler is None
    assert inactive_youth_application.handled_at is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,disable_vtj",
    [
        (language, disable_vtj)
        for language in get_supported_languages()
        for disable_vtj in [False, True]
    ],
)
def test_youth_applications_activate_expired_active(
    api_client,
    make_youth_application_activation_link_expired,
    settings,
    language,
    disable_vtj,
):
    settings.DISABLE_VTJ = disable_vtj
    active_youth_application = ActiveYouthApplicationFactory(language=language)
    assert not active_youth_application.has_youth_summer_voucher
    old_status = active_youth_application.status
    old_handler = active_youth_application.handler
    old_handled_at = active_youth_application.handled_at

    assert active_youth_application.is_active
    assert active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == active_youth_application.already_activated_page_url()

    active_youth_application.refresh_from_db()
    assert not active_youth_application.has_youth_summer_voucher
    assert active_youth_application.is_active
    assert active_youth_application.status == old_status
    assert active_youth_application.handler == old_handler
    assert active_youth_application.handled_at == old_handled_at


@pytest.mark.django_db
@override_settings(DISABLE_VTJ=True)
def test_youth_applications_dual_activate_unexpired_inactive(
    api_client,
    make_youth_application_activation_link_unexpired,
):
    app_1 = InactiveYouthApplicationFactory()
    app_2 = InactiveYouthApplicationFactory(
        social_security_number=app_1.social_security_number
    )
    app_2_old_status = app_2.status

    # Make sure the source objects are set up correctly
    assert not app_1.has_youth_summer_voucher
    assert not app_1.is_active
    assert not app_1.has_activation_link_expired
    assert not app_2.has_youth_summer_voucher
    assert not app_2.is_active
    assert not app_2.has_activation_link_expired
    assert app_1.social_security_number == app_2.social_security_number
    assert app_1.email != app_2.email

    response_1 = api_client.get(get_activation_url(app_1.pk))
    response_2 = api_client.get(get_activation_url(app_2.pk))

    app_1.refresh_from_db()
    app_2.refresh_from_db()

    assert not app_1.has_youth_summer_voucher
    assert app_1.is_active
    assert app_1.status == YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
    assert response_1.status_code == status.HTTP_302_FOUND
    assert response_1.url == app_1.activated_page_url()

    assert not app_2.has_youth_summer_voucher
    assert not app_2.is_active
    assert app_2.status == app_2_old_status
    assert response_2.status_code == status.HTTP_302_FOUND
    assert response_2.url == app_2.already_activated_page_url()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        "010203-1230",
        "121212A899H",
        "111111-111C",
        "111111A111C",
        # Django Rest Framework's serializers.CharField trims leading and trailing
        # whitespace by default, so we allow them here.
        "     111111-111C",
        "111111-111C     ",
        "   111111-111C  ",
    ],
)
def test_youth_application_post_valid_social_security_number(api_client, test_value):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED
    assert "social_security_number" in response.data


@freeze_time()
@pytest.mark.django_db
@pytest.mark.parametrize("random_seed", list(range(20)))
@pytest.mark.parametrize(
    "allowed_fields",
    [
        get_required_fields(),
        get_required_fields() + get_optional_fields(),
        get_required_fields() + get_optional_fields() + get_read_only_fields(),
    ],
)
def test_youth_application_post_valid_random_data(
    api_client, random_seed, allowed_fields
):
    factory.random.reseed_random(random_seed)
    source_app = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(source_app).data
    data = {key: value for key, value in data.items() if key in allowed_fields}
    assert sorted(data.keys()) == sorted(allowed_fields)
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED

    # Check response content
    assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
    assert datetime.fromisoformat(response.data["created_at"]) == timezone.now()
    assert datetime.fromisoformat(response.data["modified_at"]) == timezone.now()
    for required_field in get_required_fields():
        assert (
            response.data[required_field] == data[required_field]
        ), f"{required_field} response data incorrect"
    for optional_field in get_optional_fields():
        assert response.data[optional_field] == data.get(
            optional_field, YouthApplication._meta.get_field(optional_field).default
        ), f"{optional_field} response data incorrect"
    # Mapping from read-only field name to its allowed values list
    read_only_field_allowed_values = {
        "receipt_confirmed_at": [None],
        "encrypted_vtj_json": [None, {}],
        "status": [YouthApplicationStatus.SUBMITTED.value],
        "handler": [None],
        "handled_at": [None],
    }
    manually_checked_fields = ["id", "created_at", "modified_at"]
    assert sorted(read_only_field_allowed_values.keys()) == sorted(
        set(get_read_only_fields()) - set(manually_checked_fields)
    ), "Please add fields {missing_fields} to read_only_field_allowed_values".format(
        missing_fields=sorted(
            set(get_read_only_fields())
            - set(manually_checked_fields)
            - set(read_only_field_allowed_values.keys())
        )
    )
    for read_only_field, allowed_values in read_only_field_allowed_values.items():
        assert (
            response.data[read_only_field] in allowed_values
        ), f"{read_only_field} response data incorrect"

    # Check created youth application
    created_app = YouthApplication.objects.get(pk=response.data["id"])
    assert source_app.pk != created_app.pk
    assert str(created_app.id) == response.data["id"]
    assert created_app.created_at == timezone.now()
    assert created_app.modified_at == timezone.now()
    for required_field in get_required_fields():
        assert (
            getattr(created_app, required_field) == data[required_field]
        ), f"{required_field} created youth application attribute incorrect"
    for optional_field in get_optional_fields():
        assert getattr(created_app, optional_field) == data.get(
            optional_field, YouthApplication._meta.get_field(optional_field).default
        ), f"{optional_field} created youth application attribute incorrect"
    for read_only_field, allowed_values in read_only_field_allowed_values.items():
        assert (
            getattr(created_app, read_only_field) in allowed_values
        ), f"{read_only_field} created youth application attribute incorrect"


@pytest.mark.django_db
def test_youth_application_post_valid_audit_log(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(get_list_url(), data)
    assert "id" in response.data
    assert response.data["id"]
    assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["status"] == "SUCCESS"
    assert audit_event["operation"] == "CREATE"
    assert audit_event["target"]["id"] == str(response.data["id"])
    assert audit_event["target"]["type"] == "YouthApplication"


@pytest.mark.django_db
@override_settings(
    EMAIL_USE_TLS=False,
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
)
@pytest.mark.parametrize(
    "email_backend_override",
    [
        None,  # No override
        "django.core.mail.backends.console.EmailBackend",
    ],
)
def test_youth_application_post_valid_data_with_email_backends(
    api_client,
    settings,
    email_backend_override,
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application = YouthApplicationFactory.build(email="test@example.com")
    if email_backend_override is not None:
        settings.EMAIL_BACKEND = email_backend_override
    data = YouthApplicationSerializer(youth_application).data
    start_app_count = YouthApplication.objects.count()
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    end_app_count = YouthApplication.objects.count()
    assert response.status_code == status.HTTP_201_CREATED
    assert end_app_count == start_app_count + 1


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_post_valid_data_with_invalid_smtp_server(
    api_client,
    settings,
    language,
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application = YouthApplicationFactory.build(
        email="test@example.com", language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    start_app_count = YouthApplication.objects.count()
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    end_app_count = YouthApplication.objects.count()
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert end_app_count == start_app_count


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_post_valid_language(
    api_client,
    language,
):
    youth_application = YouthApplicationFactory.build(language=language)
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_activation_email_language(api_client, language):
    youth_application = YouthApplicationFactory.build(language=language)
    data = YouthApplicationSerializer(youth_application).data
    api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert_email_subject_language(activation_email.subject, language)
    assert_email_body_language(activation_email.body, language)


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_youth_application_activation_email_link_path(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert "id" in response.data
    assert response.data["id"]
    assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
    # Check that the activation URL path
    # i.e. without the hostname and port is found in the email body
    activation_url = get_activation_url(pk=response.data["id"])
    activation_url_with_path_only = urlparse(activation_url).path
    assert activation_url_with_path_only in activation_email.body


@pytest.mark.django_db
@override_settings(
    DISABLE_VTJ=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_youth_application_processing_email_sending_without_vtj(
    api_client,
    inactive_youth_application,
    make_youth_application_activation_link_unexpired,
):
    start_mail_count = len(mail.outbox)
    api_client.get(get_activation_url(inactive_youth_application.pk))
    assert len(mail.outbox) == start_mail_count + 1


@pytest.mark.django_db
@override_settings(
    DISABLE_VTJ=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize(
    "youth_application_language,expected_email_language",
    [(language, "fi") for language in get_supported_languages()],
)
def test_youth_application_processing_email_language(
    api_client,
    make_youth_application_activation_link_unexpired,
    youth_application_language,
    expected_email_language,
):
    inactive_youth_application = InactiveYouthApplicationFactory(
        language=youth_application_language
    )
    api_client.get(get_activation_url(inactive_youth_application.pk))
    assert len(mail.outbox) > 0
    processing_email = mail.outbox[-1]
    assert_email_subject_language(processing_email.subject, expected_email_language)
    assert_email_body_language(processing_email.body, expected_email_language)


@pytest.mark.django_db
def test_youth_application_post_invalid_language(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["language"] = "asd"
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "language" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("postcode", get_invalid_postcode_values())
def test_youth_application_post_invalid_postcode(api_client, postcode):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["postcode"] = "postcode"
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "postcode" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("missing_field", get_required_fields())
def test_youth_application_post_missing_required_field(
    api_client,
    missing_field,
):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    del data[missing_field]
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert missing_field in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,value",
    [(field, value) for field in get_required_fields() for value in [None, "", " "]],
)
def test_youth_application_post_empty_required_field(
    api_client,
    field,
    value,
):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data[field] = value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert field in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        # A temporary social security number (900-999)
        "111111-900U",
        "111111-9991",
        # Inner whitespace
        "111111 -111C",
        "111111-111 C",
        " 111111 - 111C ",
        # Not uppercase
        "111111-111c",
        "111111a111C",
        # Invalid checksum
        "111111-111X",  # "111111-111C" would be valid
        "111111A111W",  # "111111A111C" would be valid
        "010203-123A",  # "010203-1230" would be valid
        "121212A899F",  # "121212A899H" would be valid
        # Combination
        "111111 -111x",  # Invalid checksum, inner whitespace, not uppercase
    ],
)
def test_youth_application_post_invalid_social_security_number(api_client, test_value):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "social_security_number" in response.data


def get_expected_reason(
    same_email,
    same_social_security_number,
    is_existing_active,
    is_existing_expired,
) -> Optional[YouthApplicationRejectedReason]:
    if (same_email or same_social_security_number) and is_existing_active:
        return YouthApplicationRejectedReason.ALREADY_ASSIGNED
    elif same_email and (is_existing_active or not is_existing_expired):
        return YouthApplicationRejectedReason.EMAIL_IN_USE
    else:
        return None


@freeze_time("2022-02-02")
@override_settings(NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS=60 * 60 * 12)  # 12h
@pytest.mark.django_db
@pytest.mark.parametrize(
    "same_email,"
    "same_social_security_number,"
    "is_existing_active,"
    "is_existing_expired,"
    "expected_reason",
    [
        (
            same_email,
            same_social_security_number,
            is_existing_active,
            is_existing_expired,
            get_expected_reason(
                same_email,
                same_social_security_number,
                is_existing_active,
                is_existing_expired,
            ),
        )
        for same_email in [False, True]
        for same_social_security_number in [False, True]
        for is_existing_active in [False, True]
        for is_existing_expired in [False, True]
    ],
)
def test_youth_application_post_error_codes(
    api_client,
    same_email,
    same_social_security_number,
    is_existing_active,
    is_existing_expired,
    expected_reason,
):
    now = timezone.now()

    # Create the existing youth application
    existing_app = YouthApplicationFactory.create()
    existing_app.receipt_confirmed_at = now if is_existing_active else None
    if is_existing_expired:
        # Make the saved youth application expired
        existing_app.created_at = (
            now - YouthApplication.expiration_duration() - timedelta(hours=1)
        )
    else:
        existing_app.created_at = now
    existing_app.save()
    existing_app.refresh_from_db()

    # Create the new unsaved youth application
    new_app = YouthApplicationFactory.build()
    if same_email:
        new_app.email = existing_app.email
    if same_social_security_number:
        new_app.social_security_number = existing_app.social_security_number

    # Check that the test objects are set up correctly
    assert is_existing_expired == existing_app.has_activation_link_expired
    assert is_existing_active == existing_app.is_active
    assert same_email == (new_app.email == existing_app.email)
    assert same_social_security_number == (
        new_app.social_security_number == existing_app.social_security_number
    )

    data = YouthApplicationSerializer(new_app).data
    response = api_client.post(get_list_url(), data)

    if expected_reason is None:
        assert response.status_code == status.HTTP_201_CREATED
    else:
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.headers.get("Content-Type") == "application/json"
        assert response.json() == expected_reason.json()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 200, None),
        (False, superuser_client, 200, None),
        # With mock flag
        (True, unauth_api_client, 200, None),
        (True, api_client, 200, None),
        (True, staff_client, 200, None),
        (True, superuser_client, 200, None),
    ],
)
def test_youth_applications_accept_acceptable(
    request,
    acceptable_youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    old_status = acceptable_youth_application.status
    old_modified_at = acceptable_youth_application.modified_at
    old_youth_summer_voucher_count = YouthSummerVoucher.objects.count()
    assert not acceptable_youth_application.has_youth_summer_voucher
    response = client_fixture.patch(
        reverse_youth_application_action("accept", acceptable_youth_application.pk)
    )
    assert response.status_code == expected_status_code

    acceptable_youth_application.refresh_from_db()

    if response.status_code == status.HTTP_200_OK:
        assert acceptable_youth_application.status == YouthApplicationStatus.ACCEPTED
        assert acceptable_youth_application.has_youth_summer_voucher
        assert YouthSummerVoucher.objects.count() == old_youth_summer_voucher_count + 1
        assert (
            acceptable_youth_application.youth_summer_voucher.summer_voucher_serial_number
            == YouthSummerVoucher.objects.count()
        )
        audit_event = AuditLogEntry.objects.first().message["audit_event"]
        assert audit_event["status"] == "SUCCESS"
        assert audit_event["operation"] == "UPDATE"
        assert audit_event["target"]["id"] == str(acceptable_youth_application.pk)
        assert audit_event["target"]["type"] == "YouthApplication"
        assert audit_event["additional_information"] == "accept"
        handler = response.wsgi_request.user
        assert handler is not None
        if handler == AnonymousUser():
            assert HandlerPermission.allow_empty_handler()
            assert handler.pk is None
            assert acceptable_youth_application.handler is None
            assert audit_event["actor"]["role"] == "ANONYMOUS"
            assert audit_event["actor"]["user_id"] == ""
        else:
            assert handler.pk is not None
            assert acceptable_youth_application.handler == handler
            assert audit_event["actor"]["role"] == "USER"
            assert audit_event["actor"]["user_id"] == str(handler.pk)
    else:
        assert acceptable_youth_application.status == old_status
        assert acceptable_youth_application.modified_at == old_modified_at
        assert not acceptable_youth_application.has_youth_summer_voucher
        assert YouthSummerVoucher.objects.count() == old_youth_summer_voucher_count
        assert not AuditLogEntry.objects.exists()

    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "accept", acceptable_youth_application.pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 400, None),
        (False, superuser_client, 400, None),
        # With mock flag
        (True, unauth_api_client, 400, None),
        (True, api_client, 400, None),
        (True, staff_client, 400, None),
        (True, superuser_client, 400, None),
    ],
)
def test_youth_applications_accept_accepted(
    request,
    accepted_youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    assert accepted_youth_application.status == YouthApplicationStatus.ACCEPTED
    assert not accepted_youth_application.has_youth_summer_voucher
    old_modified_at = accepted_youth_application.modified_at
    response = client_fixture.patch(
        reverse_youth_application_action("accept", accepted_youth_application.pk)
    )
    assert response.status_code == expected_status_code

    accepted_youth_application.refresh_from_db()
    assert accepted_youth_application.status == YouthApplicationStatus.ACCEPTED
    assert not accepted_youth_application.has_youth_summer_voucher
    assert accepted_youth_application.modified_at == old_modified_at
    assert not AuditLogEntry.objects.exists()

    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "accept", accepted_youth_application.pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 200, None),
        (False, superuser_client, 200, None),
        # With mock flag
        (True, unauth_api_client, 200, None),
        (True, api_client, 200, None),
        (True, staff_client, 200, None),
        (True, superuser_client, 200, None),
    ],
)
def test_youth_applications_reject_rejectable(
    request,
    rejectable_youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    old_status = rejectable_youth_application.status
    old_modified_at = rejectable_youth_application.modified_at
    assert not rejectable_youth_application.has_youth_summer_voucher
    response = client_fixture.patch(
        reverse_youth_application_action("reject", rejectable_youth_application.pk)
    )
    assert response.status_code == expected_status_code

    rejectable_youth_application.refresh_from_db()
    assert not rejectable_youth_application.has_youth_summer_voucher

    if response.status_code == status.HTTP_200_OK:
        assert rejectable_youth_application.status == YouthApplicationStatus.REJECTED
        audit_event = AuditLogEntry.objects.first().message["audit_event"]
        assert audit_event["status"] == "SUCCESS"
        assert audit_event["operation"] == "UPDATE"
        assert audit_event["target"]["id"] == str(rejectable_youth_application.pk)
        assert audit_event["target"]["type"] == "YouthApplication"
        assert audit_event["additional_information"] == "reject"
        handler = response.wsgi_request.user
        assert handler is not None
        if handler == AnonymousUser():
            assert HandlerPermission.allow_empty_handler()
            assert handler.pk is None
            assert rejectable_youth_application.handler is None
            assert audit_event["actor"]["role"] == "ANONYMOUS"
            assert audit_event["actor"]["user_id"] == ""
        else:
            assert handler.pk is not None
            assert rejectable_youth_application.handler == handler
            assert audit_event["actor"]["role"] == "USER"
            assert audit_event["actor"]["user_id"] == str(handler.pk)
    else:
        assert rejectable_youth_application.status == old_status
        assert rejectable_youth_application.modified_at == old_modified_at
        assert not AuditLogEntry.objects.exists()

    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "reject", rejectable_youth_application.pk
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_func,expected_status_code,expected_redirect_to",
    [
        # Without mock flag
        (False, unauth_api_client, 302, RedirectTo.adfs_login),
        (False, api_client, 302, RedirectTo.handler_403),
        (False, staff_client, 400, None),
        (False, superuser_client, 400, None),
        # With mock flag
        (True, unauth_api_client, 400, None),
        (True, api_client, 400, None),
        (True, staff_client, 400, None),
        (True, superuser_client, 400, None),
    ],
)
def test_youth_applications_reject_rejected(
    request,
    rejected_youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    expected_status_code,
    expected_redirect_to,
):
    assert (expected_status_code == status.HTTP_302_FOUND) == (
        expected_redirect_to is not None
    )
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    assert rejected_youth_application.status == YouthApplicationStatus.REJECTED
    assert not rejected_youth_application.has_youth_summer_voucher
    old_modified_at = rejected_youth_application.modified_at
    response = client_fixture.patch(
        reverse_youth_application_action("reject", rejected_youth_application.pk)
    )
    assert response.status_code == expected_status_code

    rejected_youth_application.refresh_from_db()
    assert rejected_youth_application.status == YouthApplicationStatus.REJECTED
    assert not rejected_youth_application.has_youth_summer_voucher
    assert rejected_youth_application.modified_at == old_modified_at
    assert not AuditLogEntry.objects.exists()

    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, "reject", rejected_youth_application.pk
        )
