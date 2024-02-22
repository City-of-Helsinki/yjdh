# Generated by Django 3.2.23 on 2024-02-14 10:34

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0056_decisionproposaltemplatesection'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='attachment_type',
            field=models.CharField(choices=[('employment_contract', 'employment contract'), ('pay_subsidy_decision', 'pay subsidy decision'), ('commission_contract', 'commission contract'), ('education_contract', 'education contract of the apprenticeship office'), ('helsinki_benefit_voucher', 'helsinki benefit voucher'), ('employee_consent', 'employee consent'), ('full_application', 'full application'), ('other_attachment', 'other attachment'), ('pdf_summary', 'pdf summary'), ('decision_text_xml', 'public decision text xml attachment'), ('decision_text_secret_xml', 'non-public decision text xml attachment')], max_length=64, verbose_name='attachment type in business rules'),
        ),
        migrations.AlterField(
            model_name='historicalattachment',
            name='attachment_type',
            field=models.CharField(choices=[('employment_contract', 'employment contract'), ('pay_subsidy_decision', 'pay subsidy decision'), ('commission_contract', 'commission contract'), ('education_contract', 'education contract of the apprenticeship office'), ('helsinki_benefit_voucher', 'helsinki benefit voucher'), ('employee_consent', 'employee consent'), ('full_application', 'full application'), ('other_attachment', 'other attachment'), ('pdf_summary', 'pdf summary'), ('decision_text_xml', 'public decision text xml attachment'), ('decision_text_secret_xml', 'non-public decision text xml attachment')], max_length=64, verbose_name='attachment type in business rules'),
        ),
        migrations.CreateModel(
            name='AhjoDecisionText',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='time created')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='time modified')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('decision_type', models.CharField(choices=[('accepted_decision', 'An accepted decision'), ('denied_decision', 'A denied decision')], default='accepted_decision', max_length=64, verbose_name='type of the decision')),
                ('language', models.CharField(choices=[('fi', 'suomi'), ('sv', 'svenska'), ('en', 'english')], default='fi', max_length=2)),
                ('decision_text', models.TextField(verbose_name='decision text content')),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='applications.application', verbose_name='application')),
            ],
            options={
                'verbose_name': 'ahjo decision text',
                'verbose_name_plural': 'ahjo decision texts',
                'db_table': 'bf_applications_ahjo_decision_text',
            },
        ),
    ]