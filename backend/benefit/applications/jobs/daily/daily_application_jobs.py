from django.core.management import call_command
from django_extensions.management.jobs import DailyJob

"""
Daily job to delete cancelled applications.

Run as a cronjob every day to delete applications that have
been in the cancelled state for more than 30 days.
"""


class Job(DailyJob):
    help = "Django daily jobs are executed here."

    def execute(self):
        call_command("delete_applications", keep=30, status="cancelled")
        call_command("delete_applications", keep=180, status="draft")
        call_command("check_drafts_to_delete", notify=14, keep=180)
        call_command("get_decision_maker")