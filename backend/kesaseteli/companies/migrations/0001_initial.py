# Generated by Django 3.2 on 2021-05-05 08:32

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Company",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="name")),
                (
                    "business_id",
                    models.CharField(max_length=64, verbose_name="business id"),
                ),
                (
                    "company_form",
                    models.CharField(max_length=64, verbose_name="company form"),
                ),
                ("industry", models.CharField(max_length=256, verbose_name="industry")),
                (
                    "street_address",
                    models.CharField(max_length=256, verbose_name="street address"),
                ),
                ("postcode", models.CharField(max_length=256, verbose_name="postcode")),
                ("city", models.CharField(max_length=256, verbose_name="city")),
                (
                    "ytj_json",
                    models.JSONField(blank=True, null=True, verbose_name="ytj json"),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
