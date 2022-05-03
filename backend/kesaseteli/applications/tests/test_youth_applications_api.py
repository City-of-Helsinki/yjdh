import json
import operator
import re
import unicodedata
import uuid
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from enum import auto, Enum
from functools import reduce
from typing import List, Optional
from unittest import mock
from urllib.parse import urlparse

import factory.random
import pytest
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.models import AnonymousUser
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from django.utils.html import strip_tags
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from shared.audit_log.models import AuditLogEntry
from shared.common.lang_test_utils import (
    assert_email_body_language,
    assert_email_subject_language,
)
from shared.common.tests.conftest import (
    staff_client,
    staff_superuser_client,
    superuser_client,
)
from shared.common.tests.test_validators import get_invalid_postcode_values

from applications.api.v1.serializers import YouthApplicationSerializer
from applications.enums import (
    AdditionalInfoUserReason,
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
    AcceptableYouthApplicationFactory,
    AcceptedYouthApplicationFactory,
    AdditionalInfoRequestedYouthApplicationFactory,
    AwaitingManualProcessingYouthApplicationFactory,
    InactiveNeedAdditionalInfoYouthApplicationFactory,
    InactiveNoNeedAdditionalInfoYouthApplicationFactory,
    RejectedYouthApplicationFactory,
    UnhandledYouthApplicationFactory,
    YouthApplicationFactory,
)
from common.urls import handler_403_url, handler_youth_application_processing_url
from common.utils import normalize_whitespace


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


def test_additional_info() -> dict:
    return {
        "additional_info_user_reasons": [AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE],
        "additional_info_description": "Test text",
    }


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


def get_write_only_fields() -> List[str]:
    """
    Write-only fields of a youth application.

    NOTE: These fields are not readable.
    """
    return [
        "request_additional_information",
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
        "additional_info_user_reasons",
        "additional_info_description",
        "additional_info_provided_at",
    ]


def get_handler_fields() -> List[str]:
    """
    Fields that should be viewable by a youth application's handler.
    """
    return get_required_fields() + get_optional_fields() + get_read_only_fields()


def test_youth_application_encrypted_fields():
    """
    Test that YouthApplication's encrypted fields are categorized correctly.

    If this test breaks then check and update the following:
     - YouthApplication's fields
     - This test itself if YouthApplication's fields change
     - YouthApplicationSerializer.Meta.read_only_fields
     - YouthApplicationSerializer.Meta.vtj_data_fields
    """
    # Explicitly make sure "encrypted_vtj_json" is in vtj_data_fields
    assert "encrypted_vtj_json" in YouthApplicationSerializer.Meta.vtj_data_fields

    for field in YouthApplication._meta.get_fields():
        field_type = field.get_internal_type()
        # Check all encrypted fields of YouthApplication
        if (
            "encrypted" in field_type.lower()  # e.g. "EncryptedCharField"
            or "encrypted" in field.name.lower()  # e.g. "encrypted_vtj_json"
        ):
            # YouthApplication's encrypted read-only fields should be in vtj_data_fields
            if field.name in YouthApplicationSerializer.Meta.read_only_fields:
                assert field.name in YouthApplicationSerializer.Meta.vtj_data_fields
            else:
                # Because the applicant gives the social security number it can be
                # returned to them
                assert field.name in [
                    "encrypted_social_security_number",
                    "social_security_number",
                ]


def test_youth_application_serializer_fields():
    """
    Test that YouthApplicationSerializer's fields are all handled and categorized
    into required/optional/write-only/read-only partitions. Also test that handler
    views' show all fields except write-only fields.

    If this test breaks then update the following:
     - get_required_fields()
     - get_optional_fields()
     - get_write_only_fields()
     - get_read_only_fields()
     - get_handler_fields()
     - YouthApplicationSerializer.Meta.read_only_fields
     - YouthApplicationSerializer.Meta.fields
    """
    assert len(set(get_required_fields())) == len(get_required_fields())
    assert len(set(get_optional_fields())) == len(get_optional_fields())
    assert len(set(get_write_only_fields())) == len(get_write_only_fields())
    assert len(set(get_read_only_fields())) == len(get_read_only_fields())
    assert len(set(get_handler_fields())) == len(get_handler_fields())
    assert len(set(YouthApplicationSerializer.Meta.read_only_fields)) == len(
        YouthApplicationSerializer.Meta.read_only_fields
    )
    assert len(set(YouthApplicationSerializer.Meta.fields)) == len(
        YouthApplicationSerializer.Meta.fields
    )
    assert set(get_required_fields()).isdisjoint(set(get_optional_fields()))
    assert set(get_required_fields()).isdisjoint(set(get_write_only_fields()))
    assert set(get_required_fields()).isdisjoint(set(get_read_only_fields()))
    assert set(get_optional_fields()).isdisjoint(set(get_write_only_fields()))
    assert set(get_optional_fields()).isdisjoint(set(get_read_only_fields()))
    assert set(get_write_only_fields()).isdisjoint(set(get_read_only_fields()))
    assert set(get_required_fields()).issubset(set(get_handler_fields()))
    assert set(get_optional_fields()).issubset(set(get_handler_fields()))
    assert set(get_read_only_fields()).issubset(set(get_handler_fields()))
    assert set(get_write_only_fields()).isdisjoint(set(get_handler_fields()))
    assert (
        get_required_fields() + get_optional_fields() + get_read_only_fields()
        == get_handler_fields()
    )
    assert set(YouthApplicationSerializer.Meta.read_only_fields) == set(
        get_read_only_fields()
    )
    assert set(YouthApplicationSerializer.Meta.fields) == (
        set(get_handler_fields()) | set(get_write_only_fields())
    )


def get_list_url():
    return reverse("v1:youthapplication-list")


def get_activation_url(pk):
    return reverse_youth_application_action("activate", pk)


def get_detail_url(pk):
    return reverse_youth_application_action("detail", pk)


def get_processing_url(pk):
    return reverse_youth_application_action("process", pk)


def get_accept_url(pk):
    return reverse_youth_application_action("accept", pk)


def get_additional_info_url(pk):
    return reverse_youth_application_action("additional-info", pk)


def get_reject_url(pk):
    return reverse_youth_application_action("reject", pk)


def get_django_adfs_login_url(redirect_url):
    return "{login_url}?{redirect_field_name}={redirect_url}".format(
        login_url=reverse("django_auth_adfs:login"),
        redirect_field_name=REDIRECT_FIELD_NAME,
        redirect_url=redirect_url,
    )


def get_test_vtj_json() -> dict:
    return {"first_name": "Maija", "last_name": "Meikäläinen"}


@pytest.mark.django_db
@pytest.mark.parametrize(
    "http_method,action",
    [
        (http_method, action)
        for http_method in [
            "delete",
            "get",
            "patch",
            "post",
            "put",
        ]
        for action in [
            "accept",
            "activate",
            "additional-info",
            "detail",
            "list",
            "process",
            "reject",
        ]
        # Leave out the allowed combinations
        if (http_method, action)
        not in [
            ("get", "activate"),
            ("get", "detail"),
            ("get", "process"),
            ("patch", "accept"),
            ("patch", "reject"),
            ("post", "additional-info"),
            ("post", "list"),
        ]
    ],
)
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize(
    "client_fixture_func",
    [
        unauth_api_client,
        api_client,
        staff_superuser_client,
    ],
)
def test_youth_applications_not_allowed_methods(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_func,
    http_method,
    action,
):
    old_audit_log_entry_count = AuditLogEntry.objects.count()
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    client_http_method_func = getattr(client_fixture, http_method)

    if action == "list":
        endpoint_url = get_list_url()
    else:
        endpoint_url = reverse_youth_application_action(action, pk=youth_application.pk)

    response = client_http_method_func(endpoint_url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert AuditLogEntry.objects.count() == old_audit_log_entry_count


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
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize("action", ["activate", "status"])
@pytest.mark.parametrize(
    "client_fixture_func",
    [unauth_api_client, api_client, staff_client, superuser_client],
)
def test_youth_applications_public_action_unused_pk(
    request,
    settings,
    mock_flag,
    action,
    client_fixture_func,
):
    unused_pk = get_random_pk()
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    endpoint_url = reverse_youth_application_action(action, unused_pk)
    response = client_fixture.get(endpoint_url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
@pytest.mark.parametrize(
    "youth_application_status",
    [
        YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value,
        YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
    ],
)
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize(
    "client_fixture_func",
    [unauth_api_client, api_client, staff_client, superuser_client],
)
def test_youth_applications_status_valid_pk(
    request,
    settings,
    youth_application_status,
    mock_flag,
    client_fixture_func,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)
    youth_application = YouthApplicationFactory.create(status=youth_application_status)
    endpoint_url = reverse_youth_application_action("status", youth_application.pk)
    response = client_fixture.get(endpoint_url)
    assert response.status_code == status.HTTP_200_OK
    assert response["Content-Type"] == "application/json"
    assert response.json() == {"status": youth_application_status}


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
        for disable_vtj in [True]
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
    inactive_youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory(
        language=language
    )
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
    "language,disable_vtj,youth_application_factory",
    [
        (
            language,
            disable_vtj,
            youth_application_factory,
        )
        for language in get_supported_languages()
        for disable_vtj in [True]
        for youth_application_factory in [
            AwaitingManualProcessingYouthApplicationFactory,
            AdditionalInfoRequestedYouthApplicationFactory,
        ]
    ],
)
def test_youth_applications_activate_unexpired_active(
    api_client,
    make_youth_application_activation_link_unexpired,
    settings,
    language,
    disable_vtj,
    youth_application_factory,
):
    settings.DISABLE_VTJ = disable_vtj
    active_youth_application = youth_application_factory(language=language)
    old_status = active_youth_application.status
    old_handler = active_youth_application.handler
    old_handled_at = active_youth_application.handled_at

    # Make sure the source object is set up correctly
    assert active_youth_application.is_active
    assert not active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language
    assert not active_youth_application.has_additional_info
    assert not active_youth_application.has_youth_summer_voucher

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND

    if active_youth_application.need_additional_info:
        assert response.url == active_youth_application.additional_info_page_url(
            pk=active_youth_application.pk
        )
    else:
        assert response.url == active_youth_application.already_activated_page_url()

    active_youth_application.refresh_from_db()
    assert not active_youth_application.has_youth_summer_voucher
    assert active_youth_application.is_active
    assert active_youth_application.status == old_status
    assert active_youth_application.handler == old_handler
    assert active_youth_application.handled_at == old_handled_at


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,disable_vtj,youth_application_factory,need_additional_info",
    [
        (
            language,
            disable_vtj,
            youth_application_factory,
            need_additional_info,
        )
        for language in get_supported_languages()
        for disable_vtj in [True]
        for youth_application_factory, need_additional_info in [
            (InactiveNoNeedAdditionalInfoYouthApplicationFactory, False),
            (InactiveNeedAdditionalInfoYouthApplicationFactory, True),
        ]
    ],
)
def test_youth_applications_activate_expired_inactive(
    api_client,
    make_youth_application_activation_link_expired,
    settings,
    language,
    disable_vtj,
    youth_application_factory,
    need_additional_info,
):
    settings.DISABLE_VTJ = disable_vtj
    inactive_youth_application = youth_application_factory(language=language)

    old_status = inactive_youth_application.status

    # Make sure the source object is set up correctly
    assert not inactive_youth_application.is_active
    assert inactive_youth_application.has_activation_link_expired
    assert inactive_youth_application.language == language
    assert inactive_youth_application.need_additional_info == need_additional_info
    assert not inactive_youth_application.has_additional_info
    assert not inactive_youth_application.has_youth_summer_voucher

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
    "language,disable_vtj,youth_application_factory",
    [
        (
            language,
            disable_vtj,
            youth_application_factory,
        )
        for language in get_supported_languages()
        for disable_vtj in [True]
        for youth_application_factory in [
            AwaitingManualProcessingYouthApplicationFactory,
            AdditionalInfoRequestedYouthApplicationFactory,
        ]
    ],
)
def test_youth_applications_activate_expired_active(
    api_client,
    make_youth_application_activation_link_expired,
    settings,
    language,
    disable_vtj,
    youth_application_factory,
):
    settings.DISABLE_VTJ = disable_vtj
    active_youth_application = youth_application_factory(language=language)
    old_status = active_youth_application.status
    old_handler = active_youth_application.handler
    old_handled_at = active_youth_application.handled_at

    # Make sure the source object is set up correctly
    assert active_youth_application.is_active
    assert active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language
    assert not active_youth_application.has_additional_info
    assert not active_youth_application.has_youth_summer_voucher

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND

    if active_youth_application.need_additional_info:
        assert response.url == active_youth_application.additional_info_page_url(
            pk=active_youth_application.pk
        )
    else:
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
    app_1 = InactiveNoNeedAdditionalInfoYouthApplicationFactory()
    app_2 = InactiveNoNeedAdditionalInfoYouthApplicationFactory(
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


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=True,
)
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


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=True,
)
@pytest.mark.django_db
def test_youth_application_post_response_excludes_vtj_data_fields(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED

    for vtj_data_field in YouthApplicationSerializer.Meta.vtj_data_fields:
        assert vtj_data_field not in response.data


@freeze_time()
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=True,
)
@pytest.mark.django_db
@pytest.mark.parametrize("random_seed", list(range(20)))
@pytest.mark.parametrize(
    "extra_data_kwargs",
    [
        {"request_additional_information": True},
        {"request_additional_information": False},
        {},
    ],
)
@pytest.mark.parametrize(
    "allowed_fields",
    [
        get_required_fields(),
        get_required_fields() + get_optional_fields(),
        get_required_fields() + get_optional_fields() + get_read_only_fields(),
    ],
)
def test_youth_application_post_valid_random_data(  # noqa: C901
    api_client, random_seed, allowed_fields, extra_data_kwargs
):
    factory.random.reseed_random(random_seed)
    source_app = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(source_app).data
    data = {key: value for key, value in data.items() if key in allowed_fields}
    assert sorted(data.keys()) == sorted(allowed_fields)
    data.update(extra_data_kwargs)
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED

    # Partition the checkable fields
    manually_checked_fields = ["id", "created_at", "modified_at", "encrypted_vtj_json"]
    required_fields = sorted(set(get_required_fields()) - set(manually_checked_fields))
    optional_fields = sorted(set(get_optional_fields()) - set(manually_checked_fields))
    read_only_fields = sorted(
        set(get_read_only_fields()) - set(manually_checked_fields)
    )

    # Check that all required, optional and read-only fields are handled
    assert (
        set(manually_checked_fields)
        | set(required_fields)
        | set(optional_fields)
        | set(read_only_fields)
    ) == (
        set(get_required_fields())
        | set(get_optional_fields())
        | set(get_read_only_fields())
    )

    # Check response content
    for manually_checked_field in manually_checked_fields:
        if manually_checked_field == "id":
            assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
        elif manually_checked_field == "created_at":
            assert datetime.fromisoformat(response.data["created_at"]) == timezone.now()
        elif manually_checked_field == "modified_at":
            assert (
                datetime.fromisoformat(response.data["modified_at"]) == timezone.now()
            )
        elif manually_checked_field == "encrypted_vtj_json":
            # VTJ data should not be shown to the applicant
            assert "encrypted_vtj_json" not in response.data
        else:
            assert False, f"Please add manual check for field {manually_checked_field}"

    for required_field in required_fields:
        assert (
            response.data[required_field] == data[required_field]
        ), f"{required_field} response data incorrect"

    for optional_field in optional_fields:
        assert response.data[optional_field] == data.get(
            optional_field,
            YouthApplication._meta.get_field(optional_field).get_default(),
        ), f"{optional_field} response data incorrect"

    for read_only_field in read_only_fields:
        assert (
            response.data[read_only_field]
            == YouthApplication._meta.get_field(read_only_field).get_default()
        ), f"{read_only_field} response data incorrect"

    # Check created youth application
    created_app = YouthApplication.objects.get(pk=response.data["id"])

    for manually_checked_field in manually_checked_fields:
        if manually_checked_field == "id":
            assert source_app.pk != created_app.pk
            assert str(created_app.id) == response.data["id"]
        elif manually_checked_field == "created_at":
            assert created_app.created_at == timezone.now()
        elif manually_checked_field == "modified_at":
            assert created_app.modified_at == timezone.now()
        elif manually_checked_field == "encrypted_vtj_json":
            assert created_app.encrypted_vtj_json is None or isinstance(
                json.loads(created_app.encrypted_vtj_json), dict
            )
        else:
            assert False, f"Please add manual check for field {manually_checked_field}"

    for required_field in required_fields:
        assert (
            getattr(created_app, required_field) == data[required_field]
        ), f"{required_field} created youth application attribute incorrect"

    for optional_field in optional_fields:
        assert getattr(created_app, optional_field) == data.get(
            optional_field,
            YouthApplication._meta.get_field(optional_field).get_default(),
        ), f"{optional_field} created youth application attribute incorrect"

    for read_only_field in read_only_fields:
        assert (
            getattr(created_app, read_only_field)
            == YouthApplication._meta.get_field(read_only_field).get_default()
        ), f"{read_only_field} created youth application attribute incorrect"


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=True,
)
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
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=True,
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
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory.build(
        language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert_email_subject_language(activation_email.subject, language)
    assert_email_body_language(activation_email.body, language)


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_additional_info_request_email_language(api_client, language):
    youth_application = InactiveNeedAdditionalInfoYouthApplicationFactory.build(
        language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    additional_info_request_email = mail.outbox[-1]
    assert_email_subject_language(additional_info_request_email.subject, language)
    assert_email_body_language(additional_info_request_email.body, language)


@freeze_time()
@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=False,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_activation_email_sending(
    api_client, language, make_youth_application_activation_link_unexpired
):
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory.build(
        language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    start_mail_count = len(mail.outbox)
    with mock.patch(
        "applications.models.YouthApplication.fetch_vtj_json",
        return_value=youth_application.encrypted_vtj_json,
    ) as mock_fetch_vtj_json:
        api_client.post(reverse("v1:youthapplication-list"), data)
        mock_fetch_vtj_json.assert_called_once()
    assert len(mail.outbox) == start_mail_count + 1
    activation_email = mail.outbox[-1]
    assert activation_email.subject == YouthApplication.activation_email_subject(
        language=language
    )
    assert activation_email.from_email == "Test sender <testsender@hel.fi>"
    assert activation_email.to == [youth_application.email]


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    DISABLE_VTJ=False,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_additional_info_request_email_sending(api_client, language):
    youth_application = InactiveNeedAdditionalInfoYouthApplicationFactory.build(
        language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    start_mail_count = len(mail.outbox)
    with mock.patch(
        "applications.models.YouthApplication.fetch_vtj_json",
        return_value=youth_application.encrypted_vtj_json,
    ) as mock_fetch_vtj_json:
        api_client.post(reverse("v1:youthapplication-list"), data)
        mock_fetch_vtj_json.assert_called_once()
    assert len(mail.outbox) == start_mail_count + 1
    additional_info_request_email = mail.outbox[-1]
    assert (
        additional_info_request_email.subject
        == YouthApplication.additional_info_request_email_subject(language=language)
    )
    assert additional_info_request_email.from_email == "Test sender <testsender@hel.fi>"
    assert additional_info_request_email.to == [youth_application.email]


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_youth_application_activation_email_link_path(api_client):
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory.build()
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
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_youth_application_additional_info_request_email_link_path(api_client):
    youth_application = InactiveNeedAdditionalInfoYouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    additional_info_request_email = mail.outbox[-1]
    assert "id" in response.data
    assert response.data["id"]
    assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
    # Check that the activation URL path
    # i.e. without the hostname and port is found in the email body
    activation_url = get_activation_url(pk=response.data["id"])
    activation_url_with_path_only = urlparse(activation_url).path
    assert activation_url_with_path_only in additional_info_request_email.body


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
@pytest.mark.parametrize(
    "disable_vtj,expect_success",
    [(disable_vtj, disable_vtj is True) for disable_vtj in [True]],
)
def test_youth_application_processing_email_sending_on_activate(
    settings,
    api_client,
    make_youth_application_activation_link_unexpired,
    disable_vtj,
    expect_success,
):
    settings.DISABLE_VTJ = disable_vtj
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory()
    assert not youth_application.is_active
    assert not youth_application.has_activation_link_expired
    assert not youth_application.need_additional_info
    start_mail_count = len(mail.outbox)
    api_client.get(get_activation_url(youth_application.pk))

    if expect_success:
        assert len(mail.outbox) == start_mail_count + 1
        processing_email = mail.outbox[-1]
        assert processing_email.subject == youth_application.processing_email_subject()
        assert processing_email.from_email == "Test sender <testsender@hel.fi>"
        assert processing_email.to == ["Test handler <testhandler@hel.fi>"]
    else:
        assert len(mail.outbox) == start_mail_count


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
@pytest.mark.parametrize(
    "disable_vtj,expect_success",
    [(disable_vtj, disable_vtj is True) for disable_vtj in [True]],
)
def test_youth_application_processing_email_sending_after_additional_info(
    settings,
    api_client,
    disable_vtj,
    expect_success,
):
    settings.DISABLE_VTJ = disable_vtj
    youth_application = AdditionalInfoRequestedYouthApplicationFactory()
    assert youth_application.need_additional_info
    assert youth_application.can_set_additional_info
    start_mail_count = len(mail.outbox)
    api_client.post(
        get_additional_info_url(youth_application.pk),
        data=json.dumps(test_additional_info()),
        content_type="application/json",
    )
    if expect_success:
        assert len(mail.outbox) == start_mail_count + 1
        processing_email = mail.outbox[-1]
        assert processing_email.subject == youth_application.processing_email_subject()
        assert processing_email.from_email == "Test sender <testsender@hel.fi>"
        assert processing_email.to == ["Test handler <testhandler@hel.fi>"]
    else:
        assert len(mail.outbox) == start_mail_count


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
@pytest.mark.parametrize(
    "disable_vtj,youth_application_language,expected_email_language,expect_success",
    [
        (
            disable_vtj,
            language,
            "fi",
            disable_vtj is True,
        )
        for disable_vtj in [True]
        for language in get_supported_languages()
    ],
)
def test_youth_application_processing_email_language_on_activate(
    settings,
    api_client,
    make_youth_application_activation_link_unexpired,
    disable_vtj,
    youth_application_language,
    expected_email_language,
    expect_success,
):
    settings.DISABLE_VTJ = disable_vtj
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory(
        language=youth_application_language
    )
    assert not youth_application.is_active
    assert not youth_application.has_activation_link_expired
    assert not youth_application.need_additional_info
    start_mail_count = len(mail.outbox)
    api_client.get(get_activation_url(youth_application.pk))
    if expect_success:
        assert len(mail.outbox) == start_mail_count + 1
        processing_email = mail.outbox[-1]
        assert_email_subject_language(processing_email.subject, expected_email_language)
        assert_email_body_language(processing_email.body, expected_email_language)
    else:
        assert len(mail.outbox) == start_mail_count


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize(
    "disable_vtj,youth_application_language,expected_email_language,expect_success",
    [
        (
            disable_vtj,
            language,
            "fi",
            disable_vtj is True,
        )
        for disable_vtj in [True]
        for language in get_supported_languages()
    ],
)
def test_youth_application_processing_email_language_after_additional_info(
    settings,
    api_client,
    disable_vtj,
    youth_application_language,
    expected_email_language,
    expect_success,
):
    settings.DISABLE_VTJ = disable_vtj
    youth_application = AdditionalInfoRequestedYouthApplicationFactory(
        language=youth_application_language
    )
    assert youth_application.need_additional_info
    assert youth_application.can_set_additional_info
    start_mail_count = len(mail.outbox)
    api_client.post(
        get_additional_info_url(youth_application.pk),
        data=json.dumps(test_additional_info()),
        content_type="application/json",
    )
    if expect_success:
        assert len(mail.outbox) == start_mail_count + 1
        processing_email = mail.outbox[-1]
        assert_email_subject_language(processing_email.subject, expected_email_language)
        assert_email_body_language(processing_email.body, expected_email_language)
    else:
        assert len(mail.outbox) == start_mail_count


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_summer_voucher_email_language(api_client, language):
    acceptable_youth_application = AcceptableYouthApplicationFactory(language=language)
    api_client.patch(get_accept_url(acceptable_youth_application.pk))
    assert len(mail.outbox) > 0
    youth_summer_voucher_email = mail.outbox[-1]
    normalized_subject = normalize_whitespace(
        re.sub(r"\d+", "", youth_summer_voucher_email.subject)  # Remove numbers
    ).lower()
    try:
        assert_email_subject_language(normalized_subject, language)
    except AssertionError:
        # Try fallback detection for short subject lines
        # as their language may not always be detected correctly
        subject_fallbacks = {
            "din sommarsedel": "sv",
            "your summer job voucher": "en",
        }
        if not subject_fallbacks.get(normalized_subject) == language:
            raise
    assert_email_body_language(youth_summer_voucher_email.body, language)
    assert youth_summer_voucher_email.alternatives, "Must have HTML message"
    html_message_without_tags = strip_tags(
        youth_summer_voucher_email.alternatives[0][0]
    )
    assert_email_body_language(html_message_without_tags, language)


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_summer_voucher_email_sending(api_client, language):
    acceptable_youth_application = AcceptableYouthApplicationFactory(language=language)
    start_mail_count = len(mail.outbox)
    api_client.patch(get_accept_url(acceptable_youth_application.pk))
    assert len(mail.outbox) == start_mail_count + 1
    youth_summer_voucher_email = mail.outbox[-1]
    assert (
        youth_summer_voucher_email.subject
        == acceptable_youth_application.youth_summer_voucher.email_subject(
            language=language
        )
    )
    assert youth_summer_voucher_email.from_email == "Test sender <testsender@hel.fi>"
    assert youth_summer_voucher_email.to == [acceptable_youth_application.email]


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_summer_voucher_email_type(api_client, language):
    acceptable_youth_application = AcceptableYouthApplicationFactory(language=language)
    api_client.patch(get_accept_url(acceptable_youth_application.pk))
    assert len(mail.outbox) > 0
    youth_summer_voucher_email = mail.outbox[-1]
    assert youth_summer_voucher_email.content_subtype == "plain"
    assert youth_summer_voucher_email.mixed_subtype == "related"
    assert youth_summer_voucher_email.alternatives, "Must have HTML message"
    html_message, html_content_type = youth_summer_voucher_email.alternatives[0]
    assert html_content_type == "text/html"


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_summer_voucher_email_plaintext_html_similarity(api_client, language):
    acceptable_youth_application = AcceptableYouthApplicationFactory(language=language)
    api_client.patch(get_accept_url(acceptable_youth_application.pk))
    assert len(mail.outbox) > 0
    youth_summer_voucher_email = mail.outbox[-1]
    normalized_plaintext_message = normalize_whitespace(
        re.sub(r"-{70,}", "", youth_summer_voucher_email.body)  # Remove long dashes
    )
    normalized_html_message = normalize_whitespace(
        strip_tags(youth_summer_voucher_email.alternatives[0][0])
    )
    assert (
        SequenceMatcher(
            a=normalized_plaintext_message, b=normalized_html_message, autojunk=False
        ).ratio()
        >= 0.9
    ), "Email's plaintext and HTML content should be very similar"


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_accept_acceptable_with_invalid_smtp_server(
    api_client, language
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    acceptable_youth_application = AcceptableYouthApplicationFactory(
        email="test@example.com", language=language
    )
    assert not acceptable_youth_application.is_accepted
    assert acceptable_youth_application.can_accept_manually(handler=AnonymousUser())
    response = api_client.patch(get_accept_url(acceptable_youth_application.pk))
    acceptable_youth_application.refresh_from_db()
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert not acceptable_youth_application.is_accepted


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
    is_existing_rejected,
) -> Optional[YouthApplicationRejectedReason]:
    if is_existing_rejected:
        return None
    elif (same_email or same_social_security_number) and is_existing_active:
        return YouthApplicationRejectedReason.ALREADY_ASSIGNED
    elif same_email and (is_existing_active or not is_existing_expired):
        return YouthApplicationRejectedReason.EMAIL_IN_USE
    else:
        return None


@freeze_time("2022-02-02")
@override_settings(
    NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS=60 * 60 * 12,  # 12h
    DISABLE_VTJ=True,
    NEXT_PUBLIC_MOCK_FLAG=True,
)
@pytest.mark.django_db
@pytest.mark.parametrize(
    "same_email,"
    "same_social_security_number,"
    "is_existing_active,"
    "is_existing_expired,"
    "is_existing_rejected,"
    "expected_reason",
    [
        (
            same_email,
            same_social_security_number,
            is_existing_active,
            is_existing_expired,
            is_existing_rejected,
            get_expected_reason(
                same_email,
                same_social_security_number,
                is_existing_active,
                is_existing_expired,
                is_existing_rejected,
            ),
        )
        for same_email in [False, True]
        for same_social_security_number in [False, True]
        for is_existing_active in [False, True]
        for is_existing_expired in [False, True]
        for is_existing_rejected in [False, True]
    ],
)
def test_youth_application_post_error_codes(
    api_client,
    same_email,
    same_social_security_number,
    is_existing_active,
    is_existing_expired,
    is_existing_rejected,
    expected_reason,
):
    now = timezone.now()

    # Create the existing youth application
    existing_app = (
        RejectedYouthApplicationFactory.create()
        if is_existing_rejected
        else UnhandledYouthApplicationFactory.create()
    )
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
@pytest.mark.parametrize("handling_action", ["accept", "reject"])
@pytest.mark.parametrize(
    "handled_youth_application_factory",
    [
        AcceptedYouthApplicationFactory,
        RejectedYouthApplicationFactory,
    ],
)
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
def test_youth_applications_handle_handled(
    request,
    handling_action,
    handled_youth_application_factory,
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
    handled_youth_application = handled_youth_application_factory()
    assert handled_youth_application.status in YouthApplicationStatus.handled_values()
    old_status = handled_youth_application.status
    old_modified_at = handled_youth_application.modified_at
    response = client_fixture.patch(
        reverse_youth_application_action(handling_action, handled_youth_application.pk)
    )
    assert response.status_code == expected_status_code

    handled_youth_application.refresh_from_db()
    assert handled_youth_application.status == old_status
    assert handled_youth_application.modified_at == old_modified_at
    assert not AuditLogEntry.objects.exists()

    if response.status_code == status.HTTP_302_FOUND:
        assert response.url == RedirectTo.get_redirect_url(
            expected_redirect_to, handling_action, handled_youth_application.pk
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


@freeze_time()
@pytest.mark.django_db
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize("client_fixture_func", [unauth_api_client, staff_client])
@pytest.mark.parametrize(
    "disable_vtj,extra_field_name,extra_field_value,expected_status_code",
    [
        (
            disable_vtj,
            extra_field_name,
            extra_field_value,
            status.HTTP_201_CREATED if disable_vtj else status.HTTP_501_NOT_IMPLEMENTED,
        )
        for disable_vtj in [True]
        for extra_field_name, extra_field_value in [
            ("additional_info_provided_at", "2021-01-01"),
            ("social_security_number", "111111-111C"),
            ("inexistent field name", 3.14),
        ]
    ],
)
def test_youth_applications_set_excess_additional_info(
    request,
    settings,
    mock_flag,
    disable_vtj,
    client_fixture_func,
    extra_field_name,
    extra_field_value,
    expected_status_code,
):
    """
    Test that providing excess POST data when setting additional info for a youth
    application does not matter and does not change anything.
    """
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    settings.DISABLE_VTJ = disable_vtj
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)

    source_app = AdditionalInfoRequestedYouthApplicationFactory()

    # Check that the test objects are set up correctly
    assert source_app.additional_info_provided_at is None
    assert source_app.additional_info_user_reasons == []
    assert source_app.additional_info_description == ""
    assert source_app.can_set_additional_info
    old_extra_field_value = getattr(source_app, extra_field_name, None)

    post_data = test_additional_info()
    post_data[extra_field_name] = extra_field_value

    response = client_fixture.post(
        get_additional_info_url(source_app.pk),
        data=json.dumps(post_data),
        content_type="application/json",
    )

    assert response.status_code == expected_status_code

    if expected_status_code != status.HTTP_501_NOT_IMPLEMENTED:
        expected_fields_to_change = [
            "additional_info_user_reasons",
            "additional_info_description",
            "additional_info_provided_at",
        ]

        source_app.refresh_from_db()
        assert source_app.additional_info_user_reasons == [
            AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE
        ]
        assert source_app.additional_info_description == "Test text"
        assert source_app.additional_info_provided_at == timezone.now()
        if extra_field_name not in expected_fields_to_change:
            assert getattr(source_app, extra_field_name, None) == old_extra_field_value
        assert not source_app.can_set_additional_info


@freeze_time()
@pytest.mark.django_db
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize("client_fixture_func", [unauth_api_client, staff_client])
@pytest.mark.parametrize(
    "disable_vtj,additional_info_user_reasons,additional_info_description,expected_status_code",
    [
        (
            disable_vtj,
            additional_info_user_reasons,
            additional_info_description,
            status.HTTP_201_CREATED if disable_vtj else status.HTTP_501_NOT_IMPLEMENTED,
        )
        for disable_vtj in [True]
        for additional_info_user_reasons, additional_info_description in [
            (
                [AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE],
                unicodedata.lookup("person with folded hands"),
            ),
            ([AdditionalInfoUserReason.MOVING_TO_HELSINKI], "Test text"),
            (
                [
                    AdditionalInfoUserReason.STUDENT_IN_HELSINKI_BUT_NOT_RESIDENT,
                    AdditionalInfoUserReason.MOVING_TO_HELSINKI,
                    AdditionalInfoUserReason.PERSONAL_INFO_DIFFERS_FROM_VTJ,
                ],
                "Test text",
            ),
            (AdditionalInfoUserReason.values, "1st line.\n2nd line.\n3rd line."),
            (
                [AdditionalInfoUserReason.OTHER],
                " \tLeading\n and trailing whitespace should get removed \n\t ",
            ),
        ]
    ],
)
def test_youth_applications_set_valid_additional_info(
    request,
    settings,
    mock_flag,
    disable_vtj,
    client_fixture_func,
    additional_info_user_reasons,
    additional_info_description,
    expected_status_code,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    settings.DISABLE_VTJ = disable_vtj
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)

    source_app = AdditionalInfoRequestedYouthApplicationFactory()

    # Check that the test object is set up correctly
    assert source_app.additional_info_provided_at is None
    assert source_app.additional_info_user_reasons == []
    assert source_app.additional_info_description == ""
    assert source_app.can_set_additional_info

    post_data = {
        "additional_info_user_reasons": additional_info_user_reasons,
        "additional_info_description": additional_info_description,
    }

    response = client_fixture.post(
        get_additional_info_url(source_app.pk),
        data=json.dumps(post_data),
        content_type="application/json",
    )

    assert response.status_code == expected_status_code

    if expected_status_code != status.HTTP_501_NOT_IMPLEMENTED:
        source_app.refresh_from_db()
        assert source_app.additional_info_user_reasons == additional_info_user_reasons
        assert (
            source_app.additional_info_description
            == additional_info_description.strip()
        )
        assert source_app.additional_info_provided_at == timezone.now()
        assert not source_app.can_set_additional_info


@pytest.mark.django_db
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize("client_fixture_func", [unauth_api_client, staff_client])
@pytest.mark.parametrize(
    "disable_vtj,additional_info_user_reasons,additional_info_description,expected_status_code",
    [
        (
            disable_vtj,
            additional_info_user_reasons,
            additional_info_description,
            status.HTTP_400_BAD_REQUEST,
        )
        for disable_vtj in [False, True]
        for additional_info_user_reasons, additional_info_description in [
            (
                [AdditionalInfoUserReason.OTHER, "Invalid user reason"],
                "Valid description",
            ),
            (list(AdditionalInfoUserReason.values) + [""], "Valid description"),
            (list(AdditionalInfoUserReason.values) + [[]], "Valid description"),
            ([AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], ""),
            ([AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], None),
            ([AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE], "   \n  "),
            (["Invalid user reason"], "Valid description"),
            ([""], "Valid description"),
            ([" \n   "], "Valid description"),
            ([None], "Valid description"),
            # additional_info_user_reasons must be a list:
            (AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE, "Valid description"),
            ("Invalid user reason", "Valid description"),
            ("", "Valid description"),
            (" \n   ", "Valid description"),
            (None, "Valid description"),
            (8, "Valid description"),
            (dict(), "Valid description"),
            ({AdditionalInfoUserReason.UNDERAGE_OR_OVERAGE: True}, "Valid description"),
        ]
    ],
)
def test_youth_applications_set_invalid_additional_info(
    request,
    settings,
    mock_flag,
    disable_vtj,
    client_fixture_func,
    additional_info_user_reasons,
    additional_info_description,
    expected_status_code,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    settings.DISABLE_VTJ = disable_vtj
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)

    source_app = AdditionalInfoRequestedYouthApplicationFactory()
    old_additional_info_user_reasons = source_app.additional_info_user_reasons
    old_additional_info_description = source_app.additional_info_description
    old_additional_info_provided_at = source_app.additional_info_provided_at
    old_modified_at = source_app.modified_at

    post_data = {
        "additional_info_user_reasons": additional_info_user_reasons,
        "additional_info_description": additional_info_description,
    }

    response = client_fixture.post(
        get_additional_info_url(source_app.pk),
        data=json.dumps(post_data),
        content_type="application/json",
    )

    assert response.status_code == expected_status_code

    source_app.refresh_from_db()
    assert source_app.additional_info_user_reasons == old_additional_info_user_reasons
    assert source_app.additional_info_description == old_additional_info_description
    assert source_app.additional_info_provided_at == old_additional_info_provided_at
    assert source_app.modified_at == old_modified_at


@pytest.mark.django_db
@pytest.mark.parametrize("mock_flag", [False, True])
@pytest.mark.parametrize("client_fixture_func", [unauth_api_client, staff_client])
@pytest.mark.parametrize(
    "disable_vtj,missing_fields,expected_status_code",
    [
        (
            disable_vtj,
            missing_fields,
            status.HTTP_400_BAD_REQUEST,
        )
        for disable_vtj in [False, True]
        for missing_fields in [
            ["additional_info_user_reasons"],
            ["additional_info_description"],
            ["additional_info_user_reasons", "additional_info_description"],
        ]
    ],
)
def test_youth_applications_set_partial_additional_info(
    request,
    settings,
    mock_flag,
    disable_vtj,
    client_fixture_func,
    missing_fields,
    expected_status_code,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    settings.DISABLE_VTJ = disable_vtj
    client_fixture = request.getfixturevalue(client_fixture_func.__name__)

    source_app = AdditionalInfoRequestedYouthApplicationFactory()
    old_additional_info_user_reasons = source_app.additional_info_user_reasons
    old_additional_info_description = source_app.additional_info_description
    old_additional_info_provided_at = source_app.additional_info_provided_at
    old_modified_at = source_app.modified_at

    post_data = test_additional_info()

    for missing_field in missing_fields:
        del post_data[missing_field]

    response = client_fixture.post(
        get_additional_info_url(source_app.pk),
        data=json.dumps(post_data),
        content_type="application/json",
    )

    assert response.status_code == expected_status_code
    source_app.refresh_from_db()
    assert source_app.additional_info_user_reasons == old_additional_info_user_reasons
    assert source_app.additional_info_description == old_additional_info_description
    assert source_app.additional_info_provided_at == old_additional_info_provided_at
    assert source_app.modified_at == old_modified_at
