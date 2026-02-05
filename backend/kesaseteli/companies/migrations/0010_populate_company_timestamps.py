from django.db import migrations

from companies.migrations.helpers.company_timestamps import populate_company_timestamps


def populate_company_timestamps_with_apps(apps, schema_editor):
    """
    Populate Company.created_at and Company.modified_at fields based on the
    earliest EmployerApplication.created_at that references each Company.

    Companies without any EmployerApplication references are left unchanged,
    because there is no data to determine appropriate timestamps for them.
    """
    company_model = apps.get_model("companies", "Company")
    populate_company_timestamps(company_model)


class Migration(migrations.Migration):
    dependencies = [
        ("companies", "0009_company_created_at_company_modified_at"),
        ("applications", "0045_employersummervoucher_job_type_and_more"),
    ]

    operations = [
        migrations.RunPython(
            populate_company_timestamps_with_apps,
            migrations.RunPython.noop,
        ),
    ]
