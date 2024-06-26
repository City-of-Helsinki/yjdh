# Generated by Django 3.2.23 on 2024-04-16 13:46

import common.utils
from django.db import migrations
import encrypted_fields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0033_add_non_vtj_birthdate_and_home_municipality'),
    ]

    operations = [
        migrations.AlterField(
            model_name='youthapplication',
            name='social_security_number',
            field=encrypted_fields.fields.SearchField(blank=True, db_index=True, encrypted_field_name='encrypted_social_security_number', hash_key='ee235e39ebc238035a6264c063dd829d4b6d2270604b57ee1f463e676ec44669', max_length=66, null=True, validators=[common.utils.validate_optional_finnish_social_security_number]),
        ),
    ]
