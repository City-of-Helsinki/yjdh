from django.db import migrations

from applications.migrations.helpers.serial_number_foreign_keys import (
    set_current_valid_serial_number_based_foreign_keys,
    set_historical_serial_number_based_foreign_keys,
)


def set_current_and_historical_serial_number_based_foreign_keys(apps, schema_editor):
    """
    Set youth_summer_voucher_id ForeignKey values in EmployerSummerVoucher and
    HistoricalEmployerSummerVoucher models based on the _obsolete_unclean_serial_number
    values.
    """
    employer_summer_voucher_model = apps.get_model(
        "applications", "EmployerSummerVoucher"
    )
    youth_summer_voucher_model = apps.get_model("applications", "YouthSummerVoucher")
    historical_employer_summer_voucher_model = apps.get_model(
        "applications", "HistoricalEmployerSummerVoucher"
    )
    set_current_valid_serial_number_based_foreign_keys(
        employer_summer_voucher_model, youth_summer_voucher_model
    )
    set_historical_serial_number_based_foreign_keys(
        historical_employer_summer_voucher_model
    )


class Migration(migrations.Migration):
    dependencies = [
        (
            "applications",
            "0041_rename_serial_number_field_and_add_youth_voucher_foreign_key",
        ),
    ]

    operations = [
        migrations.RunPython(
            set_current_and_historical_serial_number_based_foreign_keys,
            migrations.RunPython.noop,
        ),
    ]
