# Generated by Django 3.2.18 on 2024-01-24 09:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0057_attachment_type_decision_text"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalapplication",
            name="history_change_reason",
            field=models.TextField(null=True),
        ),
    ]