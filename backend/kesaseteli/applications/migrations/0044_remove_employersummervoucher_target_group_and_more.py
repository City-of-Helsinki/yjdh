from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0043_migrate_target_group_data"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="employersummervoucher",
            name="target_group",
        ),
        migrations.RemoveField(
            model_name="historicalemployersummervoucher",
            name="target_group",
        ),
    ]
