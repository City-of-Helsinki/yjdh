import json
from typing import Optional

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse

from shared.common.tests.factories import HelsinkiProfileUserFactory
from users.models import format_date

User = get_user_model()


def extract_value(gdpr_api_response: dict, key: str) -> Optional[str]:
    """Extract value from GDPR API response."""
    user: dict = gdpr_api_response["children"]
    return next((item["value"] for item in user if item["key"] == key), None)


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_get_profile_data_from_gdpr_api_no_auth(api_client):
    """Test that the profile data is valid without authentication."""
    user = HelsinkiProfileUserFactory()
    response = api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    response_dict = json.loads(response.content)
    assert response.status_code == 200
    assert extract_value(response_dict, "FIRST_NAME") == user.first_name
    assert extract_value(response_dict, "LAST_NAME") == user.last_name
    assert extract_value(response_dict, "EMAIL") == user.email
    assert extract_value(response_dict, "DATE_JOINED") == format_date(
        user.date_joined  # type: ignore
    )
    assert extract_value(response_dict, "LAST_LOGIN") == format_date(
        user.last_login  # type: ignore
    )


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_delete_profile_data_from_gdpr_api_no_auth(api_client):
    """Test that the profile data is deleted without authentication."""
    user = HelsinkiProfileUserFactory()
    response = api_client.delete(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    assert response.status_code == 204
    with pytest.raises(User.DoesNotExist):
        User.objects.get(username=user.username)
