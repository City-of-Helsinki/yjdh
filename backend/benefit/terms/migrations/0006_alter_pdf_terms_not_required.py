# Generated by Django 3.2.18 on 2023-08-15 13:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terms', '0005_add_support_for_md_terms'),
    ]

    operations = [
        migrations.AlterField(
            model_name='terms',
            name='terms_pdf_en',
            field=models.FileField(blank=True, upload_to='', verbose_name='english terms (pdf file)'),
        ),
        migrations.AlterField(
            model_name='terms',
            name='terms_pdf_fi',
            field=models.FileField(blank=True, upload_to='', verbose_name='finnish terms (pdf file)'),
        ),
        migrations.AlterField(
            model_name='terms',
            name='terms_pdf_sv',
            field=models.FileField(blank=True, upload_to='', verbose_name='swedish terms (pdf file)'),
        ),
    ]