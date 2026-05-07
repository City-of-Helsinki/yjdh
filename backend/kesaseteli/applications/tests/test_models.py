import itertools
import operator
import os
from email.mime.image import MIMEImage
from typing import List
from unittest import mock

import base32_lib
import pytest
from django.core import mail
from django.test import override_settings
from freezegun import freeze_time

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerSummerVoucher, YouthSummerVoucher
from common.tests.factories import (
    AttachmentFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    YouthSummerVoucherFactory,
)
from shared.common.tests.utils import utc_datetime


def _get_email_template_image_file(image_name: str) -> bytes:
    return open(
        os.path.join(os.path.dirname(__file__), "../templates/images/", image_name),
        "rb",
    ).read()


def create_test_employer_summer_vouchers(year) -> List[EmployerSummerVoucher]:
    """
    Create EmployerSummerVouchers for given year sorted by submitted_at.
    """
    vouchers: List[EmployerSummerVoucher] = []
    for created_at, submitted_at, attachment_count in [
        (utc_datetime(year, 1, 13), utc_datetime(year, 1, 18), 0),
        (utc_datetime(year, 2, 1), utc_datetime(year, 2, 1), 0),
        (utc_datetime(year, 1, 1), utc_datetime(year, 2, 9), 1),
        (utc_datetime(year, 2, 21), utc_datetime(year, 2, 21), 3),
        (utc_datetime(year, 2, 20), utc_datetime(year, 2, 22), 10),
        (utc_datetime(year, 3, 2), utc_datetime(year, 3, 2), 5),
        (utc_datetime(year, 3, 8), utc_datetime(year, 3, 10), 4),
        (utc_datetime(year, 1, 3), utc_datetime(year, 3, 11), 0),
        (utc_datetime(year, 1, 1), utc_datetime(year, 3, 12), 1),
        (utc_datetime(year, 3, 10), utc_datetime(year, 9, 1), 0),
        (utc_datetime(year, 2, 1), utc_datetime(year, 9, 2), 1),
        (utc_datetime(year, 2, 5), utc_datetime(year, 9, 2), 1),
        (utc_datetime(year, 2, 2), utc_datetime(year, 9, 2), 1),
    ]:
        with freeze_time(created_at):
            voucher = EmployerSummerVoucherFactory(
                application=EmployerApplicationFactory(
                    status=EmployerApplicationStatus.SUBMITTED,
                    submitted_at=submitted_at,
                )
            )
            AttachmentFactory.create_batch(
                size=attachment_count, summer_voucher=voucher
            )
            vouchers.append(voucher)

    return sorted(vouchers, key=operator.attrgetter("submitted_at"))


@pytest.mark.django_db
@pytest.mark.parametrize("year", [2021, 2022])
def test_employer_summer_voucher_submitted_at(year):
    """
    Test EmployerSummerVoucher instances' submitted_at property.
    """
    vouchers = create_test_employer_summer_vouchers(year=year)

    assert len(vouchers) == 13
    assert vouchers[0].submitted_at == utc_datetime(year, 1, 18)
    assert vouchers[1].submitted_at == utc_datetime(year, 2, 1)
    assert vouchers[2].submitted_at == utc_datetime(year, 2, 9)
    assert vouchers[3].submitted_at == utc_datetime(year, 2, 21)
    assert vouchers[4].submitted_at == utc_datetime(year, 2, 22)
    assert vouchers[5].submitted_at == utc_datetime(year, 3, 2)
    assert vouchers[6].submitted_at == utc_datetime(year, 3, 10)
    assert vouchers[7].submitted_at == utc_datetime(year, 3, 11)
    assert vouchers[8].submitted_at == utc_datetime(year, 3, 12)
    assert vouchers[9].submitted_at == utc_datetime(year, 9, 1)
    assert vouchers[10].submitted_at == utc_datetime(year, 9, 2)
    assert vouchers[11].submitted_at == utc_datetime(year, 9, 2)
    assert vouchers[12].submitted_at == utc_datetime(year, 9, 2)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "summer_voucher_serial_number",
    [1, 1234, 99_999, 100_000, 123456789012345, 2**50 - 1],
)
def test_employer_summer_voucher_summer_voucher_serial_number_property(
    summer_voucher_serial_number: int,
):
    """
    Test that EmployerSummerVoucher.summer_voucher_serial_number property
    returns the linked YouthSummerVoucher's user_showable_serial_number.
    """
    employer_voucher = EmployerSummerVoucherFactory(
        youth_summer_voucher__summer_voucher_serial_number=summer_voucher_serial_number
    )
    assert (
        employer_voucher.youth_summer_voucher.summer_voucher_serial_number
        == summer_voucher_serial_number
    )
    assert (
        employer_voucher.summer_voucher_serial_number
        == employer_voucher.youth_summer_voucher.user_showable_serial_number
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "summer_voucher_serial_number, expected_user_showable_serial_number",
    [
        # Previously used sequentially generated serial numbers in range [1, 100k):
        (1, "1"),
        (1234, "1234"),
        (99_999, "99999"),
        # Randomly generated base32 encoded serial numbers with integer values >=100k:
        (100_000, "31n-022"),
        (123456789012345, "3g9-230-vqv-s62"),
        (2**50 - 1, "zzz-zzz-zzz-z89"),
    ],
)
def test_youth_summer_voucher_user_showable_serial_number_property(
    summer_voucher_serial_number: int, expected_user_showable_serial_number: str
):
    """
    Test that YouthSummerVoucher.user_showable_serial_number property matches
    the expected encoding.
    """
    youth_summer_voucher = YouthSummerVoucherFactory(
        summer_voucher_serial_number=summer_voucher_serial_number
    )
    assert (
        youth_summer_voucher.user_showable_serial_number
        == expected_user_showable_serial_number
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "obsolete_serial_number", ["", "Testing", "Even more ABC123 testing!"]
)
def test_employer_summer_voucher_summer_voucher_serial_number_property_fallback(
    obsolete_serial_number,
):
    """
    Test that EmployerSummerVoucher.summer_voucher_serial_number property
    returns _obsolete_unclean_serial_number if not linked to a YouthSummerVoucher.
    """
    employer_voucher = EmployerSummerVoucherFactory(
        youth_summer_voucher=None,
        _obsolete_unclean_serial_number=obsolete_serial_number,
    )
    assert employer_voucher.youth_summer_voucher is None
    assert employer_voucher.summer_voucher_serial_number == obsolete_serial_number


@pytest.mark.django_db
@pytest.mark.parametrize(
    "serial_number",
    [
        None,
        "",
        "  ",
        "12345",
        "00001",
        "99999",
        "  1234    ",
        "31n-022",
        "3g9-230-vqv-s62",
        "zzz-zzz-zzz-z89",
        -1,
        1,
        12345,
        99999,
    ],
)
def test_employer_summer_voucher_summer_voucher_serial_number_setter_without_match(
    serial_number: str | int | None,
):
    """
    Test the EmployerSummerVoucher.summer_voucher_serial_number property's setter
    when there is no matching YouthSummerVoucher.
    """
    # Clear existing vouchers for a clean slate
    EmployerSummerVoucher.objects.all().delete()
    YouthSummerVoucher.objects.all().delete()

    employer_voucher = EmployerSummerVoucherFactory(
        _obsolete_unclean_serial_number="", youth_summer_voucher=None
    )

    # When there are no YouthSummerVoucher objects at all, setting any
    # serial number should result in no linked youth summer voucher
    assert not YouthSummerVoucher.objects.exists()
    employer_voucher.summer_voucher_serial_number = serial_number
    assert employer_voucher.youth_summer_voucher is None


@pytest.mark.django_db
@pytest.mark.parametrize(
    "serial_number_as_int, user_inputted_serial_number",
    [
        # Previously used sequentially generated serial numbers in range [1, 100k):
        (1, "1"),
        (1, 1),
        (1, "00001"),
        (1234, "1234"),
        (1234, "  001234   "),
        (1234, 1234),
        (99_999, "99999"),
        (99_999, 99999),
        # Randomly generated base32 encoded serial numbers with integer values >=100k:
        (100_000, "31n-022"),
        (100_000, "3in-o22"),  # Allowed char variations
        (100_000, "3IN-O22"),  # Allowed char variations
        (100_000, "  31n022  "),
        (123456789012345, "3g9-230-vqv-s62"),
        (123456789012345, " -3---g9230v-q-v-s62  "),
        (123456789012345, "3G923ovQVS62"),  # Allowed char variation
        (2**50 - 1, "zzz-zzz-zzz-z89"),
        # Non-numeric base32 encoded serial numbers with checksum still match even if <100k:
        (12, "c62"),
        (1034, "10a03"),
    ],
)
def test_employer_summer_voucher_summer_voucher_serial_number_setter_with_match(
    serial_number_as_int: int, user_inputted_serial_number: str | int
):
    """
    Test the EmployerSummerVoucher.summer_voucher_serial_number property's setter
    when there is a matching YouthSummerVoucher.
    """
    # Clear existing vouchers for a clean slate
    EmployerSummerVoucher.objects.all().delete()
    YouthSummerVoucher.objects.all().delete()

    YouthSummerVoucherFactory(summer_voucher_serial_number=serial_number_as_int)
    employer_voucher = EmployerSummerVoucherFactory(
        _obsolete_unclean_serial_number="", youth_summer_voucher=None
    )

    assert employer_voucher.youth_summer_voucher is None
    employer_voucher.summer_voucher_serial_number = user_inputted_serial_number
    assert employer_voucher.youth_summer_voucher is not None
    assert (
        employer_voucher.youth_summer_voucher.summer_voucher_serial_number
        == serial_number_as_int
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "possibly_matching_serial_numbers, input_serial_number",
    [
        ([], "I am not a number"),  # Not base32 encoded nor an integer
        (
            [
                123,
                base32_lib.decode("123", checksum=False),
            ],
            "#123",
        ),  # Otherwise valid but contains invalid character
        (
            [
                base32_lib.decode("c", checksum=False),
            ],
            "c",
        ),  # Base32 encoded 12 without checksum → invalid
        (
            [
                base32_lib.decode("31n-023", checksum=False),
            ],
            "31n-023",
        ),  # Base32 encoded value with invalid checksum
        (
            [
                base32_lib.decode("31n-022", checksum=False),
                base32_lib.decode("31n-022", checksum=True),
            ],
            "31n-022$",
        ),  # Otherwise valid but contains invalid character
        (
            [
                base32_lib.decode("3g9-230-vqv-s62", checksum=False),
                base32_lib.decode("3g9-230-vqv-s62", checksum=True),
            ],
            "3g9-230-vqv-s62-",
        ),  # Otherwise valid but trailing dash is invalid
    ],
)
def test_employer_summer_voucher_summer_voucher_serial_number_setter_with_invalid_input(
    possibly_matching_serial_numbers: list[int], input_serial_number: str
):
    """
    Test the EmployerSummerVoucher.summer_voucher_serial_number property's setter
    with invalid serial number inputs.

    :possibly_matching_serial_numbers: list of serial numbers that could possibly match
        the input_serial_number if it were decoded/interpreted in a more lenient way.
    :input_serial_number: input serial number invalid in some way
    """
    # Clear existing vouchers for a clean slate
    EmployerSummerVoucher.objects.all().delete()
    YouthSummerVoucher.objects.all().delete()

    # Create youth summer vouchers for the possibly matching serial numbers
    for serial_number in possibly_matching_serial_numbers:
        YouthSummerVoucherFactory(summer_voucher_serial_number=serial_number)
    employer_voucher = EmployerSummerVoucherFactory(
        _obsolete_unclean_serial_number="", youth_summer_voucher=None
    )

    # Try to set the serial number and test that it does not find a match
    employer_voucher.summer_voucher_serial_number = input_serial_number
    assert employer_voucher.youth_summer_voucher is None


@pytest.mark.django_db
@pytest.mark.parametrize("serial_number", [[1], (1,), {2}, {1: 2}, 1.0, True])
def test_employer_summer_voucher_summer_voucher_serial_number_setter_exception(
    serial_number,
):
    """
    Test that EmployerSummerVoucher.summer_voucher_serial_number property's setter
    raises a TypeError if the input is of invalid type.
    """
    employer_voucher = EmployerSummerVoucherFactory()
    with pytest.raises(TypeError):
        employer_voucher.summer_voucher_serial_number = serial_number


@pytest.mark.django_db
@override_settings(
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
@pytest.mark.parametrize(
    "to_youth,to_handler", itertools.product((True, False), repeat=2)
)
def test_youth_summer_voucher_sending(to_youth, to_handler):
    usv = YouthSummerVoucherFactory()

    usv.send_youth_summer_voucher_email(
        language=usv.youth_application.language,
        send_to_youth=to_youth,
        send_to_handler=to_handler,
    )

    if not to_youth and not to_handler:
        assert len(mail.outbox) == 0
    else:
        assert len(mail.outbox) == 1
        m = mail.outbox[0]

        assert m.from_email == "Test sender <testsender@hel.fi>"
        if to_youth:
            assert m.to == [usv.youth_application.email]
        else:
            assert m.to == []

        if to_handler:
            assert m.bcc == ["Test handler <testhandler@hel.fi>"]
        else:
            assert m.bcc == []


@pytest.mark.django_db
@override_settings(
    DEFAULT_FROM_EMAIL="Test sender <testsender@hel.fi>",
    HANDLER_EMAIL="Test handler <testhandler@hel.fi>",
)
def test_youth_summer_voucher_sending__no_optional_arguments():
    usv = YouthSummerVoucherFactory()

    usv.send_youth_summer_voucher_email(language=usv.youth_application.language)

    assert len(mail.outbox) == 1
    m = mail.outbox[0]
    assert m.from_email == "Test sender <testsender@hel.fi>"
    assert m.to == [usv.youth_application.email]
    assert m.bcc == ["Test handler <testhandler@hel.fi>"]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "voucher_value_in_euros,language,expected_logo_from_file",
    [
        (325, "fi", "youth_summer_voucher-325e-fi.png"),
        (325, "sv", "youth_summer_voucher-325e-sv.png"),
        (325, "en", "youth_summer_voucher-325e-en.png"),
        (350, "fi", "youth_summer_voucher-350e-fi.png"),
        (350, "sv", "youth_summer_voucher-350e-sv.png"),
        (350, "en", "youth_summer_voucher-350e-en.png"),
        (351, "fi", "youth_summer_voucher-fi.png"),
        (352, "sv", "youth_summer_voucher-sv.png"),
        (353, "en", "youth_summer_voucher-en.png"),
        (1, "en", "youth_summer_voucher-en.png"),
        (999, "fi", "youth_summer_voucher-fi.png"),
        (12345, "sv", "youth_summer_voucher-sv.png"),
    ],
)
def test_youth_summer_voucher_logo(
    voucher_value_in_euros, language, expected_logo_from_file
):
    voucher = YouthSummerVoucherFactory()
    with mock.patch(
        "applications.models.YouthSummerVoucher.voucher_value_in_euros",
        new_callable=mock.PropertyMock,
        return_value=voucher_value_in_euros,
    ):
        logo_mime_image: MIMEImage = voucher.youth_summer_voucher_logo(
            language=language
        )

    expected_logo_content = _get_email_template_image_file(expected_logo_from_file)
    expected_logo_mime_image = MIMEImage(expected_logo_content)

    assert logo_mime_image.get_payload() == expected_logo_mime_image.get_payload()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "language,expected_logo_from_file",
    [
        ("fi", "helsinki.png"),
        ("sv", "helsingfors.png"),
        ("en", "helsinki.png"),
    ],
)
def test_youth_summer_voucher_helsinki_logo(language, expected_logo_from_file):
    voucher = YouthSummerVoucherFactory()
    logo_mime_image = voucher.helsinki_logo(language=language)

    expected_logo_content = _get_email_template_image_file(expected_logo_from_file)
    expected_logo_mime_image = MIMEImage(expected_logo_content)

    assert logo_mime_image.get_payload() == expected_logo_mime_image.get_payload()


def test_get_random_serial_number():
    """
    Test the YouthSummerVoucher.get_random_serial_number generates numbers in the correct range
    at least remotely randomly. Not rigorous randomness test, but a test for gross failures.
    """
    sample_size = 10_000
    serial_numbers = [
        YouthSummerVoucher.get_random_serial_number() for _ in range(sample_size)
    ]

    # Test for correct range
    assert all(
        YouthSummerVoucher.MIN_RAND_SERIAL_NUM
        <= serial_number
        <= YouthSummerVoucher.MAX_RAND_SERIAL_NUM
        for serial_number in serial_numbers
    )

    # No duplicates: at least a single collision in a ~2**50 range with 10k samples
    # is approximately 1-math.exp(-k*(k-1)/(2*n)) likely where
    # k=10_000, n=YouthSummerVoucher.RAND_SERIAL_NUM_RANGE_LEN, i.e. ~1/22M chance.
    # See https://en.wikipedia.org/wiki/Birthday_problem for the formula derivation.
    assert len(set(serial_numbers)) == sample_size

    # Split range into buckets and verify that each bucket gets roughly as many numbers
    num_buckets = 10
    bucket_size = YouthSummerVoucher.RAND_SERIAL_NUM_RANGE_LEN // num_buckets
    buckets = [0] * num_buckets
    for n in serial_numbers:
        bucket_index = min(
            (n - YouthSummerVoucher.MIN_RAND_SERIAL_NUM) // bucket_size, num_buckets - 1
        )
        buckets[bucket_index] += 1

    expected_per_bucket = 1000
    # Allowed error of ±180 should be at least as improbable as the earlier check i.e. ~1/22M:
    allowed_error = 180

    assert all(abs(count - expected_per_bucket) <= allowed_error for count in buckets)
    assert (
        sum(buckets) == sample_size
    )  # Sanity check that the buckets sum up to the total
