# Generated by Django 3.2.23 on 2024-04-09 12:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0063_decision_proposal_template_changes"),
    ]

    operations = [
        migrations.CreateModel(
            name='AhjoDecisionProposalDraft',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='time created')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='time modified')),
                ('review_step', models.CharField(blank=True, choices=[(1, 'step 1'), (2, 'step 2'), (3, 'step 3'), (4, 'submitted')], default=1, max_length=64, null=True, verbose_name='step of the draft proposal')),
                ('status', models.CharField(blank=True, choices=[('accepted', 'accepted'), ('rejected', 'rejected')], max_length=64, null=True, verbose_name='Proposal status')),
                ('log_entry_comment', models.TextField(blank=True, null=True, verbose_name='Log entry comment')),
                ('granted_as_de_minimis_aid', models.BooleanField(default=False, null=True)),
                ('handler_role', models.CharField(blank=True, choices=[('handler', 'Helsinki-benefit handler'), ('manager', 'Team manager')], max_length=64, null=True, verbose_name='Handler role')),
                ('decision_text', models.TextField(blank=True, null=True, verbose_name='Decision text content')),
                ('justification_text', models.TextField(blank=True, null=True, verbose_name='Justification text content')),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='decision_proposal_draft', to='applications.application', verbose_name='application')),
            ],
            options={
                'verbose_name': 'decision_proposal_draft',
                'verbose_name_plural': 'decision_proposal_drafts',
                'db_table': 'bf_applications_decision_proposal_draft',
            },
        ),
    ]
