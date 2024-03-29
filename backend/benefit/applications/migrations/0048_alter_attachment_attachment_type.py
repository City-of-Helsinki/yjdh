# Generated by Django 3.2.23 on 2023-12-20 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0047_remove_phone_number_restriction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='attachment_type',
            field=models.CharField(choices=[('employment_contract', 'employment contract'), ('pay_subsidy_decision', 'pay subsidy decision'), ('commission_contract', 'commission contract'), ('education_contract', 'education contract of the apprenticeship office'), ('helsinki_benefit_voucher', 'helsinki benefit voucher'), ('employee_consent', 'employee consent'), ('full_application', 'full application'), ('other_attachment', 'other attachment'), ('pdf_summary', 'pdf summary')], max_length=64, verbose_name='attachment type in business rules'),
        ),
    ]
