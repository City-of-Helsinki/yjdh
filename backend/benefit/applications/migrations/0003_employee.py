# Generated by Django 3.2.4 on 2021-06-17 10:49

import uuid

import django.db.models.deletion
import encrypted_fields.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0002_field_changes_for_application_api"),
    ]

    operations = [
        migrations.CreateModel(
            name="Employee",
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
                (
                    "first_name",
                    models.CharField(max_length=128, verbose_name="first name"),
                ),
                (
                    "last_name",
                    models.CharField(max_length=128, verbose_name="last name"),
                ),
                (
                    "social_security_number",
                    encrypted_fields.fields.EncryptedCharField(
                        max_length=11, verbose_name="social security number"
                    ),
                ),
                (
                    "phone_number",
                    models.CharField(max_length=64, verbose_name="phone number"),
                ),
                (
                    "email",
                    models.EmailField(blank=True, max_length=254, verbose_name="email"),
                ),
                (
                    "employee_language",
                    models.CharField(
                        choices=[("fi", "suomi"), ("sv", "svenska"), ("en", "english")],
                        default="fi",
                        max_length=2,
                    ),
                ),
                (
                    "job_title",
                    models.CharField(
                        blank=True, max_length=128, verbose_name="job title"
                    ),
                ),
                (
                    "monthly_pay",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=7,
                        null=True,
                        verbose_name="monthly pay",
                    ),
                ),
                (
                    "vacation_money",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=7,
                        null=True,
                        verbose_name="vacation money",
                    ),
                ),
                (
                    "other_expenses",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=7,
                        null=True,
                        verbose_name="other expenses",
                    ),
                ),
                (
                    "working_hours",
                    models.DecimalField(
                        blank=True,
                        decimal_places=1,
                        max_digits=4,
                        null=True,
                        verbose_name="working hour",
                    ),
                ),
                (
                    "collective_bargaining_agreement",
                    models.CharField(
                        blank=True,
                        max_length=64,
                        verbose_name="collective bargaining agreement",
                    ),
                ),
                (
                    "application",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="employee",
                        to="applications.application",
                        verbose_name="application",
                    ),
                ),
            ],
            options={
                "verbose_name": "employee",
                "verbose_name_plural": "employees",
                "db_table": "bf_applications_employee",
            },
        ),
    ]
