from unittest.mock import MagicMock

import pytest
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.test import override_settings

from applications.enums import ActionType, TimelineItemType
from applications.models import Attachment, EmployerApplication, YouthApplication
from applications.services import TimelineService
from common.tests.factories import (
    EmployerApplicationFactory,
    YouthApplicationFactory,
)
from handler_notes.tests.factories import NoteFactory
from shared.common.tests.factories import UserFactory

get_activity_logs_for_application = TimelineService.get_activity_logs_for_application
get_application_timeline_data = TimelineService.get_application_timeline_data
ALLOWED_TIMELINE_FIELDS = TimelineService.ALLOWED_TIMELINE_FIELDS


@pytest.mark.django_db
@override_settings(AUDITLOG_INCLUDE_ALL_MODELS=True)
def test_youth_application_status_change_creates_auditlog_entry():
    """Changing YouthApplication.status via the API creates a LogEntry
    whose changes dict contains a 'status' key with [old, new] strings.
    Guards against accidental removal of auditlog tracking for this field."""
    app = YouthApplicationFactory(status="submitted")
    old_status = app.status

    # Simulate update
    app.status = "accepted"
    app.save()

    ct = ContentType.objects.get_for_model(YouthApplication)
    log_entry = LogEntry.objects.filter(
        content_type=ct, object_pk=str(app.pk), action=LogEntry.Action.UPDATE
    ).last()

    assert log_entry is not None
    assert "status" in log_entry.changes
    assert log_entry.changes["status"] == [old_status, "accepted"]


@pytest.mark.django_db
@override_settings(AUDITLOG_INCLUDE_ALL_MODELS=True)
def test_employer_application_status_change_creates_auditlog_entry():
    """Same guarantee as above, but for EmployerApplication.status."""
    app = EmployerApplicationFactory(status="draft")
    old_status = app.status

    app.status = "submitted"
    app.save()

    ct = ContentType.objects.get_for_model(EmployerApplication)
    log_entry = LogEntry.objects.filter(
        content_type=ct, object_pk=str(app.pk), action=LogEntry.Action.UPDATE
    ).last()

    assert log_entry is not None
    assert "status" in log_entry.changes
    assert log_entry.changes["status"] == [old_status, "submitted"]


@pytest.mark.django_db
def test_service_strips_unallowed_fields():
    """A LogEntry that records both a status change and a change to a
    sensitive field (e.g. encrypted_handler_vtj_json) must produce only
    one ActivityLogItem — the status change. Sensitive fields are silently
    ignored by the allowlist."""
    app = YouthApplicationFactory(status="submitted")
    ct = ContentType.objects.get_for_model(YouthApplication)

    # Manually create a LogEntry to simulate both fields changing
    actor = UserFactory(first_name="Test", last_name="User")
    log_entry = LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        actor=actor,
        changes={
            "status": ["submitted", "accepted"],
            "encrypted_handler_vtj_json": ["old_secret", "new_secret"],
        },
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 1
    item = items[0]
    assert item.action_type == ActionType.APPLICATION_STATUS_CHANGE.value
    assert item.old_value == "submitted"
    assert item.new_value == "accepted"
    assert item.author_name == "Test User"
    assert item.created_at == log_entry.timestamp


@pytest.mark.django_db
def test_service_returns_empty_for_unregistered_model():
    """Passing an Attachment instance (not in ALLOWED_TIMELINE_FIELDS)
    to get_activity_logs_for_application must return an empty list,
    ensuring unregistered models never leak audit data."""
    attachment = MagicMock(spec=Attachment)
    attachment._meta.model_name = Attachment._meta.model_name
    assert Attachment._meta.model_name not in ALLOWED_TIMELINE_FIELDS

    items = get_activity_logs_for_application(attachment)
    assert items == []


@pytest.mark.django_db
def test_service_skips_no_op_changes():
    """A LogEntry where old_value and new_value are identical (e.g.
    ['submitted', 'submitted']) must be silently skipped, producing no
    ActivityLogItem."""
    app = YouthApplicationFactory(status="submitted")
    ct = ContentType.objects.get_for_model(YouthApplication)

    LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        changes={
            "status": ["submitted", "submitted"],
        },
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 0


@pytest.mark.django_db
def test_service_handles_malformed_change():
    """A LogEntry whose change value is not a 2-element list (e.g. a plain
    string or a single-element list) must be skipped without raising an
    exception, keeping the timeline endpoint stable."""
    app = YouthApplicationFactory(status="submitted")
    ct = ContentType.objects.get_for_model(YouthApplication)

    LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        changes={
            "status": "not-a-list",
        },
    )

    LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        changes={
            "status": ["only-one-item"],
        },
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 0


@pytest.mark.django_db
def test_service_handles_null_actor():
    """A LogEntry with actor=None (system-generated or actor deleted) must
    produce an ActivityLogItem with author_name='' and must not raise."""
    app = YouthApplicationFactory(status="submitted")
    ct = ContentType.objects.get_for_model(YouthApplication)

    LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        actor=None,
        changes={
            "status": ["submitted", "accepted"],
        },
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 1
    assert items[0].author_name == ""


@pytest.mark.django_db
def test_service_coerces_null_values():
    """Verify that a changes list containing None values is coerced to empty
    strings in the resulting ActivityLogItem, preventing None leaking or crashing."""
    app = YouthApplicationFactory(status="submitted")
    ct = ContentType.objects.get_for_model(YouthApplication)

    LogEntry.objects.create(
        content_type=ct,
        object_pk=str(app.pk),
        action=LogEntry.Action.UPDATE,
        changes={
            "status": [None, "accepted"],
        },
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 1
    assert items[0].old_value == ""
    assert items[0].new_value == "accepted"


@pytest.mark.django_db
@override_settings(AUDITLOG_INCLUDE_ALL_MODELS=True)
def test_get_application_timeline_data_combines_filters_and_sorts():
    """Verify that get_application_timeline_data combines activity log items
    and notes, respects requested_types filters, and returns them sorted
    in descending order of created_at."""
    app = YouthApplicationFactory(status="submitted")
    NoteFactory(content_object=app, content="First note")

    # Generate status change (Activity)
    app.status = "accepted"
    app.save()

    # Generate another note
    NoteFactory(content_object=app, content="Second note")

    # 1. Test combining all with no filter
    timeline = get_application_timeline_data(app, requested_types=set())
    assert len(timeline) == 3
    # Check sorting order: second note is newest (created after status change), then activity, then first note
    assert timeline[0]["item_type"] == TimelineItemType.NOTE.value
    assert timeline[0]["content"] == "Second note"
    assert timeline[1]["item_type"] == TimelineItemType.ACTIVITY.value
    assert timeline[1]["old_value"] == "submitted"
    assert timeline[1]["new_value"] == "accepted"
    assert timeline[2]["item_type"] == TimelineItemType.NOTE.value
    assert timeline[2]["content"] == "First note"

    # 2. Test filtering to notes only
    timeline_notes = get_application_timeline_data(app, requested_types={"note"})
    assert len(timeline_notes) == 2
    assert all(
        item["item_type"] == TimelineItemType.NOTE.value for item in timeline_notes
    )

    # 3. Test filtering to activities only
    timeline_activities = get_application_timeline_data(
        app, requested_types={"activity"}
    )
    assert len(timeline_activities) == 1
    assert timeline_activities[0]["item_type"] == TimelineItemType.ACTIVITY.value
