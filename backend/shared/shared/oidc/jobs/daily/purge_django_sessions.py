from django.core import management
from django_extensions.management.jobs import DailyJob


class Job(DailyJob):
    help = "Purge expired Django sessions by running clearsessions management command."

    def execute(self):
        management.call_command("clearsessions", verbosity=0)
