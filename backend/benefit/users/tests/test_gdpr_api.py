import json

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse

from shared.common.tests.factories import UserFactory
from users.models import format_date

User = get_user_model()


def extract_val(resp: dict, key: str) -> str:
    """Extract value from GDPR API response."""
    user = resp["children"]
    value_pair = next(item for item in user if item["key"] == key)
    return value_pair["value"]


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_get_profile_data_from_gdpr_api(api_client):
    """Test that the profile data is valid without authentication."""
    user = UserFactory()
    response = api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    resp = json.loads(response.content)
    assert response.status_code == 200
    assert extract_val(resp, "FIRST_NAME") == user.first_name
    assert extract_val(resp, "LAST_NAME") == user.last_name
    assert extract_val(resp, "EMAIL") == user.email
    assert extract_val(resp, "DATE_JOINED") == format_date(user.date_joined)  # type: ignore
    assert extract_val(resp, "LAST_LOGIN") == format_date(user.last_login)  # type: ignore


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_delete_profile_data_from_gdpr_api(api_client):
    """Test that the profile data is deleted without authentication."""
    user = UserFactory()
    response = api_client.delete(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    assert response.status_code == 204
    with pytest.raises(User.DoesNotExist):
        User.objects.get(username=user.username)
