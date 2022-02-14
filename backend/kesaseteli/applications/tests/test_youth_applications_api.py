import json
import uuid
from datetime import timedelta
from typing import List, Optional
from urllib.parse import urlparse

import factory.random
import langdetect
import pytest
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from shared.common.tests.conftest import staff_client, superuser_client
from shared.common.tests.test_validators import get_invalid_postcode_values

from applications.api.v1.serializers import YouthApplicationSerializer
from applications.enums import get_supported_languages, YouthApplicationRejectedReason
from applications.models import YouthApplication
from common.tests.conftest import api_client
from common.tests.factories import (
    ActiveYouthApplicationFactory,
    InactiveYouthApplicationFactory,
    YouthApplicationFactory,
)


def get_random_pk() -> uuid.UUID:
    return uuid.uuid4()


def get_required_fields() -> List[str]:
    return [
        "first_name",
        "last_name",
        "social_security_number",
        "school",
        "is_unlisted_school",
        "email",
        "phone_number",
        "postcode",
    ]


def get_handler_fields() -> List[str]:
    return get_required_fields() + [
        "language",
        "receipt_confirmed_at",
        "encrypted_vtj_json",
    ]


def get_list_url():
    return reverse("v1:youthapplication-list")


def get_activation_url(pk):
    return reverse("v1:youthapplication-activate", kwargs={"pk": pk})


def get_detail_url(pk):
    return reverse("v1:youthapplication-detail", kwargs={"pk": pk})


def get_processing_url(pk):
    return reverse("v1:youthapplication-process", kwargs={"pk": pk})


def get_test_vtj_json() -> dict:
    return {"first_name": "Maija", "last_name": "Meikäläinen"}


def assert_email_subject_language(email_subject, expected_language):
    detected_language = langdetect.detect(email_subject)
    assert (
        detected_language == expected_language
    ), "Email subject '{}' used language {} instead of expected {}".format(
        email_subject, detected_language, expected_language
    )


def assert_email_body_language(email_body, expected_language):
    detected_language = langdetect.detect(email_body)
    assert (
        detected_language == expected_language
    ), "Email body '{}' used language {} instead of expected {}".format(
        email_body, detected_language, expected_language
    )


@pytest.mark.django_db
def test_youth_applications_list(api_client):
    response = api_client.get(get_list_url())

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_name,expected_status_code",
    [
        (
            mock_flag,
            client_fixture_function.__name__,
            status.HTTP_501_NOT_IMPLEMENTED if mock_flag else status.HTTP_403_FORBIDDEN,
        )
        for mock_flag in [False, True]
        for client_fixture_function in [api_client, staff_client, superuser_client]
    ],
)
def test_youth_applications_process_valid_pk(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_name,
    expected_status_code,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_name)
    response = client_fixture.get(get_processing_url(pk=youth_application.pk))
    assert response.status_code == expected_status_code


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,expected_status_code",
    [
        (False, status.HTTP_403_FORBIDDEN),
        (True, status.HTTP_404_NOT_FOUND),
    ],
)
def test_youth_applications_process_unused_pk(
    api_client, settings, mock_flag, expected_status_code
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    response = api_client.get(get_processing_url(pk=get_random_pk()))
    assert response.status_code == expected_status_code


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,client_fixture_name,expected_status_code",
    [
        (
            mock_flag,
            client_fixture_function.__name__,
            status.HTTP_200_OK if mock_flag else status.HTTP_403_FORBIDDEN,
        )
        for mock_flag in [False, True]
        for client_fixture_function in [api_client, staff_client, superuser_client]
    ],
)
def test_youth_applications_detail_valid_pk(
    request,
    youth_application,
    settings,
    mock_flag,
    client_fixture_name,
    expected_status_code,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    client_fixture = request.getfixturevalue(client_fixture_name)
    response = client_fixture.get(get_detail_url(pk=youth_application.pk))
    assert response.status_code == expected_status_code


@pytest.mark.django_db
@pytest.mark.parametrize(
    "mock_flag,expected_status_code",
    [
        (False, status.HTTP_403_FORBIDDEN),
        (True, status.HTTP_404_NOT_FOUND),
    ],
)
def test_youth_applications_detail_unused_pk(
    api_client, settings, mock_flag, expected_status_code
):
    settings.NEXT_PUBLIC_MOCK_FLAG = mock_flag
    response = api_client.get(get_detail_url(pk=get_random_pk()))
    assert response.status_code == expected_status_code


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize("field", get_handler_fields())
def test_youth_applications_detail_response_field(api_client, youth_application, field):
    response = api_client.get(get_detail_url(pk=youth_application.pk))
    assert field in response.data


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
@pytest.mark.parametrize(
    "input_encrypted_vtj_json,expected_output_encrypted_vtj_json",
    [
        (None, {}),
        ("", {}),
        (json.dumps(get_test_vtj_json()), get_test_vtj_json()),
    ],
)
def test_youth_applications_detail_encrypted_vtj_json(
    api_client,
    input_encrypted_vtj_json,
    expected_output_encrypted_vtj_json,
):
    app = YouthApplicationFactory.create(encrypted_vtj_json=input_encrypted_vtj_json)
    response = api_client.get(get_detail_url(pk=app.pk))
    output_encrypted_vtj_json = response.data["encrypted_vtj_json"]
    assert output_encrypted_vtj_json == expected_output_encrypted_vtj_json


@pytest.mark.django_db
def test_youth_applications_activate_unused_pk(api_client):
    response = api_client.get(get_activation_url(pk=get_random_pk()))
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_applications_activate_unexpired_inactive(
    api_client,
    make_youth_application_activation_link_unexpired,
    language,
):
    inactive_youth_application = InactiveYouthApplicationFactory(language=language)

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
    active_youth_application = ActiveYouthApplicationFactory(language=language)

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
    inactive_youth_application = InactiveYouthApplicationFactory(language=language)

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
    active_youth_application = ActiveYouthApplicationFactory(language=language)

    assert active_youth_application.is_active
    assert active_youth_application.has_activation_link_expired
    assert active_youth_application.language == language

    response = api_client.get(get_activation_url(active_youth_application.pk))

    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == active_youth_application.already_activated_page_url()

    active_youth_application.refresh_from_db()
    assert active_youth_application.is_active


@pytest.mark.django_db
def test_youth_applications_dual_activate_unexpired_inactive(
    api_client,
    make_youth_application_activation_link_unexpired,
):
    app_1 = InactiveYouthApplicationFactory()
    app_2 = InactiveYouthApplicationFactory(
        social_security_number=app_1.social_security_number
    )

    # Make sure the source objects are set up correctly
    assert not app_1.is_active
    assert not app_1.has_activation_link_expired
    assert not app_2.is_active
    assert not app_2.has_activation_link_expired
    assert app_1.social_security_number == app_2.social_security_number
    assert app_1.email != app_2.email

    response_1 = api_client.get(get_activation_url(app_1.pk))
    response_2 = api_client.get(get_activation_url(app_2.pk))

    app_1.refresh_from_db()
    app_2.refresh_from_db()

    assert app_1.is_active
    assert response_1.status_code == status.HTTP_302_FOUND
    assert response_1.url == app_1.activated_page_url()

    assert not app_2.is_active
    assert response_2.status_code == status.HTTP_302_FOUND
    assert response_2.url == app_2.already_activated_page_url()


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
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
)
@pytest.mark.parametrize(
    "email_backend_override",
    [
        None,  # No override
        "django.core.mail.backends.console.EmailBackend",
    ],
)
def test_youth_application_post_valid_data_with_email_backends(
    api_client,
    settings,
    email_backend_override,
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application = YouthApplicationFactory.build(email="test@example.com")
    if email_backend_override is not None:
        settings.EMAIL_BACKEND = email_backend_override
    data = YouthApplicationSerializer(youth_application).data
    start_app_count = YouthApplication.objects.count()
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    end_app_count = YouthApplication.objects.count()
    assert response.status_code == status.HTTP_201_CREATED
    assert end_app_count == start_app_count + 1


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    EMAIL_HOST="",  # Use inexistent email host to ensure emails will never go anywhere
)
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_post_valid_data_with_invalid_smtp_server(
    api_client,
    settings,
    language,
):
    # Use an email address which uses a reserved domain name (See RFC 2606)
    # so even if it'd be sent to an SMTP server it wouldn't go anywhere
    youth_application = YouthApplicationFactory.build(
        email="test@example.com", language=language
    )
    data = YouthApplicationSerializer(youth_application).data
    start_app_count = YouthApplication.objects.count()
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    end_app_count = YouthApplication.objects.count()
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert end_app_count == start_app_count


@pytest.mark.django_db
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_post_valid_language(
    api_client,
    language,
):
    youth_application = YouthApplicationFactory.build(language=language)
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
@pytest.mark.parametrize("language", get_supported_languages())
def test_youth_application_activation_email_language(api_client, language):
    youth_application = YouthApplicationFactory.build(language=language)
    data = YouthApplicationSerializer(youth_application).data
    api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert_email_subject_language(activation_email.subject, language)
    assert_email_body_language(activation_email.body, language)


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_youth_application_activation_email_link_path(api_client):
    youth_application = YouthApplicationFactory.build()
    data = YouthApplicationSerializer(youth_application).data
    response = api_client.post(reverse("v1:youthapplication-list"), data)
    assert len(mail.outbox) > 0
    activation_email = mail.outbox[-1]
    assert "id" in response.data
    assert response.data["id"]
    assert YouthApplication.objects.filter(pk=response.data["id"]).exists()
    # Check that the activation URL path
    # i.e. without the hostname and port is found in the email body
    activation_url = get_activation_url(pk=response.data["id"])
    activation_url_with_path_only = urlparse(activation_url).path
    assert activation_url_with_path_only in activation_email.body


@pytest.mark.django_db
@override_settings(
    DISABLE_VTJ=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_youth_application_processing_email_sending_without_vtj(
    api_client,
    inactive_youth_application,
    make_youth_application_activation_link_unexpired,
):
    start_mail_count = len(mail.outbox)
    api_client.get(get_activation_url(inactive_youth_application.pk))
    assert len(mail.outbox) == start_mail_count + 1


@pytest.mark.django_db
@override_settings(
    DISABLE_VTJ=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
@pytest.mark.parametrize(
    "youth_application_language,expected_email_language",
    [(language, "fi") for language in get_supported_languages()],
)
def test_youth_application_processing_email_language(
    api_client,
    make_youth_application_activation_link_unexpired,
    youth_application_language,
    expected_email_language,
):
    inactive_youth_application = InactiveYouthApplicationFactory(
        language=youth_application_language
    )
    api_client.get(get_activation_url(inactive_youth_application.pk))
    assert len(mail.outbox) > 0
    processing_email = mail.outbox[-1]
    assert_email_subject_language(processing_email.subject, expected_email_language)
    assert_email_body_language(processing_email.body, expected_email_language)


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
