from collections import namedtuple
from datetime import timedelta
from typing import List, Tuple

import pytest
from django.conf import settings as django_settings
from django.db.models import Q
from django.utils import timezone
from freezegun import freeze_time

from applications.models import YouthApplication
from common.tests.factories import YouthApplicationFactory


def get_two_test_emails():
    return ["a@b.com", "test@example.org"]


def get_two_test_social_security_numbers():
    return ["111111A111C", "121212A899H"]


Expiration = namedtuple(
    "Expiration", ["limit_seconds", "test_seconds_list", "expected_expired_list"]
)


def get_test_expirations() -> List[Expiration]:
    return [
        Expiration(0, [0], [True]),
        Expiration(43200, [43199], [False]),
        Expiration(43200, [43200], [True]),
        Expiration(5, [0, 4, 5, 6, 123456789], [False, False, True, True, True]),
        Expiration(
            43200, [0, 43199, 43200, 43201, 1234567], [False, False, True, True, True]
        ),
    ]


def create_app(alive_seconds: int) -> YouthApplication:
    app = YouthApplicationFactory.create()
    app.created_at = timezone.now() - timedelta(seconds=alive_seconds)
    app.save()
    return app


def set_active_state(
    youth_application: YouthApplication, is_active: bool
) -> YouthApplication:
    """
    Set youth application to active if is_active, otherwise set it to inactive.
    """
    youth_application.receipt_confirmed_at = timezone.now() if is_active else None
    youth_application.save()
    return youth_application


def expired_error_message(app: YouthApplication, expected_expired: bool) -> str:
    return (
        "{alive_seconds}s alive ({limit_seconds}s expiration) "
        "should be {expected_state}"
    ).format(
        alive_seconds=app.seconds_elapsed,
        limit_seconds=django_settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS,
        expected_state="expired" if expected_expired else "unexpired",
    )


def unexpired_or_active_error_message(
    app: YouthApplication, is_active: bool, expected_unexpired_or_active: bool
) -> str:
    return (
        "{active_state} and {alive_seconds}s alive ({limit_seconds}s expiration) "
        "should be {expected_state}"
    ).format(
        active_state="Active" if is_active else "Inactive",
        alive_seconds=app.seconds_elapsed,
        limit_seconds=django_settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS,
        expected_state=(
            "unexpired or active"
            if expected_unexpired_or_active
            else "expired and inactive"
        ),
    )


@freeze_time("2022-02-02")
@pytest.mark.django_db
@pytest.mark.parametrize("expiration", get_test_expirations())
def test_youth_application_query_set_unexpired(
    api_client, settings, expiration: Expiration
):
    settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = expiration.limit_seconds
    apps = [create_app(alive_seconds) for alive_seconds in expiration.test_seconds_list]

    unexpired_pks = YouthApplication.objects.unexpired().values_list("pk", flat=True)
    assert len(unexpired_pks) == len(set(unexpired_pks)), "unexpired() gave duplicates"

    for app, expected_expired in zip(apps, expiration.expected_expired_list):
        expired = app.pk not in unexpired_pks
        assert expired == expected_expired, expired_error_message(app, expected_expired)


@freeze_time("2022-02-02")
@pytest.mark.django_db
@pytest.mark.parametrize("expiration", get_test_expirations())
def test_youth_application_query_set_expired(
    api_client, settings, expiration: Expiration
):
    settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = expiration.limit_seconds
    apps = [create_app(alive_seconds) for alive_seconds in expiration.test_seconds_list]

    expired_pks = YouthApplication.objects.expired().values_list("pk", flat=True)
    assert len(expired_pks) == len(set(expired_pks)), "expired() gave duplicates"

    for app, expected_expired in zip(apps, expiration.expected_expired_list):
        expired = app.pk in expired_pks
        assert expired == expected_expired, expired_error_message(app, expected_expired)


@pytest.mark.django_db
def test_youth_application_query_set_active(
    api_client, active_youth_application, inactive_youth_application
):
    active_pks = YouthApplication.objects.active().values_list("pk", flat=True)
    assert len(active_pks) == len(set(active_pks)), "active() gave duplicates"
    assert active_youth_application.pk in active_pks, "active() did not return active"
    assert inactive_youth_application.pk not in active_pks, "active() returned inactive"


@freeze_time("2022-02-02")
@pytest.mark.django_db
@pytest.mark.parametrize(
    "expiration,is_active,expected_unexpired_or_active_list",
    [
        (
            expiration,
            is_active,
            [
                not expected_expired or is_active
                for expected_expired in expiration.expected_expired_list
            ],
        )
        for expiration in get_test_expirations()
        for is_active in [False, True]
    ],
)
def test_youth_application_query_set_unexpired_or_active(
    api_client,
    settings,
    expiration: Expiration,
    is_active: bool,
    expected_unexpired_or_active_list: List[bool],
):
    settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = expiration.limit_seconds
    apps = [
        set_active_state(create_app(alive_seconds), is_active)
        for alive_seconds in expiration.test_seconds_list
    ]

    unexpired_or_active_pks = (
        YouthApplication.objects.unexpired_or_active().values_list("pk", flat=True)
    )

    assert len(unexpired_or_active_pks) == len(
        set(unexpired_or_active_pks)
    ), "unexpired_or_active() gave duplicates"

    for app, expected_unexpired_or_active in zip(
        apps, expected_unexpired_or_active_list
    ):
        unexpired_or_active = app.pk in unexpired_or_active_pks
        assert (
            unexpired_or_active == expected_unexpired_or_active
        ), unexpired_or_active_error_message(
            app, is_active, expected_unexpired_or_active
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "email_ssn_pair_list",
    [
        [
            (email, social_security_number)
            for email in get_two_test_emails()
            for social_security_number in get_two_test_social_security_numbers()
        ]
    ],
)
def test_youth_application_query_set_matches_email_or_social_security_number(
    api_client, email_ssn_pair_list: List[Tuple[str, str]]
):
    # Create source queryset
    apps = [
        YouthApplicationFactory.create(email=email, social_security_number=ssn)
        for email, ssn in email_ssn_pair_list
    ]

    # Check that each email and social security number combination is matched correctly
    for email, ssn in email_ssn_pair_list:
        matched_pks = YouthApplication.objects.matches_email_or_social_security_number(
            email=email, social_security_number=ssn
        ).values_list("pk", flat=True)

        assert len(matched_pks) == len(
            set(matched_pks)
        ), "matches_email_or_social_security_number() gave duplicates"

        for app in apps:
            assert (app.pk in matched_pks) == (
                email == app.email or ssn == app.social_security_number
            )


@pytest.mark.django_db
def test_youth_application_query_set_matches_any_of_empty(api_client):
    YouthApplicationFactory.create_batch(size=5)  # Just create something
    assert len(YouthApplication.objects.matches_any_of()) == 0


@pytest.mark.django_db
def test_youth_application_query_set_matches_any_of(api_client):
    # Create source queryset
    [
        YouthApplicationFactory.create(**overridden_attributes)
        for overridden_attributes in [
            {"first_name": "Peter", "last_name": "Pan", "email": "test@test.org"},
            {"first_name": "Susan", "last_name": "Oliver", "email": "test@test.org"},
            {"first_name": "Olivia", "last_name": "Oxen", "email": "veikko@test.org"},
            {"first_name": "Peter", "last_name": "Nat", "email": "uolevi@test.org"},
        ]
    ]

    matched_pks = YouthApplication.objects.matches_any_of(
        not__first_name__gt="Onni",
        last_name__in=["Oliver", "Oxen"],
        email__gt="test@test.org",
    ).values_list("pk", flat=True)

    expected_matched_pks = YouthApplication.objects.filter(
        ~Q(first_name__gt="Onni")
        | Q(last_name__in=["Oliver", "Oxen"])
        | Q(email__gt="test@test.org")
    ).values_list("pk", flat=True)

    assert sorted(matched_pks) == sorted(expected_matched_pks)
