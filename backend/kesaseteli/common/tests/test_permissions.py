import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import override_settings, RequestFactory
from shared.common.tests.factories import UserFactory

from common.permissions import HandlerPermission


def _get_test_user_and_expected_handler_permission_tuples():
    """
    Get list of tuples with test user and expected
    HandlerPermission.has_user_permission(<test user>) values.
    """
    return [
        (AnonymousUser(), False),
        (None, False),
        (UserFactory.build(is_active=False, is_staff=False, is_superuser=False), False),
        (UserFactory.build(is_active=False, is_staff=False, is_superuser=True), False),
        (UserFactory.build(is_active=False, is_staff=True, is_superuser=False), False),
        (UserFactory.build(is_active=False, is_staff=True, is_superuser=True), False),
        (UserFactory.build(is_active=True, is_staff=False, is_superuser=False), False),
        (UserFactory.build(is_active=True, is_staff=False, is_superuser=True), True),
        (UserFactory.build(is_active=True, is_staff=True, is_superuser=False), True),
        (UserFactory.build(is_active=True, is_staff=True, is_superuser=True), True),
    ]


@pytest.mark.django_db
@pytest.mark.parametrize("mock_flag", [False, True])
def test_handler_permission_get_handler_users_queryset(settings, mock_flag):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    old_user_count = get_user_model().objects.all().count()
    # Make sure the test users except AnonymousUser() and None are saved
    for test_user, _ in _get_test_user_and_expected_handler_permission_tuples():
        if test_user is not None and not isinstance(test_user, AnonymousUser):
            test_user.save()
    new_user_count = get_user_model().objects.all().count()
    assert new_user_count >= old_user_count + 8  # Minimum expected combinations
    handlers = HandlerPermission.get_handler_users_queryset()
    users = get_user_model().objects.all()
    for user in users:
        assert (user in handlers) == HandlerPermission.has_user_permission(user)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,test_user",
    [
        (mock_flag, test_user)
        for mock_flag in [False, True]
        for test_user, _ in _get_test_user_and_expected_handler_permission_tuples()
    ],
)
def test_handler_permission_has_permission(settings, mock_flag, test_user):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    request = RequestFactory().get("/")
    request.user = test_user
    assert HandlerPermission().has_permission(
        request, view=None
    ) == HandlerPermission.has_user_permission(request.user)


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "test_user,expected_result", _get_test_user_and_expected_handler_permission_tuples()
)
def test_handler_permission_has_user_permission_without_mock_flag(
    test_user, expected_result
):
    assert HandlerPermission.has_user_permission(test_user) == expected_result


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize(
    "test_user,expected_result",
    [
        (test_user, True)
        for test_user, _ in _get_test_user_and_expected_handler_permission_tuples()
    ],
)
def test_handler_permission_has_user_permission_with_mock_flag(
    test_user, expected_result
):
    assert HandlerPermission.has_user_permission(test_user) == expected_result


@pytest.mark.parametrize("mock_flag", [False, True])
def test_handler_permission_allow_empty_handler(settings, mock_flag):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    assert HandlerPermission.allow_empty_handler() == mock_flag
