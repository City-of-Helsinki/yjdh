from django.core.management import call_command
from django_extensions.management.jobs import DailyJob

from applications.enums import ApplicationStatus

"""
Daily job to delete cancelled applications.

Run as a cronjob every day to delete applications that have
been in the cancelled state for more than 30 days.
"""


class Job(DailyJob):
    help = "Django daily jobs are executed here."

    def execute(self):
        call_command(
            "delete_applications", keep=30, status=[ApplicationStatus.CANCELLED]
        )
        call_command("delete_applications", keep=180, status=[ApplicationStatus.DRAFT])
        call_command(
            "delete_applications",
            keep=3651,
            status=[
                ApplicationStatus.ARCHIVAL,
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
            ],
        )
        call_command("check_drafts_to_delete", notify=14, keep=180)
        call_command("get_decision_maker")
        call_command("get_signer")
        call_command("check_and_notify_ending_benefits", notify=30)
