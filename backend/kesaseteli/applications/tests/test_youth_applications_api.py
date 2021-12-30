import factory.random
import pytest
from django.test import override_settings
from rest_framework import status
from rest_framework.reverse import reverse

from applications.api.v1.serializers import YouthApplicationSerializer
from common.tests.factories import YouthApplicationFactory


def get_required_fields():
    return [
        "first_name",
        "last_name",
        "social_security_number",
        "school",
        "is_unlisted_school",
        "phone_number",
    ]


def get_list_url():
    return reverse("v1:youthapplication-list")


def get_activation_url(pk):
    return reverse("v1:youthapplication-activate", kwargs={"pk": pk})


@pytest.mark.django_db
def test_youth_applications_list(api_client):
    response = api_client.get(get_list_url())

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_youth_applications_activate_invalid_pk(api_client):
    response = api_client.get(get_activation_url(pk="invalid value"))
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_youth_applications_activate_unexpired_inactive(
    api_client,
    inactive_youth_application,
    make_youth_application_activation_link_unexpired,
):
    assert not inactive_youth_application.is_active
    assert not inactive_youth_application.has_activation_link_expired

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == status.HTTP_200_OK
    inactive_youth_application.refresh_from_db()
    assert inactive_youth_application.is_active


@pytest.mark.django_db
def test_youth_applications_activate_unexpired_active(
    api_client,
    active_youth_application,
    make_youth_application_activation_link_unexpired,
):
    assert active_youth_application.is_active
    assert not active_youth_application.has_activation_link_expired

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_200_OK
    active_youth_application.refresh_from_db()
    assert active_youth_application.is_active


@pytest.mark.django_db
def test_youth_applications_activate_expired_inactive(
    api_client,
    inactive_youth_application,
    make_youth_application_activation_link_expired,
):
    assert not inactive_youth_application.is_active
    assert inactive_youth_application.has_activation_link_expired

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    inactive_youth_application.refresh_from_db()
    assert not inactive_youth_application.is_active


@pytest.mark.django_db
def test_youth_applications_activate_expired_active(
    api_client,
    active_youth_application,
    make_youth_application_activation_link_expired,
):
    assert active_youth_application.is_active
    assert active_youth_application.has_activation_link_expired

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_200_OK
    active_youth_application.refresh_from_db()
    assert active_youth_application.is_active


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        "010203-1230",
        "121212A899H",
        "111111-111C",
        "111111A111C",
        # Django Rest Framework's serializers.CharField trims leading and trailing
        # whitespace by default, so we allow them here.
        "     111111-111C",
        "111111-111C     ",
        "   111111-111C  ",
    ],
)
def test_youth_application_post_valid_social_security_number(
    api_client, youth_application, test_value
):
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED
    assert "social_security_number" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("random_seed", list(range(10)))
def test_youth_application_post_valid_random_data(api_client, random_seed):
    factory.random.reseed_random(random_seed)
    youth_application = YouthApplicationFactory()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
@override_settings(
    EMAIL_USE_TLS=False,
    EMAIL_HOST="ema.platta-net.hel.fi",
    EMAIL_HOST_USER="",
    EMAIL_HOST_PASSWORD="",
    EMAIL_PORT=25,
    EMAIL_TIMEOUT=15,
    DEFAULT_FROM_EMAIL="Kesäseteli <kesaseteli@hel.fi>",
)
@pytest.mark.parametrize(
    "email_backend_override",
    [
        None,  # No override
        "django.core.mail.backends.console.EmailBackend",
        "django.core.mail.backends.smtp.EmailBackend",
    ],
)
def test_youth_application_post_valid_data_with_email_backends(
    api_client,
    youth_application,
    settings,
    email_backend_override,
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application.email = "test@example.com"
    if email_backend_override is not None:
        settings.EMAIL_BACKEND = email_backend_override
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_youth_application_post_invalid_language(api_client, youth_application):
    data = YouthApplicationSerializer(youth_application).data
    data["language"] = "asd"
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "language" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("missing_field", get_required_fields())
def test_youth_application_post_missing_required_field(
    api_client,
    youth_application,
    missing_field,
):
    data = YouthApplicationSerializer(youth_application).data
    del data[missing_field]
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,value",
    [(field, value) for field in get_required_fields() for value in [None, "", " "]],
)
def test_youth_application_post_empty_required_field(
    api_client,
    youth_application,
    field,
    value,
):
    data = YouthApplicationSerializer(youth_application).data
    data[field] = value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        # A temporary social security number (900-999)
        "111111-900U",
        "111111-9991",
        # Inner whitespace
        "111111 -111C",
        "111111-111 C",
        " 111111 - 111C ",
        # Not uppercase
        "111111-111c",
        "111111a111C",
        # Invalid checksum
        "111111-111X",  # "111111-111C" would be valid
        "111111A111W",  # "111111A111C" would be valid
        "010203-123A",  # "010203-1230" would be valid
        "121212A899F",  # "121212A899H" would be valid
        # Combination
        "111111 -111x",  # Invalid checksum, inner whitespace, not uppercase
    ],
)
def test_youth_application_post_invalid_social_security_number(
    api_client, youth_application, test_value
):
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "social_security_number" in response.data
