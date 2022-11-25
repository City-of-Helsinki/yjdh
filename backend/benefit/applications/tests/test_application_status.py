import pytest
from django.contrib.auth.models import AnonymousUser

from applications.enums import ApplicationStatus


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize("status", ApplicationStatus.values)
def test_is_editable_status_with_anonymous_user(
    settings, next_public_mock_flag: bool, status: str
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    is_editable_status = ApplicationStatus(status).is_editable_status(
        AnonymousUser(), status
    )
    if next_public_mock_flag:
        assert is_editable_status == (
            ApplicationStatus.is_handler_editable_status(status)
            or ApplicationStatus.is_applicant_editable_status(status)
        )
    else:
        assert not is_editable_status
