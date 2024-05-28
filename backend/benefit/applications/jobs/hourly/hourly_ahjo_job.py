from django.conf import settings
from django.core.management import call_command
from django_extensions.management.jobs import HourlyJob

from applications.enums import AhjoRequestType

"""
A hourly job to refresh the Ahjo access token via the refresh token saved in the Django database.
If the Ahjo automation is enabled, the job will also send requests to Ahjo to get decision details.
"""


class Job(HourlyJob):
    help = "Hourly Ahjo jobs are executed here."

    def execute(self):
        call_command("refresh_ahjo_token")

        if settings.ENABLE_AHJO_AUTOMATION:
            call_command(
                "send_ahjo_requests", request_type=AhjoRequestType.GET_DECISION_DETAILS
            )
