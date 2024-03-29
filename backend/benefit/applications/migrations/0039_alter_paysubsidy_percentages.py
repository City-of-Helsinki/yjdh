# Generated by Django 3.2.18 on 2023-08-24 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0038_reviewstate_approval'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='additional_pay_subsidy_percent',
            field=models.IntegerField(blank=True, choices=[(50, '50%'), (70, '70%'), (100, '100%')], null=True, verbose_name='Pay subsidy percent for second pay subsidy grant'),
        ),
        migrations.AlterField(
            model_name='application',
            name='pay_subsidy_percent',
            field=models.IntegerField(blank=True, choices=[(50, '50%'), (70, '70%'), (100, '100%')], null=True, verbose_name='Pay subsidy percent'),
        ),
        migrations.AlterField(
            model_name='historicalapplication',
            name='additional_pay_subsidy_percent',
            field=models.IntegerField(blank=True, choices=[(50, '50%'), (70, '70%'), (100, '100%')], null=True, verbose_name='Pay subsidy percent for second pay subsidy grant'),
        ),
        migrations.AlterField(
            model_name='historicalapplication',
            name='pay_subsidy_percent',
            field=models.IntegerField(blank=True, choices=[(50, '50%'), (70, '70%'), (100, '100%')], null=True, verbose_name='Pay subsidy percent'),
        ),
    ]
