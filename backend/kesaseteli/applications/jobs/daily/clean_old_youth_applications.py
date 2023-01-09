import logging

from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.models import YouthApplication

LOGGER = logging.getLogger(__name__)


class Job(DailyJob):
    help = "Clean all youth applications older than five years."

    def execute(self):
        LOGGER.info("Cleaning youth applications older than five years...")
        five_years_from_now = timezone.now() - relativedelta(years=5)
        deleted_count, _ = YouthApplication.objects.filter(
            created_at__lte=five_years_from_now
        ).delete()
        LOGGER.info(f"Cleaned {deleted_count} youth applications.")
