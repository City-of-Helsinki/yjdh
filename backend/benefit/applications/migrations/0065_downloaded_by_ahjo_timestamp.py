# Generated by Django 3.2.23 on 2024-04-12 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0064_decision_proposal_drafts'),
    ]

    operations = [
        migrations.AddField(
            model_name='attachment',
            name='downloaded_by_ahjo',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicalattachment',
            name='downloaded_by_ahjo',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]