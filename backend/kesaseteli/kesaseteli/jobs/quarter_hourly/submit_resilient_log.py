import logging

from django.core.management import call_command
from django_extensions.management.jobs import QuarterHourlyJob

LOGGER = logging.getLogger(__name__)


class Job(QuarterHourlyJob):
    help = "Submit resilient log entries to Elasticsearch every 15 minutes"

    def execute(self):
        LOGGER.info("Submitting resilient log entries to Elasticsearch...")
        call_command("submit_unsent_entries")
        LOGGER.info("Done.")
