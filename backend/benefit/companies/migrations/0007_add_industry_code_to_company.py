# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0006_add_industry_to_company'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='industry_code',
            field=models.CharField(blank=True, default='', max_length=10, verbose_name='industry TOL code'),
        ),
    ]
