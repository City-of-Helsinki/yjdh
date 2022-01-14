# Generated by Django 3.2.4 on 2022-01-14 11:58

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TetPostingTemp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('owner', models.CharField(max_length=100)),
                ('data', django.contrib.postgres.fields.jsonb.JSONField(verbose_name='posting data')),
            ],
        ),
    ]
