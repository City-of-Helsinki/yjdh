import logging
from unittest import mock

import pytest
from django.contrib.auth.signals import user_logged_in
from django.test import override_settings
from resilient_logger.models import ResilientLogEntry

from kesaseteli.auth_logging import (
    AuthEventType,
    VtjQueryType,
    log_login_event,
)
from shared.oidc.signals import (
    suomifi_mandate_queried,
    suomifi_mandate_query_failed,
)
from shared.vtj.signals import (
    vtj_queried,
    vtj_query_failed,
)

pytestmark = pytest.mark.django_db


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_login_event_creates_entry(user):
    request = mock.Mock()
    request.META = {"REMOTE_ADDR": "1.2.3.4"}
    user.backend = "django.contrib.auth.backends.ModelBackend"

    log_login_event(request, user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.LOGIN
    assert entry.context["user_id"] == str(user.pk)
    assert entry.context["ip_address"] == "1.2.3.4"
    assert entry.context["auth_backend"] == "django.contrib.auth.backends.ModelBackend"
    assert entry.level == logging.INFO


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_mandate_query_creates_entry(user):
    org_roles = {
        "name": "Test Oy",
        "identifier": "1234567-8",
        "complete": True,
        "roles": ["NIMKO"],
    }
    request = mock.Mock()
    request.user = user

    suomifi_mandate_queried.send(
        sender=None,
        request=request,
        request_id="req-123",
        organization_roles=org_roles,
    )

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.MANDATE_QUERY
    assert entry.context["user_id"] == str(user.pk)
    assert entry.context["company_identifier"] == "1234567-8"
    assert entry.context["company_name"] == "Test Oy"
    assert entry.context["roles"] == ["NIMKO"]
    assert entry.context["query_complete"] is True
    assert entry.context["success"] is True
    assert entry.context["request_id"] == "req-123"
    assert entry.level == logging.INFO


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_mandate_query_failure_creates_entry(user):
    error = Exception("Connection refused")
    request = mock.Mock()
    request.user = user

    suomifi_mandate_query_failed.send(
        sender=None,
        request=request,
        request_id="req-123",
        error=error,
    )

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.MANDATE_QUERY
    assert entry.context["success"] is False
    assert entry.context["request_id"] == "req-123"
    assert "Connection refused" in entry.context["error"]
    assert entry.level == logging.WARNING


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_user_logged_in_signal_creates_login_entry(user):
    """Signal handler fires on user_logged_in and persists a LOGIN entry."""
    request = mock.Mock()
    request.META = {"REMOTE_ADDR": "10.0.0.1"}

    user_logged_in.send(sender=user.__class__, request=request, user=user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.LOGIN
    assert entry.context["ip_address"] == "10.0.0.1"


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_login_event_missing_backend(user):
    """No 'backend' attribute on user defaults to 'unknown'."""
    request = mock.Mock()
    request.META = {"REMOTE_ADDR": "1.2.3.4"}
    if hasattr(user, "backend"):
        del user.backend

    log_login_event(request, user)

    entry = ResilientLogEntry.objects.last()
    assert entry.context["auth_backend"] == "unknown"


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_vtj_query_creates_entry():
    vtj_queried.send(
        sender=None,
        end_user="handler-uuid-123",
        social_security_number="010101-123N",
    )

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.VTJ_QUERY
    assert entry.context["end_user"] == "handler-uuid-123"
    assert entry.context["social_security_number"] == "010101-123N"
    assert entry.context["query_type"] == VtjQueryType.PERSONAL_DATA_QUERY
    assert entry.context["success"] is True
    assert entry.level == logging.INFO


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_log_vtj_query_failure_creates_entry():
    error = Exception("Connection refused")

    vtj_query_failed.send(
        sender=None,
        end_user="handler-uuid-123",
        social_security_number="010101-123N",
        error=error,
    )

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["event_type"] == AuthEventType.VTJ_QUERY
    assert entry.context["end_user"] == "handler-uuid-123"
    assert entry.context["social_security_number"] == "010101-123N"
    assert entry.context["query_type"] == VtjQueryType.PERSONAL_DATA_QUERY
    assert entry.context["success"] is False
    assert "Connection refused" in entry.context["error"]
    assert entry.level == logging.WARNING


@override_settings(ENABLE_AUTH_LOGGING=False)
def test_logging_disabled_creates_no_entry(user):
    """When ENABLE_AUTH_LOGGING is False no entries are written."""
    request = mock.Mock()
    request.META = {"REMOTE_ADDR": "1.2.3.4"}
    request.user = user

    log_login_event(request, user)

    suomifi_mandate_queried.send(
        sender=None,
        request=request,
        request_id="req-123",
        organization_roles={"name": "Test Oy", "identifier": "1234567-8"},
    )
    suomifi_mandate_query_failed.send(
        sender=None,
        request=request,
        request_id="req-123",
        error=Exception("fail"),
    )

    vtj_queried.send(
        sender=None,
        end_user="handler-uuid-123",
        social_security_number="010101-123N",
    )
    vtj_query_failed.send(
        sender=None,
        end_user="handler-uuid-123",
        social_security_number="010101-123N",
        error=Exception("fail"),
    )

    assert ResilientLogEntry.objects.count() == 0
