import logging

from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.models import Attachment

LOGGER = logging.getLogger(__name__)


class Job(DailyJob):
    help = "Clean attachments older than one year."

    def execute(self):
        LOGGER.info("Cleaning attachments older than one year...")
        year_from_now = timezone.now() - relativedelta(years=1)
        attachments = Attachment.objects.filter(created_at__lte=year_from_now)

        for attachment in attachments:
            attachment.attachment_file.delete()

        deleted_count, _ = attachments.delete()
        LOGGER.info(f"Cleaned {deleted_count} attachments.")
