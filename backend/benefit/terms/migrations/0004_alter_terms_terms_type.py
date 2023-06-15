# Generated by Django 3.2.18 on 2023-05-26 07:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terms', '0003_add_applicantconsent_ordering'),
    ]

    operations = [
        migrations.AlterField(
            model_name='terms',
            name='terms_type',
            field=models.CharField(choices=[('terms_of_service', 'Terms of service - shown at login'), ('applicant_terms', 'Terms of application - show at application submit'), ('handler_terms', 'Terms of application for handler - show at application submit for handler')], default='applicant_terms', max_length=64, verbose_name='type of terms'),
        ),
    ]