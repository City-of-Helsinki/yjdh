from django.core.management import call_command
from django_extensions.management.jobs import DailyJob

from applications.enums import ApplicationStatus

"""
Run as a cronjob every day to
- check if drafts should be deleted
- get decision maker from Ahjo
- get signer
- check if applicants should be notified about ending benefits
- request payslip after 5 months
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
        call_command("request_payslip", notify=150)
