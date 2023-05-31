from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0030_encrypt_employee_first_name_and_last_name")
    ]

    operations = [
        migrations.AddField("ApplicationBatch", "expert_inspector_title", models.CharField(
            blank=True,
            max_length=64,
            verbose_name="Expert inspector's title",
        )),
    ]
