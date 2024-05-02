from django.conf import settings
from django.core.management import call_command
from django_extensions.management.jobs import QuarterHourlyJob

from applications.enums import AhjoRequestType


class Job(QuarterHourlyJob):
    help = "Quarter hourly Ahjo integration jobs are executed here."

    def execute(self):
        if settings.ENABLE_AHJO_AUTOMATION:
            call_command("send_ahjo_requests", request_type=AhjoRequestType.OPEN_CASE)
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.SEND_DECISION_PROPOSAL,
            )
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.SEND_DECISION_PROPOSAL,
            )
            call_command(
                "send_ahjo_requests", request_type=AhjoRequestType.UPDATE_APPLICATION
            )
