import logging

from django.core import management
from django_extensions.management.jobs import DailyJob

LOGGER = logging.getLogger(__name__)


class Job(DailyJob):
    help = "Purge expired Django sessions by running clearsessions management command."

    def execute(self):
        LOGGER.info("Purging expired Django sessions...")
        management.call_command("clearsessions", verbosity=0)
        LOGGER.info("Purged expired Django sessions.")
