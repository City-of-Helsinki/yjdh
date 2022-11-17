import pytest
from django.contrib.auth.models import AnonymousUser
from django.test import override_settings

from messages.permissions import HasMessagePermission


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize(
    "request_method", ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
)
def test_has_message_permission_with_mock_flag(settings, request_method: str):
    class MockRequestWithAnonymousUser:
        user = AnonymousUser()
        method = request_method

    assert HasMessagePermission().has_permission(
        request=MockRequestWithAnonymousUser(), view=None
    )
