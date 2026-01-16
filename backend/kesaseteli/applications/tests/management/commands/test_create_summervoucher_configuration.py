from io import StringIO

import pytest
from django.core.management import call_command

from applications.models import SummerVoucherConfiguration
from applications.target_groups import get_target_group_choices


@pytest.mark.django_db
def test_create_summervoucher_configuration_creates_config():
    # Remove seeded configuration
    SummerVoucherConfiguration.objects.filter(year=2023).delete()

    out = StringIO()
    call_command("create_summervoucher_configuration", "--year", "2023", stdout=out)

    assert SummerVoucherConfiguration.objects.filter(year=2023).exists()
    assert (
        "Successfully created/updated SummerVoucherConfiguration for year 2023"
        in out.getvalue()
    )


@pytest.mark.django_db
def test_create_summervoucher_configuration_idempotent():
    # Remove seeded configuration
    SummerVoucherConfiguration.objects.filter(year=2023).delete()

    SummerVoucherConfiguration.objects.create(
        year=2023,
        target_group=[],
        voucher_value_in_euros=100,
        min_work_compensation_in_euros=100,
        min_work_hours=10,
    )

    out = StringIO()
    call_command("create_summervoucher_configuration", "--year", "2023", stdout=out)

    assert "SummerVoucherConfiguration for year 2023 already exists" in out.getvalue()
    # Ensure it wasn't modified
    config = SummerVoucherConfiguration.objects.get(year=2023)
    assert config.voucher_value_in_euros == 100


@pytest.mark.django_db
def test_create_summervoucher_configuration_defaults():
    # Remove seeded configuration
    SummerVoucherConfiguration.objects.filter(year=2024).delete()

    out = StringIO()
    call_command("create_summervoucher_configuration", "--year", "2024", stdout=out)

    config = SummerVoucherConfiguration.objects.get(year=2024)
    # Check that defaults are reasonable (matching settings.py defaults usually)
    # Note: These values might change if settings defaults change, but checking they are not None is good
    assert config.voucher_value_in_euros > 0
    assert config.min_work_compensation_in_euros > 0
    assert config.min_work_hours > 0
    assert len(config.target_group) > 0


@pytest.mark.django_db
def test_create_summervoucher_configuration_custom_args():
    # Remove seeded configuration
    SummerVoucherConfiguration.objects.filter(year=2025).delete()

    out = StringIO()
    target_group_choice = get_target_group_choices()[0][0]
    call_command(
        "create_summervoucher_configuration",
        "--year",
        "2025",
        "--voucher-value",
        "500",
        "--min-work-compensation",
        "600",
        "--min-work-hours",
        "80",
        "--target-groups",
        target_group_choice,
        stdout=out,
    )

    config = SummerVoucherConfiguration.objects.get(year=2025)
    assert config.voucher_value_in_euros == 500
    assert config.min_work_compensation_in_euros == 600
    assert config.min_work_hours == 80
    assert config.target_group == [target_group_choice]
