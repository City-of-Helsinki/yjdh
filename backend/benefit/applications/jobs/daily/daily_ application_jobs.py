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
        call_command("delete_cancelled")
