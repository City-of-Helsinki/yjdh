import logging
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from elasticsearch import Elasticsearch

from shared.audit_log.models import AuditLogEntry

ES_STATUS_CREATED = "created"
LOGGER = logging.getLogger(__name__)


def send_audit_log_to_elastic_search():
    if not (
        settings.ELASTICSEARCH_HOST
        and settings.ELASTICSEARCH_PORT
        and settings.ELASTICSEARCH_APP_AUDIT_LOG_INDEX
        and settings.ELASTICSEARCH_USERNAME
        and settings.ELASTICSEARCH_PASSWORD
    ):
        LOGGER.warning(
            "Trying to send audit log to Elasticsearch without proper configuration, process skipped"
        )
        return
    es = Elasticsearch(
        [
            {
                "host": settings.ELASTICSEARCH_HOST,
                "port": settings.ELASTICSEARCH_PORT,
                "use_ssl": True,
            }
        ],
        http_auth=(settings.ELASTICSEARCH_USERNAME, settings.ELASTICSEARCH_PASSWORD),
    )
    entries = AuditLogEntry.objects.filter(is_sent=False).order_by("created_at")

    for entry in entries:
        message_body = entry.message.copy()
        message_body["@timestamp"] = entry.message["audit_event"][
            "date_time"
        ]  # required by ES
        rs = es.index(
            index=settings.ELASTICSEARCH_APP_AUDIT_LOG_INDEX,
            id=entry.id,
            body=message_body,
            op_type="create",
        )
        if rs.get("result") == ES_STATUS_CREATED:
            entry.is_sent = True
            entry.save()


def clear_audit_log_entries(days_to_keep=30):
    # Only remove entries older than `X` days
    sent_entries = AuditLogEntry.objects.filter(
        is_sent=True, created_at__lte=(timezone.now() - timedelta(days=days_to_keep))
    )
    sent_entries.delete()
