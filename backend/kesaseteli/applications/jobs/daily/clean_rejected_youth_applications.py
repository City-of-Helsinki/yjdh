import logging

from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.enums import YouthApplicationStatus
from applications.models import YouthApplication

LOGGER = logging.getLogger(__name__)


class Job(DailyJob):
    help = "Clean all rejected youth applications older than one year"

    def execute(self):
        LOGGER.info("Cleaning rejected youth applications older than one year...")
        one_year_from_now = timezone.now() - relativedelta(years=1)
        deleted_count, _ = YouthApplication.objects.filter(
            created_at__lte=one_year_from_now,
            handled_at__isnull=False,
            status=YouthApplicationStatus.REJECTED,
        ).delete()
        LOGGER.info(f"Cleaned {deleted_count} rejected youth applications.")
