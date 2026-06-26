from unittest import mock

import pytest
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.test import override_settings, RequestFactory
from requests.exceptions import ConnectionError as RequestsConnectionError
from resilient_logger.models import ResilientLogEntry

from applications.api.v1.exceptions import VTJServiceUnavailableError
from applications.services import VTJService
from common.tests.factories import (
    DuplicateAllowingUserFactory,
    YouthApplicationFactory,
)
from kesaseteli.auth_logging import AuthEventType, VtjQueryType

pytestmark = pytest.mark.django_db


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    NEXT_PUBLIC_DISABLE_VTJ=False,
    ENABLE_AUTH_LOGGING=True,
    VTJ_USERNAME="test_user",
    VTJ_PASSWORD="test_password",
    VTJ_TIMEOUT=30,
    VTJ_PERSONAL_ID_QUERY_URL="https://example.com/vtj",
)
def test_fetch_vtj_json_logs_vtj_query():
    """Successful VTJ query creates a VTJ_QUERY log entry."""
    application = YouthApplicationFactory()
    end_user = "test-handler-uuid"
    vtj_response = {
        "Henkilo": {"Henkilotunnus": {"value": application.social_security_number}}
    }

    with mock.patch("shared.vtj.vtj_client.requests.post") as mock_post:
        mock_response = mock.Mock()
        mock_response.json.return_value = vtj_response
        mock_post.return_value = mock_response
        VTJService.fetch_vtj_json(application, end_user=end_user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["operation"] == AuthEventType.VTJ_QUERY
    assert entry.context["actor"]["user_id"] == end_user
    assert (
        entry.context["target"]["social_security_number"]
        == application.social_security_number
    )
    assert entry.context["query_type"] == VtjQueryType.PERSONAL_DATA_QUERY
    assert entry.context["success"] is True
    assert entry.context["request_id"] is not None


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    NEXT_PUBLIC_DISABLE_VTJ=False,
    ENABLE_AUTH_LOGGING=True,
    VTJ_USERNAME="test_user",
    VTJ_PASSWORD="test_password",
    VTJ_TIMEOUT=30,
    VTJ_PERSONAL_ID_QUERY_URL="https://example.com/vtj",
)
def test_fetch_vtj_json_logs_vtj_query_failure_on_api_error():
    """Failed VTJ query creates a failed VTJ_QUERY log entry and re-raises."""
    application = YouthApplicationFactory()
    end_user = "test-handler-uuid"

    with mock.patch(
        "shared.vtj.vtj_client.requests.post",
        side_effect=RequestsConnectionError("Connection refused"),
    ):
        with pytest.raises(VTJServiceUnavailableError):
            VTJService.fetch_vtj_json(application, end_user=end_user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["operation"] == AuthEventType.VTJ_QUERY
    assert entry.context["actor"]["user_id"] == end_user
    assert (
        entry.context["target"]["social_security_number"]
        == application.social_security_number
    )
    assert entry.context["success"] is False
    assert entry.context["request_id"] is not None
    assert "Connection refused" in entry.context["error"]


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    NEXT_PUBLIC_DISABLE_VTJ=False,
    ENABLE_AUTH_LOGGING=False,
    VTJ_USERNAME="test_user",
    VTJ_PASSWORD="test_password",
    VTJ_TIMEOUT=30,
    VTJ_PERSONAL_ID_QUERY_URL="https://example.com/vtj",
)
def test_fetch_vtj_json_no_log_when_logging_disabled():
    """No log entry is written when ENABLE_AUTH_LOGGING is False."""
    application = YouthApplicationFactory()
    vtj_response = {"Henkilo": {}}

    with mock.patch("shared.vtj.vtj_client.requests.post") as mock_post:
        mock_response = mock.Mock()
        mock_response.json.return_value = vtj_response
        mock_post.return_value = mock_response
        VTJService.fetch_vtj_json(application, end_user="handler")

    assert ResilientLogEntry.objects.count() == 0


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_on_user_logged_in_logs_login():
    """Successful login triggers a LOGIN log entry."""
    user = DuplicateAllowingUserFactory()
    request = RequestFactory().get("/")
    user_logged_in.send(sender=user.__class__, request=request, user=user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["operation"] == AuthEventType.LOGIN
    assert entry.context["actor"]["user_id"] == str(user.pk)


@override_settings(ENABLE_AUTH_LOGGING=True)
def test_on_user_logged_out_logs_logout():
    """Successful logout triggers a LOGOUT log entry."""
    user = DuplicateAllowingUserFactory()
    request = RequestFactory().get("/")
    user_logged_out.send(sender=user.__class__, request=request, user=user)

    entry = ResilientLogEntry.objects.last()
    assert entry is not None
    assert entry.context["operation"] == AuthEventType.LOGOUT
    assert entry.context["actor"]["user_id"] == str(user.pk)


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    NEXT_PUBLIC_DISABLE_VTJ=False,
    VTJ_USERNAME="",
    VTJ_PASSWORD="",
    VTJ_PERSONAL_ID_QUERY_URL="",
)
def test_fetch_vtj_json_raises_service_unavailable_on_value_error():
    """ValueError due to missing VTJ settings should be caught and raise VTJServiceUnavailableError."""
    application = YouthApplicationFactory()
    with pytest.raises(VTJServiceUnavailableError):
        VTJService.fetch_vtj_json(application, end_user="test-handler-uuid")


@override_settings(ENABLE_AUTH_LOGGING=True)
@pytest.mark.parametrize("user", [None, AnonymousUser()])
def test_on_user_logged_out_does_not_log_if_anonymous_or_none(user):
    """Anonymous or None user logout does not trigger a LOGOUT log entry."""
    request = RequestFactory().get("/")
    user_logged_out.send(
        sender=user.__class__ if user else None, request=request, user=user
    )

    assert (
        ResilientLogEntry.objects.filter(
            context__operation=AuthEventType.LOGOUT
        ).count()
        == 0
    )
