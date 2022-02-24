from django.db import migrations, models
from applications.enums import YouthApplicationStatus


def set_youth_application_statuses(apps, schema_editor):
    youth_application_model = apps.get_model("applications", "YouthApplication")
    youth_application_model.objects.filter(receipt_confirmed_at__isnull=True).update(
        status=YouthApplicationStatus.SUBMITTED.value
    )
    youth_application_model.objects.filter(receipt_confirmed_at__isnull=False).update(
        status=YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value
    )


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0023_index_youth_application_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="youthapplication",
            name="status",
            field=models.CharField(
                choices=[
                    ("submitted", "Submitted"),
                    ("awaiting_manual_processing", "Awaiting manual processing"),
                    (
                        "additional_information_requested",
                        "Additional information requested",
                    ),
                    (
                        "additional_information_provided",
                        "Additional information provided",
                    ),
                    ("accepted", "Accepted"),
                    ("rejected", "Rejected"),
                ],
                default=YouthApplicationStatus.SUBMITTED.value,
                max_length=64,
                verbose_name="status",
            ),
        ),
        migrations.RunPython(set_youth_application_statuses, migrations.RunPython.noop),
    ]
