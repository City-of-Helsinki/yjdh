# Generated by Django 3.2.4 on 2022-03-21 07:43

import common.localized_iban_field
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0003_company_form_code"),
    ]

    operations = [
        migrations.AlterField(
            model_name="company",
            name="bank_account_number",
            field=common.localized_iban_field.LocalizedIBANField(
                include_countries=("FI",),
                max_length=34,
                use_nordea_extensions=False,
                verbose_name="bank account number",
            ),
        ),
    ]
