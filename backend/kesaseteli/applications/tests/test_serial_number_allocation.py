from unittest.mock import patch

import pytest

from applications.models import YouthApplication, YouthSummerVoucher
from common.tests.factories import (
    AcceptableYouthApplicationFactory,
    YouthSummerVoucherFactory,
)


@pytest.mark.django_db
def test_create_youth_summer_voucher_normal_success():
    """
    Test that YouthSummerVoucher.create_youth_summer_voucher
    succeeds 100 times in row without any serial number collisions.
    """
    for _i in range(100):
        with patch.object(
            YouthSummerVoucher,
            "get_random_serial_number",
            wraps=YouthSummerVoucher.get_random_serial_number,
        ) as mock_get_random_serial_number:
            assert (
                AcceptableYouthApplicationFactory().create_youth_summer_voucher()
                is not None
            )
            mock_get_random_serial_number.assert_called_once()


@pytest.mark.django_db
def test_create_youth_summer_voucher_succeeds_after_9_collisions():
    """
    Test that YouthSummerVoucher.create_youth_summer_voucher succeeds if
    a serial number collision happens 9 times in row, which is the maximum allowed
    before raising an exception.
    """
    youth_application: YouthApplication = AcceptableYouthApplicationFactory()
    existing_voucher = YouthSummerVoucherFactory(
        summer_voucher_serial_number=YouthSummerVoucher.MIN_RAND_SERIAL_NUM + 123456
    )
    colliding_num = existing_voucher.summer_voucher_serial_number
    free_num = colliding_num + 1

    side_effects = [colliding_num] * 9 + [free_num]
    with patch.object(
        YouthSummerVoucher, "get_random_serial_number", side_effect=side_effects
    ):
        voucher = youth_application.create_youth_summer_voucher()

    assert voucher.summer_voucher_serial_number == free_num


@pytest.mark.django_db
def test_create_youth_summer_voucher_fails_after_10_collisions():
    """
    Test that YouthSummerVoucher.create_youth_summer_voucher fails if
    a serial number collision happens 10 times in row, which is minimum
    amount of collisions that causes the method to raise an exception.
    """
    youth_application: YouthApplication = AcceptableYouthApplicationFactory()
    existing_voucher = YouthSummerVoucherFactory(
        summer_voucher_serial_number=YouthSummerVoucher.MIN_RAND_SERIAL_NUM + 123456
    )
    colliding_num = existing_voucher.summer_voucher_serial_number

    side_effects = [colliding_num] * 10
    with patch.object(
        YouthSummerVoucher, "get_random_serial_number", side_effect=side_effects
    ):
        with pytest.raises(
            RuntimeError,
            match="Unable to allocate serial number for youth summer voucher",
        ):
            youth_application.create_youth_summer_voucher()
