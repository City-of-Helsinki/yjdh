# Generated by Django 3.2.4 on 2021-08-11 16:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0011_application_step"),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE SEQUENCE seq_application_number INCREMENT BY 1 START WITH 125000 OWNED "
            "BY bf_applications_application.application_number",
            "DROP SEQUENCE seq_application_number",
        )
    ]
