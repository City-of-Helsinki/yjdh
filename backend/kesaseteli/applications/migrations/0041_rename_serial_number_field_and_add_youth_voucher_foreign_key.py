import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0040_alter_employerapplication_options_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="employersummervoucher",
            old_name="summer_voucher_serial_number",
            new_name="_obsolete_unclean_serial_number",
        ),
        migrations.RenameField(
            model_name="historicalemployersummervoucher",
            old_name="summer_voucher_serial_number",
            new_name="_obsolete_unclean_serial_number",
        ),
        migrations.AlterField(
            model_name="employersummervoucher",
            name="_obsolete_unclean_serial_number",
            field=models.CharField(
                blank=True,
                help_text="Old obsolete unclean summer_voucher_serial_number values before data migration in early 2026. Can be used for manual data cleaning and as fallback summer_voucher_serial_number values in historical data.",
                max_length=256,
                verbose_name="obsolete unclean summer voucher serial number",
            ),
        ),
        migrations.AlterField(
            model_name="historicalemployersummervoucher",
            name="_obsolete_unclean_serial_number",
            field=models.CharField(
                blank=True,
                help_text="Old obsolete unclean summer_voucher_serial_number values before data migration in early 2026. Can be used for manual data cleaning and as fallback summer_voucher_serial_number values in historical data.",
                max_length=256,
                verbose_name="obsolete unclean summer voucher serial number",
            ),
        ),
        migrations.AddField(
            model_name="employersummervoucher",
            name="youth_summer_voucher",
            field=models.ForeignKey(
                db_column="summer_voucher_serial_number",
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="employer_summer_vouchers",
                to="applications.youthsummervoucher",
                to_field="summer_voucher_serial_number",
                verbose_name="youth summer voucher",
            ),
        ),
        migrations.AddField(
            model_name="historicalemployersummervoucher",
            name="youth_summer_voucher",
            field=models.ForeignKey(
                blank=True,
                db_column="summer_voucher_serial_number",
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="applications.youthsummervoucher",
                to_field="summer_voucher_serial_number",
                verbose_name="youth summer voucher",
            ),
        ),
    ]
