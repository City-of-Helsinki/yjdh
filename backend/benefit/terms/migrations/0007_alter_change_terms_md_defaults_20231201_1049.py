# Generated by Django 3.2.23 on 2023-12-01 08:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terms', '0006_alter_pdf_terms_not_required'),
    ]

    operations = [
        migrations.AlterField(
            model_name='terms',
            name='terms_md_en',
            field=models.TextField(blank=True, default='', verbose_name='English terms (md)'),
        ),
        migrations.AlterField(
            model_name='terms',
            name='terms_md_fi',
            field=models.TextField(blank=True, default='', verbose_name='Finnish terms (md)'),
        ),
        migrations.AlterField(
            model_name='terms',
            name='terms_md_sv',
            field=models.TextField(blank=True, default='', verbose_name='Swedish terms (md)'),
        ),
    ]
