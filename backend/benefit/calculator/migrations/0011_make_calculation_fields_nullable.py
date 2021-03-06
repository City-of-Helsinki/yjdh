# Generated by Django 3.2.4 on 2022-01-17 21:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculator", "0010_override_monthly_benefit_amount"),
    ]

    operations = [
        migrations.AlterField(
            model_name="calculation",
            name="end_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="benefit end date"
            ),
        ),
        migrations.AlterField(
            model_name="calculation",
            name="start_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="benefit start from date"
            ),
        ),
        migrations.AlterField(
            model_name="calculation",
            name="state_aid_max_percentage",
            field=models.IntegerField(
                blank=True,
                choices=[(50, "50%"), (100, "100%")],
                default=None,
                null=True,
                verbose_name="State aid maximum %",
            ),
        ),
        migrations.AlterField(
            model_name="historicalcalculation",
            name="end_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="benefit end date"
            ),
        ),
        migrations.AlterField(
            model_name="historicalcalculation",
            name="start_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="benefit start from date"
            ),
        ),
        migrations.AlterField(
            model_name="historicalcalculation",
            name="state_aid_max_percentage",
            field=models.IntegerField(
                blank=True,
                choices=[(50, "50%"), (100, "100%")],
                default=None,
                null=True,
                verbose_name="State aid maximum %",
            ),
        ),
        migrations.AlterField(
            model_name="historicalpaysubsidy",
            name="end_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="Pay subsidy end date"
            ),
        ),
        migrations.AlterField(
            model_name="historicalpaysubsidy",
            name="start_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="Pay subsidy start date"
            ),
        ),
        migrations.AlterField(
            model_name="paysubsidy",
            name="end_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="Pay subsidy end date"
            ),
        ),
        migrations.AlterField(
            model_name="paysubsidy",
            name="start_date",
            field=models.DateField(
                blank=True, null=True, verbose_name="Pay subsidy start date"
            ),
        ),
    ]
