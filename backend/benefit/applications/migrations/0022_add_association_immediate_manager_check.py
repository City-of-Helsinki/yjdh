# Generated by Django 3.2.4 on 2021-09-29 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0021_allow_blank_batch"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="association_immediate_manager_check",
            field=models.BooleanField(null=True),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="association_immediate_manager_check",
            field=models.BooleanField(null=True),
        ),
    ]
