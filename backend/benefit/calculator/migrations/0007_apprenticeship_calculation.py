# Generated by Django 3.2.4 on 2021-11-30 07:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import simple_history.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0026_alter_applicationbatch_status"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("calculator", "0006_employeebenefitmonthlyrow_employeebenefittotalrow"),
    ]

    operations = [
        migrations.CreateModel(
            name="TotalDeductionsMonthlyRow",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("calculator.calculationrow",),
        ),
        migrations.CreateModel(
            name="TrainingCompensationMonthlyRow",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("calculator.calculationrow",),
        ),
        migrations.AlterField(
            model_name="calculationrow",
            name="row_type",
            field=models.CharField(
                choices=[
                    ("description", "Description row, amount ignored"),
                    ("salary_costs", "Salary costs"),
                    ("state_aid_max_monthly_eur", "State aid maximum %"),
                    ("pay_subsidy_monthly_eur", "Pay subsidy/month"),
                    ("helsinki_benefit_monthly_eur", "Helsinki benefit amount monthly"),
                    (
                        "helsinki_benefit_sub_total_eur",
                        "Helsinki benefit amount for a date range",
                    ),
                    ("helsinki_benefit_total_eur", "Helsinki benefit total amount"),
                    (
                        "training_compensation_monthly_eur",
                        "Training compensation amount monthly",
                    ),
                    ("deductions_total_eur", "Total amount of deductions monthly"),
                ],
                max_length=64,
            ),
        ),
        migrations.AlterField(
            model_name="historicalcalculationrow",
            name="row_type",
            field=models.CharField(
                choices=[
                    ("description", "Description row, amount ignored"),
                    ("salary_costs", "Salary costs"),
                    ("state_aid_max_monthly_eur", "State aid maximum %"),
                    ("pay_subsidy_monthly_eur", "Pay subsidy/month"),
                    ("helsinki_benefit_monthly_eur", "Helsinki benefit amount monthly"),
                    (
                        "helsinki_benefit_sub_total_eur",
                        "Helsinki benefit amount for a date range",
                    ),
                    ("helsinki_benefit_total_eur", "Helsinki benefit total amount"),
                    (
                        "training_compensation_monthly_eur",
                        "Training compensation amount monthly",
                    ),
                    ("deductions_total_eur", "Total amount of deductions monthly"),
                ],
                max_length=64,
            ),
        ),
        migrations.CreateModel(
            name="TrainingCompensation",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="time created"
                    ),
                ),
                (
                    "modified_at",
                    models.DateTimeField(auto_now=True, verbose_name="time modified"),
                ),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("ordering", models.IntegerField()),
                ("start_date", models.DateField(verbose_name="Pay subsidy start date")),
                ("end_date", models.DateField(verbose_name="Pay subsidy end date")),
                (
                    "monthly_amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=7,
                        verbose_name="Monthly amount of compensation",
                    ),
                ),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="training_compensations",
                        to="applications.application",
                        verbose_name="application",
                    ),
                ),
            ],
            options={
                "verbose_name": "training compensation",
                "verbose_name_plural": "training compensations",
                "db_table": "bf_calculator_trainingcompensation",
                "ordering": ["application__created_at", "ordering"],
            },
        ),
        migrations.CreateModel(
            name="HistoricalTrainingCompensation",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        blank=True, editable=False, verbose_name="time created"
                    ),
                ),
                (
                    "modified_at",
                    models.DateTimeField(
                        blank=True, editable=False, verbose_name="time modified"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(db_index=True, default=uuid.uuid4, editable=False),
                ),
                ("ordering", models.IntegerField()),
                ("start_date", models.DateField(verbose_name="Pay subsidy start date")),
                ("end_date", models.DateField(verbose_name="Pay subsidy end date")),
                (
                    "monthly_amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=7,
                        verbose_name="Monthly amount of compensation",
                    ),
                ),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField()),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(
                        choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")],
                        max_length=1,
                    ),
                ),
                (
                    "application",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="applications.application",
                        verbose_name="application",
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "historical training compensation",
                "db_table": "bf_calculator_trainingcompensation_history",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": "history_date",
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
