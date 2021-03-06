# Generated by Django 3.2.4 on 2021-07-06 12:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0002_summer_voucher_attachments"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="contact_person_email",
            field=models.EmailField(
                blank=True, max_length=254, verbose_name="contact person email"
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="contact_person_name",
            field=models.CharField(
                blank=True, max_length=256, verbose_name="contact person name"
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="contact_person_phone_number",
            field=models.CharField(
                blank=True, max_length=64, verbose_name="contact person phone number"
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="is_separate_invoicer",
            field=models.BooleanField(
                default=False,
                help_text="invoicing is not handled by the contact person",
                verbose_name="is separate invoicer",
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="street_address",
            field=models.CharField(
                blank=True, max_length=256, verbose_name="invoicer work address"
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="contact_person_email",
            field=models.EmailField(
                blank=True, max_length=254, verbose_name="contact person email"
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="contact_person_name",
            field=models.CharField(
                blank=True, max_length=256, verbose_name="contact person name"
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="contact_person_phone_number",
            field=models.CharField(
                blank=True, max_length=64, verbose_name="contact person phone number"
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="is_separate_invoicer",
            field=models.BooleanField(
                default=False,
                help_text="invoicing is not handled by the contact person",
                verbose_name="is separate invoicer",
            ),
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="street_address",
            field=models.CharField(
                blank=True, max_length=256, verbose_name="invoicer work address"
            ),
        ),
    ]
