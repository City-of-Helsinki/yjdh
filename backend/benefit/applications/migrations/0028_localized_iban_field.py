# Generated by Django 3.2.4 on 2022-03-21 07:45

import common.localized_iban_field
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0028_company_form_code"),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="company_bank_account_number",
            field=common.localized_iban_field.LocalizedIBANField(
                blank=True,
                include_countries=("FI",),
                max_length=34,
                use_nordea_extensions=False,
                verbose_name="company bank account number",
            ),
        ),
        migrations.AlterField(
            model_name="historicalapplication",
            name="company_bank_account_number",
            field=common.localized_iban_field.LocalizedIBANField(
                blank=True,
                include_countries=("FI",),
                max_length=34,
                use_nordea_extensions=False,
                verbose_name="company bank account number",
            ),
        ),
    ]
