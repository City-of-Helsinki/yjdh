import logging

from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.models import YouthApplication

LOGGER = logging.getLogger(__name__)


class Job(DailyJob):
    help = "Clean all inactive youth applications older than week."

    def execute(self):
        LOGGER.info("Cleaning all inactive youth applications older than week...")
        one_week_from_now = timezone.now() - relativedelta(weeks=1)
        deleted_count, _ = YouthApplication.objects.filter(
            created_at__lte=one_week_from_now, receipt_confirmed_at__isnull=True
        ).delete()
        LOGGER.info(f"Cleaned {deleted_count} inactive youth applications.")
