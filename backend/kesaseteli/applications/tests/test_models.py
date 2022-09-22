import itertools
import operator
from typing import List

import pytest
from django.core import mail
from django.db import transaction
from django.db.utils import IntegrityError
from django.test import override_settings
from freezegun import freeze_time

from applications.enums import EmployerApplicationStatus
from applications.models import EmployerSummerVoucher, YouthSummerVoucher
from common.tests.factories import (
    AttachmentFactory,
    AwaitingManualProcessingYouthApplicationFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    YouthSummerVoucherFactory,
)
from common.utils import utc_datetime


def create_test_employer_summer_vouchers(year) -> List[EmployerSummerVoucher]:
    """
    Create EmployerSummerVouchers for given year sorted by last_submitted_at
    """
    vouchers: List[EmployerSummerVoucher] = []
    for created_at, last_submitted_at_list, attachment_count in [
        (utc_datetime(year, 1, 13), [utc_datetime(year, 1, 18)], 0),
        (utc_datetime(year, 2, 1), [], 0),
        (utc_datetime(year, 1, 1), [utc_datetime(year, 2, 9)], 1),
        (utc_datetime(year, 2, 21), [], 3),
        (utc_datetime(year, 2, 20), [utc_datetime(year, 2, 22)], 10),
        (utc_datetime(year, 3, 2), [], 5),
        (utc_datetime(year, 3, 8), [utc_datetime(year, 3, 10)], 4),
        (
            utc_datetime(year, 1, 3),
            [
                utc_datetime(year, 3, 3),
                utc_datetime(year, 3, 5),
                utc_datetime(year, 3, 11),
            ],
            0,
        ),
        (utc_datetime(year, 1, 1), [utc_datetime(year, 3, 12)], 1),
        (
            utc_datetime(year, 3, 10),
            [utc_datetime(year, 3, 11), utc_datetime(year, 9, 1)],
            0,
        ),
        (utc_datetime(year, 2, 1), [utc_datetime(year, 9, 2)], 1),
        (utc_datetime(year, 2, 5), [utc_datetime(year, 9, 2)], 1),
        (utc_datetime(year, 2, 2), [utc_datetime(year, 9, 2)], 1),
    ]:
        with freeze_time(created_at):
            voucher = EmployerSummerVoucherFactory(
                application=EmployerApplicationFactory(
                    status=EmployerApplicationStatus.SUBMITTED
                )
            )
            AttachmentFactory.create_batch(
                size=attachment_count, summer_voucher=voucher
            )
            for last_submitted_at in last_submitted_at_list:
                with freeze_time(last_submitted_at):
                    voucher.save()
            vouchers.append(voucher)

    return sorted(vouchers, key=operator.attrgetter("last_submitted_at"))


@pytest.mark.django_db
@pytest.mark.parametrize("year", [2021, 2022])
def test_employer_summer_voucher_last_submitted_at(year):
    """
    Test EmployerSummerVoucher instances' last_submitted_at property
    """
    vouchers = create_test_employer_summer_vouchers(year=year)

    assert len(vouchers) == 13
    assert vouchers[0].last_submitted_at == utc_datetime(year, 1, 18)
    assert vouchers[1].last_submitted_at == utc_datetime(year, 2, 1)
    assert vouchers[2].last_submitted_at == utc_datetime(year, 2, 9)
    assert vouchers[3].last_submitted_at == utc_datetime(year, 2, 21)
    assert vouchers[4].last_submitted_at == utc_datetime(year, 2, 22)
    assert vouchers[5].last_submitted_at == utc_datetime(year, 3, 2)
    assert vouchers[6].last_submitted_at == utc_datetime(year, 3, 10)
    assert vouchers[7].last_submitted_at == utc_datetime(year, 3, 11)
    assert vouchers[8].last_submitted_at == utc_datetime(year, 3, 12)
    assert vouchers[9].last_submitted_at == utc_datetime(year, 9, 1)
    assert vouchers[10].last_submitted_at == utc_datetime(year, 9, 2)
    assert vouchers[11].last_submitted_at == utc_datetime(year, 9, 2)
    assert vouchers[12].last_submitted_at == utc_datetime(year, 9, 2)


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality():
    assert YouthSummerVoucher.objects.count() == 0
    for ordinal_number in range(1, 10):
        summer_voucher = (
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
        )
        assert YouthSummerVoucher.objects.count() == ordinal_number
        assert YouthSummerVoucher.objects.last() == summer_voucher
        assert summer_voucher.summer_voucher_serial_number == ordinal_number


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_duplicate_create():
    assert YouthSummerVoucher.objects.count() == 0

    app_1 = AwaitingManualProcessingYouthApplicationFactory()
    app_1.create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with pytest.raises(IntegrityError):
        app_1.create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 2
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 2

    assert sorted(
        YouthSummerVoucher.objects.values_list(
            "summer_voucher_serial_number", flat=True
        )
    ) == list(range(1, 3))


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_failing_transaction():
    assert YouthSummerVoucher.objects.count() == 0

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
        AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
        transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 2
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 2

    assert sorted(
        YouthSummerVoucher.objects.values_list(
            "summer_voucher_serial_number", flat=True
        )
    ) == list(range(1, 3))


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_failing_nested_transaction():
    assert YouthSummerVoucher.objects.count() == 0

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
        with transaction.atomic():
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
            transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 2
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 2

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 3
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 3

    assert sorted(
        YouthSummerVoucher.objects.values_list(
            "summer_voucher_serial_number", flat=True
        )
    ) == list(range(1, 4))


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_failing_nested_transactions():
    assert YouthSummerVoucher.objects.count() == 0

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
        with transaction.atomic():
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
            transaction.set_rollback(True)
        transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 2
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 2

    assert sorted(
        YouthSummerVoucher.objects.values_list(
            "summer_voucher_serial_number", flat=True
        )
    ) == list(range(1, 3))


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_complex_transaction_nesting():
    assert YouthSummerVoucher.objects.count() == 0

    def create_youth_summer_vouchers(count: int):
        for i in range(count):
            AwaitingManualProcessingYouthApplicationFactory().create_youth_summer_voucher()

    create_youth_summer_vouchers(count=1)
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        create_youth_summer_vouchers(count=3)
        with transaction.atomic():
            create_youth_summer_vouchers(count=5)
            with transaction.atomic():
                create_youth_summer_vouchers(count=7)
                with transaction.atomic():
                    create_youth_summer_vouchers(count=9)
                    with transaction.atomic():
                        create_youth_summer_vouchers(count=11)
                transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 9
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 9

    create_youth_summer_vouchers(count=1)
    assert YouthSummerVoucher.objects.count() == 10
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 10

    assert sorted(
        YouthSummerVoucher.objects.values_list(
            "summer_voucher_serial_number", flat=True
        )
    ) == list(range(1, 11))


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
