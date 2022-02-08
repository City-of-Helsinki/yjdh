import pytest

from applications.enums import YouthApplicationRejectedReason


@pytest.mark.django_db
@pytest.mark.parametrize(
    "enum,expected_json_code,expected_json_message",
    [
        (enum, str(enum.value), str(enum.label))
        for enum in YouthApplicationRejectedReason
    ],
)
def test_youth_application_rejected_reason_json(
    enum,
    expected_json_code,
    expected_json_message,
):
    assert "code" in enum.json()
    assert "message" in enum.json()

    assert enum.json()["code"] == expected_json_code
    assert enum.json()["message"] == expected_json_message
