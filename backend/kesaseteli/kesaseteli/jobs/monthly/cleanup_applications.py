import logging

from django.core.management import call_command
from django_extensions.management.jobs import MonthlyJob

LOGGER = logging.getLogger(__name__)


class Job(MonthlyJob):
    help = "Cleanup draft employer applications and expired youth applications"

    def execute(self):
        LOGGER.info("Running application cleanup job...")
        call_command("cleanup_applications", "--employer-drafts", "--youth-expired")
        LOGGER.info("Done.")
