# Generated by Django 3.2.4 on 2022-01-14 11:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("postings", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tetpostingtemp",
            name="data",
            field=models.JSONField(verbose_name="posting data"),
        ),
    ]
