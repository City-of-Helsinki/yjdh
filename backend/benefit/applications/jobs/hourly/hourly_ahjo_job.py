from django.core.management import call_command
from django_extensions.management.jobs import HourlyJob

"""
A hourly job to refresh the Ahjo access token via the refresh token saved in the Django database.
"""


class Job(HourlyJob):
    help = "Hourly Ahjo refresh jobs are executed here."

    def execute(self):
        call_command("refresh_ahjo_token")
