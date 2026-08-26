"""
EmployerApplicationStatus.SUBMITTED was replaced with
EmployerApplicationStatus.IN_HANDLING_QUEUE, so update database contents to match.

In production environment a day or two before this migration was created:
EmployerApplication.objects.values_list("status").distinct().order_by('status')
Out: <QuerySet [('draft',), ('submitted',)]>

So in production only "draft" and "submitted" statuses were used in
EmployerApplication.status field.
"""

from django.db import migrations

SUBMITTED = "submitted"  # Previous EmployerApplicationStatus.SUBMITTED
IN_HANDLING_QUEUE = "in_handling_queue"  # EmployerApplicationStatus.IN_HANDLING_QUEUE


def change_submitted_to_in_handling_queue(apps, schema_editor):
    """
    Forward migration function:
    - Change EmployerApplication.status of "submitted" to "in_handling_queue",
      because EmployerApplicationStatus.SUBMITTED was replaced with
      EmployerApplicationStatus.IN_HANDLING_QUEUE
    """
    employer_application_model = apps.get_model("applications", "EmployerApplication")
    employer_application_model.objects.filter(status=SUBMITTED).update(
        status=IN_HANDLING_QUEUE
    )


def change_in_handling_queue_to_submitted(apps, schema_editor):
    """
    Reverse migration function:
    - Change EmployerApplication.status of "in_handling_queue" back to "submitted".
    """
    employer_application_model = apps.get_model("applications", "EmployerApplication")
    employer_application_model.objects.filter(status=IN_HANDLING_QUEUE).update(
        status=SUBMITTED
    )


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0061_timelineactivitylog"),
    ]

    operations = [
        migrations.RunPython(
            change_submitted_to_in_handling_queue,
            change_in_handling_queue_to_submitted,
        ),
    ]
