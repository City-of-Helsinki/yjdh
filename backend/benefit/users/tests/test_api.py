import pytest
from django.test import override_settings


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.django_db
def test_current_user_view_with_mock_flag(anonymous_client):
    response = anonymous_client.get("/v1/users/me/")
    assert response.status_code == 200
    assert response.get("Content-Type") == "application/json"
    response_json = response.json()
    assert response_json.get("first_name") == "Test"
    assert response_json.get("last_name") == "User"
