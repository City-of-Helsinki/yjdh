from django.db import migrations, models
import shared.common.validators


def remove_deleted_schools(apps, schema_editor):
    school_model = apps.get_model("applications", "School")
    school_model.objects.filter(deleted_at__isnull=False).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0016_add_youth_application_field_validation"),
    ]

    operations = [
        migrations.RunPython(remove_deleted_schools, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="school",
            name="deleted_at",
        ),
        migrations.AlterField(
            model_name="school",
            name="name",
            field=models.CharField(
                db_index=True,
                max_length=256,
                unique=True,
                validators=[shared.common.validators.validate_name],
            ),
        ),
    ]
