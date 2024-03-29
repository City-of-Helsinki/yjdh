# Generated by Django 3.2.23 on 2023-12-20 14:27

from django.db import migrations
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0046_add_ahjo_ids_to_application'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='company_contact_person_phone_number',
            field=phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, region=None, verbose_name="company contact person's phone number"),
        ),
        migrations.AlterField(
            model_name='employee',
            name='phone_number',
            field=phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, region=None, verbose_name='phone number'),
        ),
        migrations.AlterField(
            model_name='historicalapplication',
            name='company_contact_person_phone_number',
            field=phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, region=None, verbose_name="company contact person's phone number"),
        ),
    ]
