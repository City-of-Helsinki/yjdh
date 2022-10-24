import pytest
from django.contrib.auth.models import AnonymousUser

from applications.enums import ApplicationStatus


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize("status", ApplicationStatus.values)
def test_is_editable_status_with_anonymous_user(
    settings, next_public_mock_flag: bool, status: str
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    assert (
        ApplicationStatus(status).is_editable_status(AnonymousUser(), status)
        == next_public_mock_flag
    )
