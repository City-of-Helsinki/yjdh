from django.conf import settings
from django_extensions.management.jobs import QuarterHourlyJob

from shared.audit_log.tasks import send_audit_log_to_elastic_search


class Job(QuarterHourlyJob):
    help = "Send AuditLogEntry to centralized log center every 15 minutes"

    def execute(self):
        if settings.ENABLE_SEND_AUDIT_LOG:
            send_audit_log_to_elastic_search()
