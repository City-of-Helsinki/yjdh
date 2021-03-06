# Generated by Django 3.2.4 on 2022-02-09 17:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculator", "0009_work_time_percent_to_decimal"),
    ]

    operations = [
        migrations.CreateModel(
            name="ManualOverrideTotalRow",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("calculator.calculationrow",),
        ),
        migrations.RenameField(
            model_name="calculation",
            old_name="override_benefit_amount_comment",
            new_name="override_monthly_benefit_amount_comment",
        ),
        migrations.RenameField(
            model_name="historicalcalculation",
            old_name="override_benefit_amount_comment",
            new_name="override_monthly_benefit_amount_comment",
        ),
        migrations.RemoveField(
            model_name="calculation",
            name="override_benefit_amount",
        ),
        migrations.RemoveField(
            model_name="historicalcalculation",
            name="override_benefit_amount",
        ),
        migrations.AddField(
            model_name="calculation",
            name="override_monthly_benefit_amount",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=7,
                null=True,
                verbose_name="monthly amount of the benefit manually entered by the application handler",
            ),
        ),
        migrations.AddField(
            model_name="historicalcalculation",
            name="override_monthly_benefit_amount",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=7,
                null=True,
                verbose_name="monthly amount of the benefit manually entered by the application handler",
            ),
        ),
    ]
