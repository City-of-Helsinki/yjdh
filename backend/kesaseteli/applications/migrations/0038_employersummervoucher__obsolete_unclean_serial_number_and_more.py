import logging

import django.db.models.deletion
from django.db import IntegrityError, migrations, models, transaction
from django.db.models import IntegerField
from django.db.models.functions import Cast
from stdnum.fi.hetu import is_valid as is_valid_finnish_social_security_number

LOGGER = logging.getLogger(__name__)

def validate_serial_number_backup(employer_voucher_model):
    """
    Validate that the backup of serial numbers was successful by comparing
    the original and backup fields.

    :raises IntegrityError: If any of the serial number values do not match.
    """
    # Raise an integrity error if not all serial number values were copied correctly
    for employer_voucher in employer_voucher_model.objects.all():
        if (
            employer_voucher.summer_voucher_serial_number
            != employer_voucher._obsolete_unclean_serial_number
        ):
            raise IntegrityError("Data migration incorrect!")


def _backup_serial_numbers(apps, employer_voucher_model_name):
    employer_voucher_model = apps.get_model("applications", employer_voucher_model_name)
    with transaction.atomic():
        # Copy the values from summer_voucher_serial_number to _obsolete_unclean_serial_number
        employer_voucher_model.objects.update(
            _obsolete_unclean_serial_number=models.F("summer_voucher_serial_number")
        )
        validate_serial_number_backup(employer_voucher_model)


def backup_serial_numbers(apps, schema_editor):
    """
    Backup the summer_voucher_serial_number values to _obsolete_unclean_serial_number
    fields in EmployerSummerVoucher and HistoricalEmployerSummerVoucher models.
    """
    with transaction.atomic():
        _backup_serial_numbers(apps, "EmployerSummerVoucher")
        _backup_serial_numbers(apps, "HistoricalEmployerSummerVoucher")


def _restore_serial_numbers(apps, employer_voucher_model_name):
    employer_voucher_model = apps.get_model("applications", employer_voucher_model_name)
    with transaction.atomic():
        # Copy the values from _obsolete_unclean_serial_number back to summer_voucher_serial_number
        employer_voucher_model.objects.update(
            summer_voucher_serial_number=models.F("_obsolete_unclean_serial_number")
        )
        validate_serial_number_backup(employer_voucher_model)


def restore_serial_numbers(apps, schema_editor):
    """
    Restore the summer_voucher_serial_number values from _obsolete_unclean_serial_number
    fields in EmployerSummerVoucher and HistoricalEmployerSummerVoucher models.
    """
    with transaction.atomic():
        _restore_serial_numbers(apps, "EmployerSummerVoucher")
        _restore_serial_numbers(apps, "HistoricalEmployerSummerVoucher")


def _set_current_valid_serial_number_foreign_keys(apps):
    """
    Convert valid serial number strings in _obsolete_unclean_serial_number to actual valid
    ForeignKey references in summer_voucher_serial_number in EmployerSummerVoucher model.

    Matching is done first by purely numeric serial numbers, and if that fails, by matching
    social security number and creation year.
    """
    EmployerSummerVoucher = apps.get_model("applications", "EmployerSummerVoucher")
    YouthSummerVoucher = apps.get_model("applications", "YouthSummerVoucher")

    # Real data in production was at start of 2026 around ~8000 EmployerSummerVoucher objects,
    # so performance should be negligible even without bulk updates or better Django ORM use.
    total_count = EmployerSummerVoucher.objects.count()
    matched_by_ssn_count = matched_by_serial_count = failure_count = 0

    for employer_voucher in EmployerSummerVoucher.objects.all():
        lower_serial = employer_voucher._obsolete_unclean_serial_number.strip().lower()

        # Purely numeric serial numbers? These should be the majority
        if (
            lower_serial.isdigit()
            and (
                youth_vouchers := YouthSummerVoucher.objects.filter(
                    summer_voucher_serial_number=int(lower_serial)
                )
            ).count()
            == 1
        ):
            youth_voucher = youth_vouchers.first()
            employer_voucher.summer_voucher_serial_number = (
                youth_voucher.summer_voucher_serial_number
            )
            employer_voucher.save()
            # Successfully matched by numeric serial number, skip to next
            matched_by_serial_count += 1
            LOGGER.info(
                f"Matched employer voucher {employer_voucher.id} to "
                f"youth voucher {youth_voucher.id} by summer voucher serial number."
            )
        elif is_valid_finnish_social_security_number(
            employer_voucher.employee_ssn
        ) and (
            (
                youth_vouchers := YouthSummerVoucher.objects.filter(
                    youth_application__social_security_number=employer_voucher.employee_ssn,
                    youth_application__created_at__year=employer_voucher.created_at__year,
                    youth_application__created_at__lte=employer_voucher.created_at,
                )
            ).count()
            == 1
        ):
            youth_voucher = youth_vouchers.first()
            employer_voucher.summer_voucher_serial_number = (
                youth_voucher.summer_voucher_serial_number
            )
            employer_voucher.save()
            matched_by_ssn_count += 1
            LOGGER.info(
                f"Matched employer voucher {employer_voucher.id} to "
                f"youth voucher {youth_voucher.id} by social security number & year."
            )
        else:
            LOGGER.warning(
                f"Unable to find youth voucher for employer voucher {employer_voucher.id}"
            )
            failure_count += 1

    # Log summary of results
    LOGGER.info(f"Handled {total_count} employer summer vouchers:")
    LOGGER.info(f"- Matched by voucher serial number: {matched_by_serial_count}")
    LOGGER.info(f"- Matched by social security number & year: {matched_by_ssn_count}")
    LOGGER.info(f"- Failed to match: {failure_count}")


def _set_historical_serial_number_foreign_keys(apps):
    """
    Convert non-negative integer string values in _obsolete_unclean_serial_number to actual integer
    values in summer_voucher_serial_number in HistoricalEmployerSummerVoucher model.

    Not trying to make the historical records perfect, just doing the minimum obvious conversion.
    """
    HistoricalEmployerSummerVoucher = apps.get_model(
        "applications", "HistoricalEmployerSummerVoucher"
    )
    total_count = HistoricalEmployerSummerVoucher.objects.count()

    # Real data in production was Jan 2026 around ~55k HistoricalEmployerSummerVoucher rows
    updated_count = HistoricalEmployerSummerVoucher.objects.filter(
        _obsolete_unclean_serial_number__regex=r"^[0-9]+$"  # Integers as strings only
    ).update(
        summer_voucher_serial_number=Cast(
            "_obsolete_unclean_serial_number", IntegerField()
        )
    )

    LOGGER.info(f"Handled {total_count} historical employer summer vouchers:")
    LOGGER.info(f"- Converted numeric serial numbers to integers: {updated_count}")
    LOGGER.info(f"- Left as NULL: {total_count - updated_count}")


def set_current_and_historical_serial_number_foreign_keys(apps, schema_editor):
    """
    Set summer_voucher_serial_number ForeignKey values in EmployerSummerVoucher and
    HistoricalEmployerSummerVoucher models based on the backed up serial numbers.
    """
    with transaction.atomic():
        _set_current_valid_serial_number_foreign_keys(apps)
        _set_historical_serial_number_foreign_keys(apps)


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0037_set_year_2026_schools"),
    ]

    operations = [
        # Add backup fields for serial numbers
        migrations.AddField(
            model_name="employersummervoucher",
            name="_obsolete_unclean_serial_number",
            field=models.CharField(
                blank=True,
                help_text="Old obsolete unclean summer_voucher_serial_number values before data migration in early 2026. Any leftovers with non-empty values are such that were not real actual summer_voucher_serial_number values at the time of migration. Can be used for manual data cleaning.",
                max_length=256,
                verbose_name="obsolete unclean summer voucher serial number",
            ),
        ),
        migrations.AddField(
            model_name="historicalemployersummervoucher",
            name="_obsolete_unclean_serial_number",
            field=models.CharField(
                blank=True,
                help_text="Old obsolete unclean summer_voucher_serial_number values before data migration in early 2026. Any leftovers with non-empty values are such that were not real actual summer_voucher_serial_number values at the time of migration. Can be used for manual data cleaning.",
                max_length=256,
                verbose_name="obsolete unclean summer voucher serial number",
            ),
        ),
        # Backup serial numbers to the backup fields
        migrations.RunPython(backup_serial_numbers, restore_serial_numbers),
        # Drop the old char field versions of the serial numbers
        migrations.RemoveField(
            model_name="employersummervoucher", name="summer_voucher_serial_number"
        ),
        migrations.RemoveField(
            model_name="historicalemployersummervoucher",
            name="summer_voucher_serial_number",
        ),
        # Add new empty ForeignKey versions of serial numbers
        migrations.AddField(
            model_name="employersummervoucher",
            name="summer_voucher_serial_number",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="applications.youthsummervoucher",
                to_field="summer_voucher_serial_number",
                verbose_name="youth summer voucher serial number",
            ),
        ),
        migrations.AddField(
            model_name="historicalemployersummervoucher",
            name="summer_voucher_serial_number",
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="applications.youthsummervoucher",
                to_field="summer_voucher_serial_number",
                verbose_name="youth summer voucher serial number",
            ),
        ),
        # Populate the new ForeignKey serial numbers based on the serial number backups
        migrations.RunPython(
            set_current_and_historical_serial_number_foreign_keys,
            migrations.RunPython.noop,
        ),
    ]
