from unittest.mock import MagicMock

import pytest

from applications.enums import TimelineItemType
from applications.models import (
    Attachment,
    TimelineActivityLog,
)
from applications.services import TimelineService
from common.tests.factories import (
    EmployerApplicationFactory,
    YouthApplicationFactory,
)
from handler_notes.tests.factories import NoteFactory

get_activity_logs_for_application = TimelineService.get_activity_logs_for_application
get_application_timeline_data = TimelineService.get_application_timeline_data
ALLOWED_TIMELINE_FIELDS = TimelineService.ALLOWED_TIMELINE_FIELDS


@pytest.mark.django_db
def test_youth_application_status_change_creates_timeline_log():
    """Changing YouthApplication.status creates a TimelineActivityLog entry."""
    app = YouthApplicationFactory(status="submitted")
    app.status = "accepted"
    app.save()

    log = TimelineActivityLog.objects.filter(
        application_type="youthapplication",
        application_id=app.pk,
    ).last()

    assert log is not None
    assert log.from_status == "submitted"
    assert log.to_status == "accepted"


@pytest.mark.django_db
def test_employer_application_status_change_creates_timeline_log():
    """Changing EmployerApplication.status creates a TimelineActivityLog entry."""
    app = EmployerApplicationFactory(status="draft")
    app.status = "submitted"
    app.save()

    log = TimelineActivityLog.objects.filter(
        application_type="employerapplication",
        application_id=app.pk,
    ).last()

    assert log is not None
    assert log.from_status == "draft"
    assert log.to_status == "submitted"


@pytest.mark.django_db
def test_service_returns_empty_for_unregistered_model():
    """Passing an Attachment instance (not in ALLOWED_TIMELINE_FIELDS)
    to get_activity_logs_for_application must return an empty list."""
    attachment = MagicMock(spec=Attachment)
    attachment._meta.model_name = Attachment._meta.model_name
    assert Attachment._meta.model_name not in ALLOWED_TIMELINE_FIELDS

    items = get_activity_logs_for_application(attachment)
    assert items == []


@pytest.mark.django_db
def test_service_skips_no_op_changes():
    """No TimelineActivityLog is created when status is unchanged."""
    app = YouthApplicationFactory(status="submitted")
    app.first_name = "Updated Name"
    app.save()

    assert not TimelineActivityLog.objects.filter(
        application_type="youthapplication",
        application_id=app.pk,
    ).exists()


@pytest.mark.django_db
def test_service_handles_null_actor():
    """A TimelineActivityLog with actor=None produces author_name=''."""
    app = YouthApplicationFactory(status="submitted")
    TimelineActivityLog.objects.create(
        application_type="youthapplication",
        application_id=app.pk,
        from_status="submitted",
        to_status="accepted",
        actor=None,
        actor_name="",
    )

    items = get_activity_logs_for_application(app)
    assert len(items) == 1
    assert items[0].author_name == ""


@pytest.mark.django_db
def test_signal_creates_log_on_status_change():
    """pre_save signal creates TimelineActivityLog when status changes."""
    app = YouthApplicationFactory(status="submitted")
    app.status = "accepted"
    app.save()

    assert TimelineActivityLog.objects.filter(
        application_type="youthapplication",
        application_id=app.pk,
        from_status="submitted",
        to_status="accepted",
    ).exists()


@pytest.mark.django_db
def test_signal_skips_when_status_unchanged():
    """pre_save signal does NOT create a log when status is unchanged."""
    app = YouthApplicationFactory(status="submitted")
    app.first_name = "Updated Name"
    app.save()

    assert not TimelineActivityLog.objects.filter(
        application_type="youthapplication",
        application_id=app.pk,
    ).exists()


@pytest.mark.django_db
def test_get_application_timeline_data_combines_filters_and_sorts():
    """Verify that get_application_timeline_data combines activity log items
    and notes, respects requested_types filters, and returns them sorted
    in descending order of created_at."""
    app = YouthApplicationFactory(status="submitted")
    NoteFactory(content_object=app, content="First note")

    # Create activity log entry
    TimelineActivityLog.objects.create(
        application_type="youthapplication",
        application_id=app.pk,
        from_status="submitted",
        to_status="accepted",
        actor_name="Test User",
    )

    # Generate another note
    NoteFactory(content_object=app, content="Second note")

    # 1. Test combining all with no filter
    timeline = get_application_timeline_data(app, requested_types=set())
    assert len(timeline) == 3
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
