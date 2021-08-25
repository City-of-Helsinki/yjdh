from django.conf import settings
from django_extensions.management.jobs import MonthlyJob

from shared.audit_log.tasks import clear_audit_log_entries


class Job(MonthlyJob):
    help = (
        "Clear AuditLogEntry which is already sent to Elasticsearch,"
        "only clear if settings.CLEAR_AUDIT_LOG_ENTRIES is set to True (default: False)"
    )

    def execute(self):
        if settings.CLEAR_AUDIT_LOG_ENTRIES:
            clear_audit_log_entries()
