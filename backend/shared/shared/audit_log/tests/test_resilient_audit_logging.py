from datetime import datetime, timedelta, timezone

import pytest
from django.contrib.auth.models import AnonymousUser

from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation, Status

try:
    from resilient_logger.models import ResilientLogEntry
    from resilient_logger.sources import ResilientLogSource

    LOGGER_IMPORTED = True
except ImportError:
    LOGGER_IMPORTED = False

resilient_logger_configured = pytest.mark.skipif(
    not LOGGER_IMPORTED, reason="Resilient logger not available"
)


@pytest.fixture(autouse=True)
def set_resilient_settings(settings):
    if LOGGER_IMPORTED:
        settings.RESILIENT_LOGGER["origin"] = "yjdh-test"
        settings.RESILIENT_LOGGER["environment"] = "unittesting"


FIXED_TIMESTAMP = "2020-06-01T00:00:00.000Z"

_common_fields = {
    "@timestamp": FIXED_TIMESTAMP,
    "audit_event": {
        "origin": "yjdh-test",
        "environment": "unittesting",
        "extra": {"source_pk": "", "status": "SUCCESS"},
        "message": "SUCCESS",
        "date_time": FIXED_TIMESTAMP,
        "level": 0,
        "actor": {
            "role": "OWNER",
            "user_id": None,
            "ip_address": "192.168.1.1",
        },
        "operation": "READ",
        "target": {
            "id": "",
            "type": "User",
        },
    },
}


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
@pytest.mark.parametrize("operation", list(Operation))
def test_log_owner_operation(user, operation):
    audit_logging.log(user, "", operation, user, ip_address="192.168.1.1")

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
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
            "extra": {"source_pk": log_entry.pk, "status": "SUCCESS"},
            "operation": operation.value,
        },
    }


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
def test_log_anonymous_role(user):
    audit_logging.log(
        AnonymousUser(), "", Operation.READ, user, ip_address="192.168.1.1"
    )

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
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
            "extra": {"source_pk": log_entry.pk, "status": "SUCCESS"},
        },
    }


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
def test_log_user_role(user, other_user):
    audit_logging.log(user, "", Operation.READ, other_user, ip_address="192.168.1.1")

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "USER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
            },
            "target": {"id": str(other_user.pk), "type": "User"},
            "extra": {"source_pk": log_entry.pk, "status": "SUCCESS"},
        },
    }


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
@pytest.mark.parametrize("operation", list(Operation))
def test_log_system_operation(user, operation):
    audit_logging.log(None, "", operation, user, ip_address="192.168.1.1")

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
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
            "extra": {"source_pk": log_entry.pk, "status": "SUCCESS"},
        },
    }


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
@pytest.mark.parametrize("status", list(Status))
def test_log_status(user, status):
    audit_logging.log(user, "", Operation.READ, user, status, ip_address="192.168.1.1")

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "OWNER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
            "message": str(status.value),
            "extra": {"source_pk": log_entry.pk, "status": str(status.value)},
        },
    }


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
def test_log_origin(user):
    audit_logging.log(user, "", Operation.READ, user, ip_address="192.168.1.1")

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()
    assert document["audit_event"]["origin"] == "yjdh-test"


@resilient_logger_configured
@pytest.mark.django_db
def test_log_current_timestamp(user):
    tolerance = timedelta(seconds=1)
    date_before_logging = datetime.now(tz=timezone.utc) - tolerance
    audit_logging.log(user, "", Operation.READ, user, ip_address="192.168.1.1")
    date_after_logging = datetime.now(tz=timezone.utc) + tolerance

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    logged_date_from_date_time = datetime.strptime(
        document["audit_event"]["date_time"], "%Y-%m-%dT%H:%M:%S.%f%z"
    )
    assert date_before_logging <= logged_date_from_date_time <= date_after_logging


@resilient_logger_configured
@pytest.mark.django_db
def test_log_additional_information(user):
    audit_logging.log(
        user,
        "",
        Operation.UPDATE,
        user,
        additional_information="test",
    )

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document["audit_event"]["extra"]["additional_information"] == "test"


@resilient_logger_configured
@pytest.mark.freeze_time(FIXED_TIMESTAMP)
@pytest.mark.django_db
def test_log_user_with_backend(user):
    audit_logging.log(
        user,
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
        Operation.READ,
        user,
        ip_address="192.168.1.1",
    )

    log_entry = ResilientLogEntry.objects.first()
    document = ResilientLogSource(log_entry).get_document()

    assert document == {
        **_common_fields,
        "audit_event": {
            **_common_fields["audit_event"],
            "actor": {
                "role": "OWNER",
                "user_id": str(user.pk),
                "ip_address": "192.168.1.1",
            },
            "target": {
                "id": str(user.pk),
                "type": "User",
            },
            "extra": {
                "source_pk": log_entry.pk,
                "status": "SUCCESS",
                "provider": "Helsinki Profile",
            },
        },
    }
