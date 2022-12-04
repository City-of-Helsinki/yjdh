from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.models import Attachment


class Job(DailyJob):
    help = "Clean attachments older than one year."

    def execute(self):
        year_from_now = timezone.now() - relativedelta(years=1)
        attachments = Attachment.objects.filter(created_at__lte=year_from_now)

        for attachment in attachments:
            attachment.attachment_file.delete()

        attachments.delete()
