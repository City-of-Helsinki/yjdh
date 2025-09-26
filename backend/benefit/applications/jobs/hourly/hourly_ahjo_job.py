from django.conf import settings
from django.core.management import call_command
from django_extensions.management.jobs import HourlyJob

from applications.enums import AhjoRequestType

"""
A hourly job to refresh the Ahjo access token via the refresh token saved in the Django database.
If the Ahjo automation is enabled, the job will also send requests to Ahjo to get decision details.
"""  # noqa: E501


class Job(HourlyJob):
    help = "Hourly Ahjo jobs are executed here."

    def execute(self):
        call_command("refresh_ahjo_token")

        retry_threshold = settings.AHJO_RETRY_FAILED_OLDER_THAN

        if settings.ENABLE_AHJO_AUTOMATION:
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.OPEN_CASE,
                retry_failed_older_than=retry_threshold,
            )
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.SEND_DECISION_PROPOSAL,
                retry_failed_older_than=retry_threshold,
            )
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.UPDATE_APPLICATION,
                retry_failed_older_than=retry_threshold,
            )

            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.DELETE_APPLICATION,
                retry_failed_older_than=retry_threshold,
            )
            call_command(
                "send_ahjo_requests", request_type=AhjoRequestType.GET_DECISION_DETAILS
            )
            call_command(
                "send_ahjo_requests",
                request_type=AhjoRequestType.GET_DECISION_DETAILS,
                retry_failed_older_than=retry_threshold,
            )
