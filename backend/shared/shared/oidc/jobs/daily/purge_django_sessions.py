from django_extensions.management.jobs import DailyJob
from django.core import management


class Job(DailyJob):
    help = "Purge expired Django sessions by running clearsessions management command."

    def execute(self):
        management.call_command("clearsessions", verbosity=0)
