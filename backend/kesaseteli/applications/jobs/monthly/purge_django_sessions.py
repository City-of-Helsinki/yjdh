from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import MonthlyJob
from django.core import management

from applications.models import Attachment


class Job(MonthlyJob):
    help = "Purge expired Django sessions by running clearsessions management command."

    def execute(self):
        management.call_command("clearsessions", verbosity=0)
