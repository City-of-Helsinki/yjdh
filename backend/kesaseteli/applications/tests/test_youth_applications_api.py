from datetime import timedelta
from typing import Optional

import factory.random
import langdetect
import pytest
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from shared.common.tests.test_validators import get_invalid_postcode_values

from applications.api.v1.serializers import YouthApplicationSerializer
from applications.enums import get_supported_languages, YouthApplicationRejectedReason
from applications.models import YouthApplication
from common.tests.factories import (
    ActiveYouthApplicationFactory,
    InactiveYouthApplicationFactory,
    YouthApplicationFactory,
)


def get_required_fields():
    return [
        "first_name",
        "last_name",
        "social_security_number",
        "school",
        "is_unlisted_school",
        "phone_number",
        "postcode",
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
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_activate_unexpired_inactive(
    api_client,
    make_youth_application_activation_link_unexpired,
    language,
):
    inactive_youth_application = InactiveYouthApplicationFactory.build()
    inactive_youth_application.language = language
    inactive_youth_application.save()

    assert not inactive_youth_application.is_active
    assert not inactive_youth_application.has_activation_link_expired
    assert inactive_youth_application.language == language

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == inactive_youth_application.activated_page_url()

    inactive_youth_application.refresh_from_db()
    assert inactive_youth_application.is_active


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_activate_unexpired_active(
    api_client,
    make_youth_application_activation_link_unexpired,
    language,
):
    active_youth_application = ActiveYouthApplicationFactory.build()
    active_youth_application.language = language
    active_youth_application.save()

    assert active_youth_application.is_active
    assert not active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == active_youth_application.already_activated_page_url()

    active_youth_application.refresh_from_db()
    assert active_youth_application.is_active


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_activate_expired_inactive(
    api_client,
    make_youth_application_activation_link_expired,
    language,
):
    inactive_youth_application = InactiveYouthApplicationFactory.build()
    inactive_youth_application.language = language
    inactive_youth_application.save()

    assert not inactive_youth_application.is_active
    assert inactive_youth_application.has_activation_link_expired
    assert inactive_youth_application.language == language

    response = api_client.get(get_activation_url(inactive_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == inactive_youth_application.expired_page_url()

    inactive_youth_application.refresh_from_db()
    assert not inactive_youth_application.is_active


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_activate_expired_active(
    api_client,
    make_youth_application_activation_link_expired,
    language,
):
    active_youth_application = ActiveYouthApplicationFactory.build()
    active_youth_application.language = language
    active_youth_application.save()

    assert active_youth_application.is_active
    assert active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == active_youth_application.already_activated_page_url()

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
def test_youth_application_post_valid_social_security_number(api_client, test_value):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_201_CREATED
    assert "social_security_number" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("random_seed", list(range(10)))
def test_youth_application_post_valid_random_data(api_client, random_seed):
    factory.random.reseed_random(random_seed)
    youth_application = YouthApplicationFactory.build()
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
    settings,
    email_backend_override,
):
    youth_application = YouthApplicationFactory.build()
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application.email = "test@example.com"
    if email_backend_override is not None:
        settings.EMAIL_BACKEND = email_backend_override
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_post_valid_language(
    api_client,
    language,
):
    youth_application = YouthApplicationFactory.build()
    youth_application.language = language
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
@override_settings(
    MOCK_FLAG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_activation_email_language(
    api_client,
    language,
):
    youth_application = YouthApplicationFactory.build()
    youth_application.language = language
    data = YouthApplicationSerializer(youth_application).data
    api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert len(activation_email.subject.strip()) > 0
    assert len(activation_email.body.strip()) > 0
    detected_email_subject_language = langdetect.detect(activation_email.subject)
    detected_email_body_language = langdetect.detect(activation_email.body)
    assert (
        detected_email_subject_language == language
    ), "Email subject '{}' used language {} instead of expected {}".format(
        activation_email.subject,
        detected_email_subject_language,
        language,
    )
    assert (
        detected_email_body_language == language
    ), "Email body '{}' used language {} instead of expected {}".format(
        activation_email.body,
        detected_email_body_language,
        language,
    )


@pytest.mark.django_db
def test_youth_application_post_invalid_language(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["language"] = "asd"
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "language" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("postcode", get_invalid_postcode_values())
def test_youth_application_post_invalid_postcode(api_client, postcode):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["postcode"] = "postcode"
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "postcode" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize("missing_field", get_required_fields())
def test_youth_application_post_missing_required_field(
    api_client,
    missing_field,
):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    del data[missing_field]
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert missing_field in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,value",
    [(field, value) for field in get_required_fields() for value in [None, "", " "]],
)
def test_youth_application_post_empty_required_field(
    api_client,
    field,
    value,
):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data[field] = value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert field in response.data


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
def test_youth_application_post_invalid_social_security_number(api_client, test_value):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(get_list_url(), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "social_security_number" in response.data


def get_expected_reason(
    same_email,
    same_social_security_number,
    is_existing_active,
    is_existing_expired,
) -> Optional[YouthApplicationRejectedReason]:
    if (same_email or same_social_security_number) and is_existing_active:
        return YouthApplicationRejectedReason.ALREADY_ASSIGNED
    elif same_email and (is_existing_active or not is_existing_expired):
        return YouthApplicationRejectedReason.EMAIL_IN_USE
    else:
        return None


@freeze_time("2022-02-02")
@override_settings(NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS=60 * 60 * 12)  # 12h
@pytest.mark.django_db
@pytest.mark.parametrize(
    "same_email,"
    "same_social_security_number,"
    "is_existing_active,"
    "is_existing_expired,"
    "expected_reason",
    [
        (
            same_email,
            same_social_security_number,
            is_existing_active,
            is_existing_expired,
            get_expected_reason(
                same_email,
                same_social_security_number,
                is_existing_active,
                is_existing_expired,
            ),
        )
        for same_email in [False, True]
        for same_social_security_number in [False, True]
        for is_existing_active in [False, True]
        for is_existing_expired in [False, True]
    ],
)
def test_youth_application_post_error_codes(
    api_client,
    same_email,
    same_social_security_number,
    is_existing_active,
    is_existing_expired,
    expected_reason,
):
    now = timezone.now()

    # Create the existing youth application
    existing_app = YouthApplicationFactory.create()
    existing_app.receipt_confirmed_at = now if is_existing_active else None
    if is_existing_expired:
        # Make the saved youth application expired
        existing_app.created_at = (
            now - YouthApplication.expiration_duration() - timedelta(hours=1)
        )
    else:
        existing_app.created_at = now
    existing_app.save()
    existing_app.refresh_from_db()

    # Create the new unsaved youth application
    new_app = YouthApplicationFactory.build()
    if same_email:
        new_app.email = existing_app.email
    if same_social_security_number:
        new_app.social_security_number = existing_app.social_security_number

    # Check that the test objects are set up correctly
    assert is_existing_expired == existing_app.has_activation_link_expired
    assert is_existing_active == existing_app.is_active
    assert same_email == (new_app.email == existing_app.email)
    assert same_social_security_number == (
        new_app.social_security_number == existing_app.social_security_number
    )

    data = YouthApplicationSerializer(new_app).data
    response = api_client.post(get_list_url(), data)

    if expected_reason is None:
        assert response.status_code == status.HTTP_201_CREATED
    else:
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.headers.get("Content-Type") == "application/json"
        assert response.json() == expected_reason.json()
