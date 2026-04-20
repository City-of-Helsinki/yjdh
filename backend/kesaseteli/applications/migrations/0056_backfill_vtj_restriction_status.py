import json

import jsonpath_ng
from django.db import migrations

BATCH_SIZE = 500


# NOTE: The _vtj_values and _is_restricted functions below are duplicated from
# VTJService for Migration Safety. Migrations should be self-contained and
# avoid importing services that import models at the top level, as this can
# lead to circular dependencies and issues with the Django App Registry
# during the migration process.


def _vtj_values(vtj_json_dict, expression):
    """Helper to find values in VTJ JSON using JSONPath."""
    if not vtj_json_dict:
        return []
    matches = jsonpath_ng.parse(expression).find(vtj_json_dict)
    return [match.value for match in matches]


def _is_restricted(vtj_json_dict):
    """
    Detect if the VTJ response indicates a non-disclosure of personal data (turvakielto).
    Mirroring the logic in VTJService.is_response_restricted.
    """
    if not vtj_json_dict or not isinstance(vtj_json_dict, dict):
        return False

    successful = vtj_json_dict.get("Paluukoodi", {}).get("@koodi") == "0000"
    person_found = (
        vtj_json_dict.get("Hakuperusteet", {})
        .get("Henkilotunnus", {})
        .get("@hakuperustePaluukoodi")
        == "1"
    )

    hometown_values = _vtj_values(vtj_json_dict, "$.Henkilo.Kotikunta.Kuntanumero")
    address_values = _vtj_values(
        vtj_json_dict, "$.Henkilo.VakinainenKotimainenLahiosoite.LahiosoiteS"
    )
    restricted_residency = hometown_values == [None] and address_values == [None]

    return successful and person_found and restricted_residency


def backfill_vtj_restriction_status(apps, schema_editor):
    """
    Data migration to backfill is_vtj_data_restricted for historical applications.
    """
    YouthApplication = apps.get_model("applications", "YouthApplication")

    # Process all applications
    queryset = YouthApplication.objects.all()

    apps_to_update = []

    # Use iterator for memory efficiency
    for application in queryset.iterator(chunk_size=BATCH_SIZE):
        vtj_json_str = application.encrypted_original_vtj_json

        try:
            vtj_json_dict = json.loads(vtj_json_str)
        except (json.decoder.JSONDecodeError, TypeError):
            continue

        if _is_restricted(vtj_json_dict):
            if not application.is_vtj_data_restricted:
                application.is_vtj_data_restricted = True
                apps_to_update.append(application)

        # Batch update for database efficiency
        if len(apps_to_update) >= BATCH_SIZE:
            YouthApplication.objects.bulk_update(
                apps_to_update, ["is_vtj_data_restricted"]
            )
            apps_to_update = []

    if apps_to_update:
        YouthApplication.objects.bulk_update(apps_to_update, ["is_vtj_data_restricted"])


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0055_youthapplication_is_vtj_data_restricted"),
    ]

    operations = [
        migrations.RunPython(
            backfill_vtj_restriction_status, migrations.RunPython.noop
        ),
    ]
