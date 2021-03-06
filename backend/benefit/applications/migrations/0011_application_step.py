# Generated by Django 3.2.4 on 2021-08-04 04:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0010_application_missing_applicant_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="application_step",
            field=models.CharField(
                choices=[
                    ("step_1", "Step 1 - company details"),
                    ("step_2", "Step 2 - employee details"),
                    ("step_3", "Step 3 - attachments"),
                    ("step_4", "Step 4 - summary"),
                    ("step_5", "Step 5 - power of attorney"),
                    ("step_6", "Step 6 - terms and send"),
                ],
                default="step_1",
                max_length=64,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicalapplication",
            name="application_step",
            field=models.CharField(
                choices=[
                    ("step_1", "Step 1 - company details"),
                    ("step_2", "Step 2 - employee details"),
                    ("step_3", "Step 3 - attachments"),
                    ("step_4", "Step 4 - summary"),
                    ("step_5", "Step 5 - power of attorney"),
                    ("step_6", "Step 6 - terms and send"),
                ],
                default="step_1",
                max_length=64,
            ),
            preserve_default=False,
        ),
    ]
