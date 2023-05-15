import logging

from django.conf import settings
from django_extensions.management.jobs import MonthlyJob

from shared.audit_log.tasks import clear_audit_log_entries

LOGGER = logging.getLogger(__name__)


class Job(MonthlyJob):
    help = (
        "Clear AuditLogEntry which is already sent to Elasticsearch,"
        "only clear if settings.CLEAR_AUDIT_LOG_ENTRIES is set to True (default: False)"
    )

    def execute(self):
        if settings.CLEAR_AUDIT_LOG_ENTRIES:
            LOGGER.info("Removing sent expired audit log entries...")
            deleted_count = clear_audit_log_entries()
            LOGGER.info(f"Removed {deleted_count} sent expired audit log entries.")
        else:
            LOGGER.info(
                "Setting CLEAR_AUDIT_LOG_ENTRIES is False, "
                "skipping clearing audit log entries."
            )
