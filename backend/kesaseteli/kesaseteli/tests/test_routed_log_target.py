from unittest import mock

from resilient_logger.sources.django_audit_log_source import DjangoAuditLogSource
from resilient_logger.sources.resilient_log_source import ResilientLogSource

from kesaseteli.log_targets import RoutedElasticsearchLogTarget


@mock.patch("resilient_logger.targets.elasticsearch_log_target.Elasticsearch")
def test_routed_elasticsearch_log_target_routes_correctly(mock_es):
    target = RoutedElasticsearchLogTarget(
        es_username="test-user",
        es_password="test-password",
        es_host="localhost",
        resilient_index="resilient-index-name",
        auditlog_index="auditlog-index-name",
    )

    mock_client = mock_es.return_value
    mock_client.index.return_value = {"result": "created"}

    # 1. ResilientLogSource -> resilient-index-name
    resilient_entry = mock.Mock(spec=ResilientLogSource)
    resilient_entry.get_document.return_value = {"audit_event": {"message": "auth log"}}

    success = target.submit(resilient_entry)
    assert success is True
    mock_client.index.assert_called_with(
        index="resilient-index-name",
        id=mock.ANY,
        document={"audit_event": {"message": "auth log"}},
        op_type="create",
    )

    # 2. DjangoAuditLogSource -> auditlog-index-name
    audit_entry = mock.Mock(spec=DjangoAuditLogSource)
    audit_entry.get_document.return_value = {"audit_event": {"message": "audit log"}}

    success = target.submit(audit_entry)
    assert success is True
    mock_client.index.assert_called_with(
        index="auditlog-index-name",
        id=mock.ANY,
        document={"audit_event": {"message": "audit log"}},
        op_type="create",
    )

    # 3. Fallback on other class -> auditlog-index-name
    other_entry = mock.Mock()
    other_entry.get_document.return_value = {"audit_event": {"message": "other log"}}

    success = target.submit(other_entry)
    assert success is True
    mock_client.index.assert_called_with(
        index="auditlog-index-name",
        id=mock.ANY,
        document={"audit_event": {"message": "other log"}},
        op_type="create",
    )
