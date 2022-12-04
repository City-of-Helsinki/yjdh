from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django_extensions.management.jobs import DailyJob

from applications.models import EmployerApplication


class Job(DailyJob):
    help = "Clean applications older than five years."

    def execute(self):
        five_years_from_now = timezone.now() - relativedelta(years=5)
        EmployerApplication.objects.filter(created_at__lte=five_years_from_now).delete()
