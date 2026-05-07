"""
This migration removes the sequences.sequence model created by django-sequences v3.0
package's migrations:
- https://github.com/aaugustin/django-sequences/tree/3.0/src/sequences/migrations
"""

from django.db import migrations


def delete_sequences_sequence_model(apps, schema_editor):
    try:
        Sequence = apps.get_model("sequences", "Sequence")
    except LookupError:
        # If running migrations to a new database without django-sequences
        # package being in INSTALLED_APPS anymore, the Sequence model won't be found.
        # In that case just skip the deletion since the model doesn't exist.
        return
    schema_editor.delete_model(Sequence)


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0058_employerapplication_bank_address_and_more"),
    ]

    operations = [
        migrations.RunPython(
            delete_sequences_sequence_model,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
