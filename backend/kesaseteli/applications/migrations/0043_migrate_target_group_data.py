import logging

from django.db import migrations

from applications.enums import EmployerApplicationStatus

logger = logging.getLogger(__name__)


def migrate_target_group_forward(apps, schema_editor):
    EmployerSummerVoucher = apps.get_model("applications", "EmployerSummerVoucher")
    YouthSummerVoucher = apps.get_model("applications", "YouthSummerVoucher")

    vouchers_to_update = []
    # Fetch relevant vouchers with related youth vouchers
    qs = (
        EmployerSummerVoucher.objects.filter(
            application__status=EmployerApplicationStatus.SUBMITTED
        )
        .exclude(youth_summer_voucher__isnull=True)
        .select_related("youth_summer_voucher")
    )

    for employer_voucher in qs:
        # Only migrate if employer_voucher has a value
        if employer_voucher.target_group:
            youth_voucher = employer_voucher.youth_summer_voucher
            # Only update if the value is different or youth_voucher has no value
            if youth_voucher.target_group != employer_voucher.target_group:
                youth_voucher.target_group = employer_voucher.target_group
                vouchers_to_update.append(youth_voucher)

    if vouchers_to_update:
        YouthSummerVoucher.objects.bulk_update(vouchers_to_update, ["target_group"])
    logger.info(f"Migrated target_group for {len(vouchers_to_update)} vouchers.")


def migrate_target_group_backward(apps, schema_editor):
    EmployerSummerVoucher = apps.get_model("applications", "EmployerSummerVoucher")

    vouchers_to_update = []
    qs = (
        EmployerSummerVoucher.objects.filter(
            application__status=EmployerApplicationStatus.SUBMITTED
        )
        .exclude(youth_summer_voucher__isnull=True)
        .select_related("youth_summer_voucher")
    )

    for employer_voucher in qs:
        youth_voucher = employer_voucher.youth_summer_voucher
        # Copy strictly if values differ. This includes cases where youth_voucher is empty/null,
        # effectively clearing employer_voucher.target_group if they are meant to be synced.
        if employer_voucher.target_group != youth_voucher.target_group:
            employer_voucher.target_group = youth_voucher.target_group
            vouchers_to_update.append(employer_voucher)

    if vouchers_to_update:
        EmployerSummerVoucher.objects.bulk_update(vouchers_to_update, ["target_group"])
    logger.info(f"Reverted target_group for {len(vouchers_to_update)} vouchers.")


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0042_migrate_youth_summer_voucher_foreign_keys"),
    ]

    operations = [
        migrations.RunPython(
            migrate_target_group_forward, migrate_target_group_backward
        ),
    ]
