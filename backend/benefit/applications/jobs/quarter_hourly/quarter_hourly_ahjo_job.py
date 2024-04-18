from django.conf import settings
from django.core.management import call_command
from django_extensions.management.jobs import QuarterHourlyJob


class Job(QuarterHourlyJob):
    help = "Quarter hourly Ahjo integration jobs are executed here."

    def execute(self):
        if settings.ENABLE_AHJO_AUTOMATION:
            call_command("send_new_records")
