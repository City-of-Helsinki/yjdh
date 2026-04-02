from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        (
            "applications",
            "0052_remove_target_group_from_youth_summer_voucher",
        ),
    ]

    operations = [
        migrations.RemoveField(
            model_name="historicalemployersummervoucher",
            name="application",
        ),
        migrations.RemoveField(
            model_name="historicalemployersummervoucher",
            name="history_user",
        ),
        migrations.RemoveField(
            model_name="historicalemployersummervoucher",
            name="youth_summer_voucher",
        ),
        migrations.RemoveField(
            model_name="historicalyouthsummervoucher",
            name="history_user",
        ),
        migrations.RemoveField(
            model_name="historicalyouthsummervoucher",
            name="youth_application",
        ),
        migrations.DeleteModel(
            name="HistoricalEmployerApplication",
        ),
        migrations.DeleteModel(
            name="HistoricalEmployerSummerVoucher",
        ),
        migrations.DeleteModel(
            name="HistoricalYouthSummerVoucher",
        ),
    ]
