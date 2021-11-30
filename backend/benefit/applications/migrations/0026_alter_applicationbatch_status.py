# Generated by Django 3.2.4 on 2021-11-25 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0025_new_application_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="applicationbatch",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    (
                        "exported_ahjo_report",
                        "Ahjo report created, not yet sent to AHJO",
                    ),
                    ("awaiting_ahjo_decision", "Sent to Ahjo, decision pending"),
                    ("accepted", "Accepted in Ahjo"),
                    ("rejected", "Rejected in Ahjo"),
                    ("returned", "Returned from Ahjo without decision"),
                    ("sent_to_talpa", "Sent to Talpa"),
                    ("completed", "Processing is completed"),
                ],
                default="draft",
                max_length=64,
                verbose_name="status of batch",
            ),
        ),
    ]
