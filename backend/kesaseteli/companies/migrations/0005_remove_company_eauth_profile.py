# Generated by Django 3.2.4 on 2021-10-27 07:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0004_company_remove_manual_fields"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="company",
            name="eauth_profile",
        ),
    ]
