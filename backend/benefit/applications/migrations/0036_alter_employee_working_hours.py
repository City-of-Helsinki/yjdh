from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0035_alter_applicationbatch_handler"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employee",
            name="working_hours",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=5,
                null=True,
                verbose_name="working hour",
            ),
        ),
    ]
