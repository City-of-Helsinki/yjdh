# Generated by Django 4.2.11 on 2024-11-13 08:21

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0088_ahjodecisiontext_signer_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="ahjodecisionproposaldraft",
            name="signer_id",
            field=models.CharField(
                blank=True,
                max_length=64,
                null=True,
                verbose_name="the ID of the signer",
            ),
        ),
        migrations.AddField(
            model_name="ahjodecisionproposaldraft",
            name="signer_name",
            field=models.TextField(
                blank=True, null=True, verbose_name="the name of the signer"
            ),
        ),
    ]