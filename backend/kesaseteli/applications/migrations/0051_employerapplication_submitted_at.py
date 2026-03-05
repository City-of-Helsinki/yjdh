from django.db import migrations, models
from django.db.models import F

from applications.enums import EmployerApplicationStatus


def fill_submitted_at(apps, schema_editor):
    """
    Clear EmployerApplication submitted_at for DRAFT status, and
    set it to modified_at for all others (i.e. SUBMITTED in production in early 2026).

    Why this should work for production data when going to production during spring 2026?
     - Because there are no other states used in production except DRAFT and SUBMITTED.
    """
    employer_app_model = apps.get_model("applications", "EmployerApplication")
    employer_app_model.objects.filter(status=EmployerApplicationStatus.DRAFT).update(
        submitted_at=None
    )
    employer_app_model.objects.exclude(status=EmployerApplicationStatus.DRAFT).update(
        submitted_at=F("modified_at")
    )


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0050_remove_all_remaining_historical_models"),
    ]

    operations = [
        migrations.AddField(
            model_name="employerapplication",
            name="submitted_at",
            field=models.DateTimeField(
                blank=True,
                null=True,
                verbose_name="timestamp when employer application was submitted",
            ),
        ),
        migrations.RunPython(fill_submitted_at, migrations.RunPython.noop),
    ]
