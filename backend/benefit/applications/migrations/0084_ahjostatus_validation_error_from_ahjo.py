# Generated by Django 4.2.11 on 2024-09-20 11:26

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0083_ahjostatus_ahjo_request_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="ahjostatus",
            name="validation_error_from_ahjo",
            field=models.JSONField(blank=True, null=True),
        ),
    ]