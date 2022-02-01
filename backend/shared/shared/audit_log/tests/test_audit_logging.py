from datetime import datetime, timedelta
from unittest import mock

import pytest
from django.contrib.auth.models import AnonymousUser
from django.test import override_settings
from django.utils import timezone

from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation, Status
from shared.audit_log.models import AuditLogEntry
from shared.audit_log.tasks import (
    clear_audit_log_entries,
    send_audit_log_to_elastic_search,
)

_common_fields = {
    "audit_event": {
        "origin": "TEST_SERVICE",
        "status": "SUCCESS",
        "date_time_epoch": 1590969600000,
        "date_time": "2020-06-01T00:00:00.000Z",
        "actor": {
            "role": "OWNER",
            "user_id": "",
            "ip_address": "192.168.1.1",
            "provider": "",
        },
        "operation": "READ",
        "target": {
            "id": "",
            "type": "User",
        },
        "additional_information": "",
    }
}


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
@pytest.mark.parametrize("operation", list(Operation))
def test_log_owner_operation(fixed_datetime, user, operation):
    audit_logging.log(
        user,
        "",
        operation,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "OWNER",
                "user_id": str(user.id),
                "ip_address": "192.168.1.1",
                "provider": "",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
            "operation": operation.value,
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_anonymous_role(fixed_datetime, user):
    audit_logging.log(
        AnonymousUser(),
        "",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "ANONYMOUS",
                "user_id": "",
                "ip_address": "192.168.1.1",
                "provider": "",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_user_role(fixed_datetime, user, other_user):
    audit_logging.log(
        user,
        "",
        Operation.READ,
        other_user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "USER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
                "provider": "",
            },
            "target": {"id": str(other_user.pk), "type": "User"},
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
@pytest.mark.parametrize("operation", list(Operation))
def test_log_system_operation(fixed_datetime, user, operation):
    audit_logging.log(
        None,
        "",
        operation,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "operation": operation.value,
            "actor": {
                "role": "SYSTEM",
                "user_id": "",
                "ip_address": "192.168.1.1",
                "provider": "",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
@pytest.mark.parametrize("status", list(Status))
def test_log_status(fixed_datetime, user, status):
    audit_logging.log(
        user,
        "",
        Operation.READ,
        user,
        status,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "status": status.value,
            "actor": {
                "role": "OWNER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
                "provider": "",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_origin(fixed_datetime, user):
    audit_logging.log(
        user,
        "",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes["audit_event"]["origin"] == "TEST_SERVICE"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_current_timestamp(user):
    tolerance = timedelta(seconds=1)
    date_before_logging = datetime.now(tz=timezone.utc) - tolerance
    audit_logging.log(
        user,
        "",
        Operation.READ,
        user,
        ip_address="192.168.1.1",
    )

    date_after_logging = datetime.now(tz=timezone.utc) + tolerance
    audit_log_changes = AuditLogEntry.objects.first().message
    logged_date_from_date_time_epoch = datetime.fromtimestamp(
        int(audit_log_changes["audit_event"]["date_time_epoch"]) / 1000, tz=timezone.utc
    )
    assert date_before_logging <= logged_date_from_date_time_epoch <= date_after_logging
    logged_date_from_date_time = datetime.strptime(
        audit_log_changes["audit_event"]["date_time"], "%Y-%m-%dT%H:%M:%S.%f%z"
    )
    assert date_before_logging <= logged_date_from_date_time <= date_after_logging


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_additional_information(user):
    audit_logging.log(
        user,
        "",
        Operation.UPDATE,
        user,
        additional_information="test",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes["audit_event"]["additional_information"] == "test"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_user_with_backend(user, fixed_datetime):
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )

    audit_log_changes = AuditLogEntry.objects.first().message
    assert audit_log_changes == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "OWNER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
                "provider": "Helsinki Profile",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
        },
    }


@pytest.mark.django_db
@override_settings(
    ENABLE_SEND_AUDIT_LOG=True,
)
def test_send_audit_log_missing_configuration(user, fixed_datetime):
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    assert AuditLogEntry.objects.count() == 1
    entry = AuditLogEntry.objects.first()
    assert entry.is_sent is False
    send_audit_log_to_elastic_search()
    assert entry.is_sent is False


@pytest.mark.parametrize(
    "result_value, expected_status",
    [("created", True), ("failed", False)],  # Log sent successfully
)
@pytest.mark.django_db
@override_settings(
    ELASTICSEARCH_HOST="example.com",
    ELASTICSEARCH_PORT="1234",
    ELASTICSEARCH_USERNAME="e_user",
    ELASTICSEARCH_PASSWORD="e_password",
    ENABLE_SEND_AUDIT_LOG=True,
)
def test_send_audit_log_success(user, fixed_datetime, result_value, expected_status):
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    assert AuditLogEntry.objects.count() == 1
    assert AuditLogEntry.objects.first().is_sent is False

    with mock.patch("elasticsearch.Elasticsearch.index") as elasticsearch_index_mock:
        elasticsearch_index_mock.return_value = {"result": result_value}
        send_audit_log_to_elastic_search()
        assert AuditLogEntry.objects.first().is_sent == expected_status


@pytest.mark.django_db
@override_settings(CLEAR_AUDIT_LOG_ENTRIES=True)
def test_clear_audit_log(user, fixed_datetime):
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    assert AuditLogEntry.objects.count() == 3

    new_sent_log = AuditLogEntry.objects.all()[0]
    expired_unsent_log = AuditLogEntry.objects.all()[1]
    expired_sent_log = AuditLogEntry.objects.all()[2]

    new_sent_log.is_sent = True
    new_sent_log.save()

    expired_unsent_log.created_at = timezone.now() - timedelta(days=35)
    expired_unsent_log.save()

    expired_sent_log.is_sent = True
    expired_sent_log.created_at = timezone.now() - timedelta(days=35)
    expired_sent_log.save()

    clear_audit_log_entries()
    assert AuditLogEntry.objects.count() == 2
    assert AuditLogEntry.objects.filter(id=new_sent_log.id).exists()
    assert AuditLogEntry.objects.filter(id=expired_unsent_log.id).exists()
