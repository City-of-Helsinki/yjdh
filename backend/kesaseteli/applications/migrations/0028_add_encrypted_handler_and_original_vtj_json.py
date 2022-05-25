from django.db import migrations, transaction
import encrypted_fields.fields
import shared.common.validators


def forward_migrate_encrypted_vtj_json_fields(apps, schema_editor):
    youth_application_model = apps.get_model("applications", "YouthApplication")
    with transaction.atomic():
        objects_to_update = youth_application_model.objects.all()
        for youth_application in objects_to_update:
            youth_application.encrypted_original_vtj_json = (
                youth_application.encrypted_vtj_json
            )
            youth_application.encrypted_handler_vtj_json = (
                youth_application.encrypted_vtj_json
            )
        youth_application_model.objects.bulk_update(
            objects_to_update,
            ["encrypted_original_vtj_json", "encrypted_handler_vtj_json"],
        )


def backward_migrate_encrypted_vtj_json_fields(apps, schema_editor):
    youth_application_model = apps.get_model("applications", "YouthApplication")
    with transaction.atomic():
        objects_to_update = youth_application_model.objects.all()
        for youth_application in objects_to_update:
            youth_application.encrypted_vtj_json = (
                youth_application.encrypted_original_vtj_json
            )
        youth_application_model.objects.bulk_update(
            objects_to_update,
            ["encrypted_vtj_json"],
        )


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0027_add_additional_info"),
    ]

    operations = [
        migrations.AddField(
            model_name="youthapplication",
            name="encrypted_handler_vtj_json",
            field=encrypted_fields.fields.EncryptedCharField(
                blank=True,
                help_text="VTJ JSON used for accepting/rejecting by human or machine",
                max_length=1048576,
                null=True,
                validators=[shared.common.validators.validate_optional_json],
                verbose_name="handler vtj json",
            ),
        ),
        migrations.AddField(
            model_name="youthapplication",
            name="encrypted_original_vtj_json",
            field=encrypted_fields.fields.EncryptedCharField(
                blank=True,
                help_text="VTJ JSON used for automatic processing of new youth application",
                max_length=1048576,
                null=True,
                validators=[shared.common.validators.validate_optional_json],
                verbose_name="original vtj json",
            ),
        ),
        migrations.RunPython(
            forward_migrate_encrypted_vtj_json_fields,
            backward_migrate_encrypted_vtj_json_fields,
        ),
    ]
