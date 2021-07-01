import json
from datetime import datetime, timedelta, timezone

import pytest
from django.contrib.auth.models import AnonymousUser
from django.test import override_settings
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation, Status

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
        },
        "operation": "READ",
        "target": {
            "id": "",
            "type": "User",
        },
    }
}


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_logs_at_info_level(caplog, user):
    audit_logging.log(
        user,
        Operation.READ,
        user,
        ip_address="192.168.1.1",
    )
    for record in caplog.records:
        assert record.levelname == "INFO"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
@pytest.mark.parametrize("operation", list(Operation))
def test_log_owner_operation(caplog, fixed_datetime, user, operation):
    audit_logging.log(
        user,
        operation,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "OWNER",
                "user_id": str(user.id),
                "ip_address": "192.168.1.1",
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
def test_log_anonymous_role(caplog, fixed_datetime, user):
    audit_logging.log(
        AnonymousUser(),
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "ANONYMOUS",
                "user_id": None,
                "ip_address": "192.168.1.1",
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
def test_log_user_role(caplog, fixed_datetime, user, other_user):
    audit_logging.log(
        user,
        Operation.READ,
        other_user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "USER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
            },
            "target": {"id": str(other_user.pk), "type": "User"},
        },
    }


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
@pytest.mark.parametrize("operation", list(Operation))
def test_log_system_operation(caplog, fixed_datetime, user, operation):
    audit_logging.log(
        None,
        operation,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "operation": operation.value,
            "actor": {
                "role": "SYSTEM",
                "user_id": None,
                "ip_address": "192.168.1.1",
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
def test_log_status(caplog, fixed_datetime, user, status):
    audit_logging.log(
        user,
        Operation.READ,
        user,
        status,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "status": status.value,
            "actor": {
                "role": "OWNER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
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
def test_log_origin(caplog, fixed_datetime, user):
    audit_logging.log(
        user,
        Operation.READ,
        user,
        get_time=fixed_datetime,
        ip_address="192.168.1.1",
    )
    message = json.loads(caplog.records[-1].message)
    assert message["audit_event"]["origin"] == "TEST_SERVICE"


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_current_timestamp(caplog, user):
    tolerance = timedelta(seconds=1)
    date_before_logging = datetime.now(tz=timezone.utc) - tolerance
    audit_logging.log(
        user,
        Operation.READ,
        user,
        ip_address="192.168.1.1",
    )
    date_after_logging = datetime.now(tz=timezone.utc) + tolerance
    message = json.loads(caplog.records[-1].message)
    logged_date_from_date_time_epoch = datetime.fromtimestamp(
        int(message["audit_event"]["date_time_epoch"]) / 1000, tz=timezone.utc
    )
    assert date_before_logging <= logged_date_from_date_time_epoch <= date_after_logging
    logged_date_from_date_time = datetime.strptime(
        message["audit_event"]["date_time"], "%Y-%m-%dT%H:%M:%S.%f%z"
    )
    assert date_before_logging <= logged_date_from_date_time <= date_after_logging


@pytest.mark.django_db
@override_settings(
    AUDIT_LOG_ORIGIN="TEST_SERVICE",
)
def test_log_status_change(caplog, user):
    audit_logging.log(
        user,
        Operation.UPDATE,
        user,
        ip_address="192.168.1.1",
        target_status_before="draft",
        target_status_after="submitted",
    )
    message = json.loads(caplog.records[-1].message)
    assert message["audit_event"]["target"] == {
        "id": str(user.pk),
        "type": "User",
        "status_before": "draft",
        "status_after": "submitted",
    }
