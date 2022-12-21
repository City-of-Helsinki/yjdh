import uuid

import pytest
from django.urls import reverse
from rest_framework import status

from shared.common.tests.factories import UserFactory


@pytest.fixture
def user_with_uuid_username(client):
    return UserFactory(username=str(uuid.uuid4()))


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ["get", "delete"])
def test_gdpr_api_without_authentication(client, user_with_uuid_username, http_method):
    client.force_login(user_with_uuid_username)
    client_method = getattr(client, http_method)
    assert callable(client_method)
    url = reverse("gdpr_v1", kwargs={"uuid": user_with_uuid_username.username})
    response = client_method(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ["get", "delete"])
def test_gdpr_api_with_non_uuid_username(client, user_with_uuid_username, http_method):
    client.force_login(user_with_uuid_username)
    client_method = getattr(client, http_method)
    assert callable(client_method)
    url = reverse("gdpr_v1", kwargs={"uuid": user_with_uuid_username.username})
    url = url.replace(user_with_uuid_username.username, "not_a_uuid_value")
    response = client_method(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
