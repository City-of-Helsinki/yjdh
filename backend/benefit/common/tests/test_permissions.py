import pytest
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import BasePermission

from common.permissions import (
    BFIsApplicant,
    BFIsAuthenticated,
    BFIsHandler,
    TermsOfServiceAccepted,
)


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize(
    "permission",
    [BFIsAuthenticated, BFIsApplicant, BFIsHandler],
)
def test_permissions_with_anonymous_user(
    settings, next_public_mock_flag: bool, permission: BasePermission
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag

    class MockRequestWithAnonymousUser:
        user = AnonymousUser()

    assert (
        permission().has_permission(request=MockRequestWithAnonymousUser(), view=None)
        == next_public_mock_flag
    )


@pytest.mark.parametrize(
    "next_public_mock_flag,disable_tos_approval_check",
    [
        (False, True),
        (True, False),
        (True, True),
    ],
)
def test_terms_of_service_accepted(
    settings, next_public_mock_flag: bool, disable_tos_approval_check: bool
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    settings.DISABLE_TOS_APPROVAL_CHECK = disable_tos_approval_check
    assert TermsOfServiceAccepted().has_permission(request=None, view=None)
