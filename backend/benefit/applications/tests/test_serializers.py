import pytest

from applications.api.v1.serializers import (
    ApplicantApplicationSerializer,
    BaseApplicationSerializer,
    HandlerApplicationSerializer,
)


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize(
    "application_serializer",
    [ApplicantApplicationSerializer, HandlerApplicationSerializer],
)
def test_logged_in_user_is_admin_with_anonymous_user(
    settings,
    anonymous_client,
    next_public_mock_flag: bool,
    application_serializer: BaseApplicationSerializer,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    assert application_serializer().logged_in_user_is_admin() == next_public_mock_flag


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize(
    "application_serializer",
    [ApplicantApplicationSerializer, HandlerApplicationSerializer],
)
def test_get_logged_in_user_company_with_anonymous_user(
    settings,
    anonymous_client,
    next_public_mock_flag: bool,
    application_serializer: BaseApplicationSerializer,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    assert (
        application_serializer().get_logged_in_user_company() is not None
    ) == next_public_mock_flag
