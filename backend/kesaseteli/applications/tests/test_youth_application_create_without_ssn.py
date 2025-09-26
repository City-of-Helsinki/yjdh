from datetime import date
from typing import List
from unittest import mock

import pytest
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status

from applications.enums import (
    AdditionalInfoUserReason,
    YouthApplicationStatus,
    get_supported_languages,
)
from applications.models import YouthApplication
from applications.tests.data.mock_vtj import mock_vtj_person_id_query_not_found_content
from common.urls import (
    get_create_without_ssn_url,
    get_django_adfs_login_url,
    get_processing_url,
    handler_403_url,
)
from shared.common.tests.factories import HandlerUserFactory
from shared.common.tests.utils import utc_datetime

FROZEN_TEST_TIME = utc_datetime(2023, 12, 31, 23, 59, 59)
NON_TEST_TIME = utc_datetime(2022, 1, 1)

VALID_TEST_DATA = {
    "first_name": "Testi",
    "last_name": "Testaaja",
    "email": "test@example.org",
    "school": "Testikoulu",
    "phone_number": "+358-50-1234567",
    "postcode": "00123",
    "language": "sv",
    "non_vtj_birthdate": "2012-12-31",
    "non_vtj_home_municipality": "Kirkkonummi",
    "additional_info_description": "Testilisätiedot",
}

EXPECTED_PROCESSING_EMAIL_BODY_TEMPLATE = """
Seuraava henkilö on pyytänyt Kesäseteliä:

Testi Testaaja
Postinumero: 00123
Koulu: Testikoulu
Puhelinnumero: +358-50-1234567
Sähköposti: test@example.org

{processing_url}
""".strip()

REQUIRED_FIELDS = [
    "first_name",
    "last_name",
    "email",
    "school",
    "phone_number",
    "postcode",
    "language",
    "non_vtj_birthdate",
    "additional_info_description",
]

OPTIONAL_FIELDS = [
    "non_vtj_home_municipality",
]


@pytest.fixture(autouse=True)
def mock_flag_disabled_in_this_file(settings):
    settings.NEXT_PUBLIC_MOCK_FLAG = False


def test_input_data_partitioning():
    assert len(REQUIRED_FIELDS) == len(set(REQUIRED_FIELDS))
    assert len(OPTIONAL_FIELDS) == len(set(OPTIONAL_FIELDS))
    assert set(REQUIRED_FIELDS).isdisjoint(set(OPTIONAL_FIELDS))
    assert sorted(VALID_TEST_DATA.keys()) == sorted(REQUIRED_FIELDS + OPTIONAL_FIELDS)


@pytest.mark.django_db
def test_valid_post_returns_only_created_youth_application_id(staff_client):
    assert YouthApplication.objects.count() == 0

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=VALID_TEST_DATA,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert YouthApplication.objects.count() == 1
    created_app = YouthApplication.objects.first()

    assert response.json() == {"id": str(created_app.id)}


@pytest.mark.django_db
@freeze_time(FROZEN_TEST_TIME)
def test_valid_post(staff_client):
    response = staff_client.post(
        get_create_without_ssn_url(),
        data=VALID_TEST_DATA,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED

    app = YouthApplication.objects.get(id=response.json()["id"])

    assert app.first_name == "Testi"
    assert app.last_name == "Testaaja"
    assert app.email == "test@example.org"
    assert app.is_unlisted_school is True
    assert app.school == "Testikoulu"
    assert app.phone_number == "+358-50-1234567"
    assert app.postcode == "00123"
    assert app.language == "sv"
    assert app.non_vtj_birthdate == date(2012, 12, 31)
    assert app.non_vtj_home_municipality == "Kirkkonummi"
    assert app.additional_info_description == "Testilisätiedot"

    # Check the fields that should remain the same regardless of input data
    assert app.social_security_number == ""
    assert app.encrypted_original_vtj_json is None
    assert app.encrypted_handler_vtj_json is None
    assert app.status == YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value
    assert app.additional_info_user_reasons == ["other"]
    assert not app.handler
    assert not app.has_youth_summer_voucher

    # Make sure creator was set to request's non-anonymous user
    assert response.wsgi_request.user is not None
    assert app.creator == response.wsgi_request.user
    assert app.creator.id is not None
    assert app.creator.is_anonymous is False

    # Make sure timestamps are set correctly
    assert app.created_at == timezone.now()
    assert app.modified_at == timezone.now()
    assert app.receipt_confirmed_at == timezone.now()
    assert app.additional_info_provided_at == timezone.now()
    assert app.handled_at is None


@pytest.mark.django_db
@freeze_time(FROZEN_TEST_TIME)
def test_valid_post_with_extra_fields(staff_client):
    creator_given_as_input_data = HandlerUserFactory()
    handler_given_as_input_data = HandlerUserFactory()

    response = staff_client.post(
        get_create_without_ssn_url(),
        data={
            "first_name": "Maija",
            "last_name": "Meikäläinen",
            "email": "maija@meikalainen.org",
            "school": "Maijan testikoulu",
            "phone_number": "+358-40-7654321",
            "postcode": "12345",
            "language": "fi",
            "non_vtj_birthdate": "2022-02-28",
            "non_vtj_home_municipality": "Vantaa",
            "additional_info_description": "Lisätietoja käsittelijöille",
            # Extra fields
            "social_security_number": "111111-111C",
            "encrypted_original_vtj_json": mock_vtj_person_id_query_not_found_content(),
            "encrypted_handler_vtj_json": mock_vtj_person_id_query_not_found_content(),
            "is_unlisted_school": False,
            "status": YouthApplicationStatus.ACCEPTED.value,
            "handler": handler_given_as_input_data.pk,
            "creator": creator_given_as_input_data.pk,
            "created_at": NON_TEST_TIME,
            "modified_at": NON_TEST_TIME,
            "receipt_confirmed_at": NON_TEST_TIME,
            "handled_at": NON_TEST_TIME,
            "additional_info_provided_at": NON_TEST_TIME,
            "additional_info_user_reasons": [AdditionalInfoUserReason.UNLISTED_SCHOOL],
            "inexistent_field": "This field should not exist",
        },
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    app = YouthApplication.objects.get(id=response.json()["id"])

    assert app.first_name == "Maija"
    assert app.last_name == "Meikäläinen"
    assert app.email == "maija@meikalainen.org"
    assert app.is_unlisted_school is True
    assert app.school == "Maijan testikoulu"
    assert app.phone_number == "+358-40-7654321"
    assert app.postcode == "12345"
    assert app.language == "fi"
    assert app.non_vtj_birthdate == date(2022, 2, 28)
    assert app.non_vtj_home_municipality == "Vantaa"
    assert app.additional_info_description == "Lisätietoja käsittelijöille"

    # Check the fields that should remain the same regardless of input data
    assert app.social_security_number == ""
    assert app.encrypted_original_vtj_json is None
    assert app.encrypted_handler_vtj_json is None
    assert app.status == YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value
    assert app.additional_info_user_reasons == ["other"]
    assert not app.handler
    assert not app.has_youth_summer_voucher

    # Make sure creator was set to request's non-anonymous user
    assert response.wsgi_request.user is not None
    assert app.creator == response.wsgi_request.user
    assert app.creator != creator_given_as_input_data
    assert app.creator.id is not None
    assert app.creator.is_anonymous is False

    # Make sure timestamps are set correctly
    assert app.created_at == timezone.now()
    assert app.modified_at == timezone.now()
    assert app.receipt_confirmed_at == timezone.now()
    assert app.additional_info_provided_at == timezone.now()
    assert app.handled_at is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "now",
    [
        utc_datetime(2022, 1, 1),
        utc_datetime(2023, 12, 31, 23, 59, 59),
        utc_datetime(2024, 2, 3, 4, 5, 6),
    ],
)
def test_valid_post_timestamps(staff_client, now):
    with freeze_time(now):
        response = staff_client.post(
            get_create_without_ssn_url(),
            data=VALID_TEST_DATA,
            content_type="application/json",
        )

    assert response.status_code == status.HTTP_201_CREATED
    app = YouthApplication.objects.get(id=response.json()["id"])

    assert app.created_at == now
    assert app.modified_at == now
    assert app.receipt_confirmed_at == now
    assert app.additional_info_provided_at == now
    assert app.handled_at is None


@pytest.mark.django_db
@pytest.mark.parametrize("field_to_remove", OPTIONAL_FIELDS)
def test_valid_post_with_optional_field_missing_uses_field_default(
    staff_client, field_to_remove
):
    data = VALID_TEST_DATA.copy()
    del data[field_to_remove]

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    app = YouthApplication.objects.get(id=response.json()["id"])
    assert (
        getattr(app, field_to_remove)
        == YouthApplication._meta.get_field(field_to_remove).get_default()
    )


@pytest.mark.django_db
@pytest.mark.parametrize("field_to_empty", OPTIONAL_FIELDS)
@pytest.mark.parametrize("empty_value", [None, "", "  "])
def test_valid_post_with_optional_field_empty_uses_field_default(
    staff_client, field_to_empty, empty_value
):
    data = VALID_TEST_DATA.copy()
    data[field_to_empty] = empty_value

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    app = YouthApplication.objects.get(id=response.json()["id"])
    assert (
        getattr(app, field_to_empty)
        == YouthApplication._meta.get_field(field_to_empty).get_default()
    )


@pytest.mark.django_db
@pytest.mark.parametrize("field_to_remove", REQUIRED_FIELDS)
def test_post_with_required_field_missing_returns_bad_request(
    staff_client, field_to_remove
):
    data = VALID_TEST_DATA.copy()
    del data[field_to_remove]

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
@pytest.mark.parametrize("field_to_empty", REQUIRED_FIELDS)
@pytest.mark.parametrize("empty_value", [None, "", " \t\n"])
def test_post_with_required_field_empty_returns_bad_request(
    staff_client, field_to_empty, empty_value
):
    data = VALID_TEST_DATA.copy()
    data[field_to_empty] = empty_value

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
def test_valid_post_as_anonymous_redirects_to_adfs_login(client):
    response = client.post(
        get_create_without_ssn_url(),
        data=VALID_TEST_DATA,
        content_type="application/json",
    )

    assert response.wsgi_request.user.is_anonymous
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == get_django_adfs_login_url(
        redirect_url=get_create_without_ssn_url()
    )
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
def test_valid_post_as_non_handler_user_redirects_to_forbidden_page(user_client):
    response = user_client.post(
        get_create_without_ssn_url(),
        data=VALID_TEST_DATA,
        content_type="application/json",
    )

    user = response.wsgi_request.user
    assert user.is_active
    assert not user.is_anonymous
    assert not user.is_staff
    assert not user.is_superuser
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == handler_403_url()
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
@pytest.mark.parametrize("youth_application_language", get_supported_languages())
def test_valid_post_sends_finnish_plaintext_only_processing_email(
    staff_client, youth_application_language
):
    assert len(mail.outbox) == 0
    data = VALID_TEST_DATA.copy()
    data["language"] = youth_application_language
    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_201_CREATED

    assert len(mail.outbox) == 1
    processing_email = mail.outbox[-1]
    assert processing_email.subject == "Nuoren kesäsetelihakemus: Testi Testaaja"
    assert processing_email.from_email == "Test sender <testsender@hel.fi>"
    assert processing_email.to == ["Test handler <testhandler@hel.fi>"]
    assert processing_email.body == EXPECTED_PROCESSING_EMAIL_BODY_TEMPLATE.format(
        processing_url=response.wsgi_request.build_absolute_uri(
            get_processing_url(pk=response.json()["id"])
        )
    )
    assert processing_email.alternatives == []  # No HTML version
    assert processing_email.attachments == []


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
def test_valid_post_rolls_back_transaction_if_email_sending_fails(staff_client):
    with mock.patch.object(
        YouthApplication, "send_processing_email_to_handler", return_value=False
    ) as send_mail_mock:
        response = staff_client.post(
            get_create_without_ssn_url(),
            data=VALID_TEST_DATA,
            content_type="application/json",
        )
        send_mail_mock.assert_called_once()

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,invalid_value,expected_error_codes",
    [
        # First name:
        ("first_name", "", ["blank"]),
        ("first_name", " ", ["blank"]),
        ("first_name", "\n", ["blank"]),
        # Last name:
        ("last_name", "", ["blank"]),
        ("last_name", " ", ["blank"]),
        ("last_name", "\n", ["blank"]),
        # Language:
        ("language", "-", ["invalid_choice"]),
        ("language", "", ["invalid_choice"]),
        ("language", " ", ["invalid_choice"]),
        ("language", "\n", ["invalid_choice"]),
        ("language", "empty", ["invalid_choice"]),
        ("language", "pl", ["invalid_choice"]),
        ("language", "asdf", ["invalid_choice"]),
        # Non-VTJ birthdate:
        ("non_vtj_birthdate", "-", ["invalid"]),
        ("non_vtj_birthdate", " ", ["invalid"]),
        ("non_vtj_birthdate", "\n", ["invalid"]),
        ("non_vtj_birthdate", "empty", ["invalid"]),
        ("non_vtj_birthdate", "2022-02-32", ["invalid"]),
        ("non_vtj_birthdate", "2022-02-25T13:34:26Z", ["invalid"]),
        ("non_vtj_birthdate", "Jan 2 2012", ["invalid"]),
        ("non_vtj_birthdate", "1.3.2023", ["invalid"]),
        # Postcode:
        ("postcode", "-", ["invalid"]),
        ("postcode", "", ["blank"]),
        ("postcode", " ", ["blank"]),
        ("postcode", "\n", ["blank"]),
        ("postcode", "empty", ["invalid"]),
        ("postcode", "1234", ["invalid"]),
        ("postcode", "123456", ["invalid", "max_length"]),
        ("postcode", "1234a", ["invalid"]),
        # Phone number:
        ("phone_number", "-", ["invalid"]),
        ("phone_number", "", ["blank"]),
        ("phone_number", " ", ["blank"]),
        ("phone_number", "\n", ["blank"]),
        ("phone_number", "123", ["invalid"]),
        ("phone_number", "+400-123456789", ["invalid"]),
        # School
        ("school", "", ["blank"]),
        ("school", " ", ["blank"]),
        ("school", "\n", ["blank"]),
        # Email
        ("email", "", ["blank"]),
        ("email", " ", ["blank"]),
        ("email", "\n", ["blank"]),
        ("email", "test_email_without_at_sign", ["invalid"]),
        ("email", "@", ["invalid"]),
        ("email", "example.org", ["invalid"]),
        ("email", "https://example.org/", ["invalid"]),
    ],
)
def test_post_field_validation_failure(
    staff_client, field, invalid_value, expected_error_codes: List[str]
):
    data = VALID_TEST_DATA.copy()
    data[field] = invalid_value

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert list(response.data.keys()) == [field]
    assert sorted(error.code for error in response.data[field]) == sorted(
        expected_error_codes
    )
    assert not YouthApplication.objects.exists()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,text_length",
    [
        ("first_name", 128),
        ("last_name", 128),
        ("non_vtj_home_municipality", 64),
        ("postcode", 5),
        ("phone_number", 64),
        ("school", 256),
        ("email", 254),
        ("additional_info_description", 4096),
    ],
)
def test_post_field_max_length_validation_succeeds(staff_client, field, text_length):
    data = VALID_TEST_DATA.copy()
    data[field] = "x" * text_length

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code in [
        status.HTTP_201_CREATED,
        status.HTTP_400_BAD_REQUEST,
    ]

    # Some other validation error happened related to the field but not max_length
    if response.status_code == status.HTTP_400_BAD_REQUEST:
        assert list(response.data.keys()) == [field]
        assert "max_length" not in [error.code for error in response.data[field]]
        assert not YouthApplication.objects.exists()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field,text_length",
    [
        ("first_name", 129),
        ("last_name", 129),
        ("non_vtj_home_municipality", 65),
        ("postcode", 6),
        ("phone_number", 65),
        ("school", 257),
        ("email", 255),
        ("additional_info_description", 4097),
    ],
)
def test_post_field_max_length_validation_fails(staff_client, field, text_length):
    data = VALID_TEST_DATA.copy()
    data[field] = "x" * text_length

    response = staff_client.post(
        get_create_without_ssn_url(),
        data=data,
        content_type="application/json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert list(response.data.keys()) == [field]
    assert "max_length" in [error.code for error in response.data[field]]
    assert not YouthApplication.objects.exists()
