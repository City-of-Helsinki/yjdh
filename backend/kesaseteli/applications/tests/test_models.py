import pytest
from django.db import transaction
from django.db.utils import IntegrityError

from applications.models import YouthSummerVoucher
from common.tests.factories import AcceptedYouthApplicationFactory


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality():
    assert YouthSummerVoucher.objects.count() == 0
    for ordinal_number in range(1, 10):
        summer_voucher = AcceptedYouthApplicationFactory().create_youth_summer_voucher()
        assert YouthSummerVoucher.objects.count() == ordinal_number
        assert YouthSummerVoucher.objects.last() == summer_voucher
        assert summer_voucher.summer_voucher_serial_number == ordinal_number


@pytest.mark.django_db(transaction=True, reset_sequences=True)
def test_youth_summer_voucher_sequentiality_duplicate_create():
    assert YouthSummerVoucher.objects.count() == 0

    app_1 = AcceptedYouthApplicationFactory()
    app_1.create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with pytest.raises(IntegrityError):
        app_1.create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
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

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AcceptedYouthApplicationFactory().create_youth_summer_voucher()
        AcceptedYouthApplicationFactory().create_youth_summer_voucher()
        transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
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

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AcceptedYouthApplicationFactory().create_youth_summer_voucher()
        with transaction.atomic():
            AcceptedYouthApplicationFactory().create_youth_summer_voucher()
            AcceptedYouthApplicationFactory().create_youth_summer_voucher()
            transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 2
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 2

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
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

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    with transaction.atomic():
        AcceptedYouthApplicationFactory().create_youth_summer_voucher()
        with transaction.atomic():
            AcceptedYouthApplicationFactory().create_youth_summer_voucher()
            AcceptedYouthApplicationFactory().create_youth_summer_voucher()
            transaction.set_rollback(True)
        transaction.set_rollback(True)

    assert YouthSummerVoucher.objects.count() == 1
    assert YouthSummerVoucher.objects.last().summer_voucher_serial_number == 1

    AcceptedYouthApplicationFactory().create_youth_summer_voucher()
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
            AcceptedYouthApplicationFactory().create_youth_summer_voucher()

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
