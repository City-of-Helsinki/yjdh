# Generated by Django 3.2.4 on 2021-12-30 10:44

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("applications", "0019_use_employer_applications_related_name"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="SummerVoucher",
            new_name="EmployerSummerVoucher",
        ),
        migrations.RenameModel(
            old_name="HistoricalSummerVoucher",
            new_name="HistoricalEmployerSummerVoucher",
        ),
    ]
