import pytest
from rest_framework import status
from rest_framework.reverse import reverse

from applications.api.v1.serializers import YouthApplicationSerializer


@pytest.mark.django_db
def test_youth_applications_list(api_client):
    response = api_client.get(reverse("v1:youthapplication-list"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_youth_application_post_valid_data(api_client, youth_application):
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_youth_application_post_invalid_language(api_client, youth_application):
    data = YouthApplicationSerializer(youth_application).data
    data["language"] = "asd"
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "language" in response.data


@pytest.mark.django_db
def test_youth_application_post_invalid_social_security_number(
    api_client, youth_application
):
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = "111111-111X"  # "111111-111C" would be valid
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "social_security_number" in response.data
