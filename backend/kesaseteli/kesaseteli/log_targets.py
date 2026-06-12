import logging

from resilient_logger.sources.django_audit_log_source_entry import (
    DjangoAuditLogSourceEntry,
)
from resilient_logger.sources.resilient_log_source_entry import ResilientLogSourceEntry
from resilient_logger.targets.elasticsearch_log_target import ElasticsearchLogTarget

logger = logging.getLogger(__name__)


class RoutedElasticsearchLogTarget(ElasticsearchLogTarget):
    """
    Custom Elasticsearch log target that routes entries to different indices
    depending on the class type of the log source.
    """

    def __init__(self, *args, resilient_index: str, auditlog_index: str, **kwargs):
        """
        Initialize the log target with resilient and audit log indices.

        Args:
            *args: Positional arguments to pass to the parent class.
            resilient_index: The Elasticsearch index to use for resilient logs.
            auditlog_index: The Elasticsearch index to use for audit logs.
            **kwargs: Keyword arguments to pass to the parent class.
        """
        super().__init__(*args, es_index=auditlog_index, **kwargs)
        self._resilient_index = resilient_index
        self._auditlog_index = auditlog_index

    def submit(self, entry) -> bool:
        """
        Submit a log entry to Elasticsearch.

        Args:
            entry: The log entry to submit.

        Returns:
            bool: True if the log entry was submitted successfully, False otherwise.
        """
        # Dynamically switch the index based on the source class type
        if isinstance(entry, ResilientLogSourceEntry):
            self._index = self._resilient_index
        elif isinstance(entry, DjangoAuditLogSourceEntry):
            self._index = self._auditlog_index
        else:
            logger.warning(
                f"Unknown log source type: {type(entry).__name__}. "
                "Defaulting to audit log index."
            )
            self._index = self._auditlog_index

        return super().submit(entry)
