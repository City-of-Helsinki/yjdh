import pytest
from django.test import override_settings
from rest_framework import status

from applications.api.v1.serializers import (
    NonVtjYouthApplicationSerializer,
    YouthApplicationSerializer,
)
from common.tests.factories import (
    AcceptableNonVtjYouthApplicationFactory,
    InactiveNoNeedAdditionalInfoYouthApplicationFactory,
)
from common.urls import get_create_without_ssn_url, get_list_url


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_DISABLE_VTJ=True)
@pytest.mark.parametrize(
    "invalid_target_group",
    [
        "",
        " ",
        "invalid_group",
        "123",
        "primary_target_group_suffix",
    ],
)
def test_youth_application_creation_invalid_target_group(
    api_client, invalid_target_group
):
    """
    Test that creating a youth application with an invalid target group returns 400 Bad Request.
    """
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["target_group"] = invalid_target_group

    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_group" in response.data
    assert response.data["target_group"][0].code == "invalid_choice"


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_DISABLE_VTJ=True)
@pytest.mark.parametrize(
    "invalid_target_group",
    [
        "",
        " ",
        "invalid_group",
        "999",
    ],
)
def test_non_vtj_youth_application_creation_invalid_target_group(
    staff_client, invalid_target_group
):
    """
    Test that creating a non-VTJ youth application with an invalid target group returns 400 Bad Request.
    """
    # Create the factory instance but ensure we have a creator if needed,
    # though create_without_ssn endpoint sets it to request.user.id
    youth_application = AcceptableNonVtjYouthApplicationFactory.build()

    data = NonVtjYouthApplicationSerializer(youth_application).data
    data["target_group"] = invalid_target_group

    # ensure school is set correctly as it's often required for non-vtj
    data["school"] = "Testikoulu"
    data["is_unlisted_school"] = True

    # Remove fields with None values to avoid encoding errors in multipart POST data
    data = {k: v for k, v in data.items() if v is not None}

    response = staff_client.post(get_create_without_ssn_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_group" in response.data
    assert response.data["target_group"][0].code == "invalid_choice"


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_DISABLE_VTJ=True)
def test_youth_application_creation_valid_target_group(api_client):
    """
    Test that creating a youth application with a valid target group succeeds.
    This ensures that our test setup is correct and valid choices work.
    """
    youth_application = InactiveNoNeedAdditionalInfoYouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    # target_group is already valid from factory

    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED
