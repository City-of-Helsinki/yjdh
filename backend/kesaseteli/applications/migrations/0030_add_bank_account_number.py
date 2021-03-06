# Generated by Django 3.2.4 on 2022-05-13 07:07

from django.db import migrations
import localflavor.generic.models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0029_remove_youthapplication_encrypted_vtj_json"),
    ]

    operations = [
        migrations.AddField(
            model_name="employerapplication",
            name="bank_account_number",
            field=localflavor.generic.models.IBANField(
                blank=True,
                include_countries=None,
                max_length=34,
                use_nordea_extensions=False,
                verbose_name="bank account number",
            ),
        ),
        migrations.AddField(
            model_name="historicalemployerapplication",
            name="bank_account_number",
            field=localflavor.generic.models.IBANField(
                blank=True,
                include_countries=None,
                max_length=34,
                use_nordea_extensions=False,
                verbose_name="bank account number",
            ),
        ),
    ]
