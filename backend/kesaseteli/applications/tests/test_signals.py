"""
Unit tests for applications/signals.py

Coverage:
  _stash_pre_save_status  - stashes correct status; skips unsaved instances
  _resolve_actor          - returns (user, name) for active, inactive, deleted,
                            and anonymous actors
  _track_status_change    - creates / skips TimelineActivityLog correctly
  track_application_status_change (post_save receiver)
                          - integration: status change logged via .save()
"""

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model

from applications.models import TimelineActivityLog
from applications.signals import (
    _PRE_SAVE_STATUS_ATTR,
    _resolve_actor,
    _stash_pre_save_status,
    _track_status_change,
)
from common.tests.factories import (
    EmployerApplicationFactory,
    YouthApplicationFactory,
)
from shared.common.tests.factories import HandlerUserFactory

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_actor_context(user):
    """Return a minimal auditlog context dict whose 'actor' key has a .pk."""
    return {"actor": user}


# ---------------------------------------------------------------------------
# _stash_pre_save_status
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_stash_pre_save_status_stores_current_db_status():
    """The current DB status is stored on the instance attribute."""
    app = YouthApplicationFactory(status="submitted")
    _stash_pre_save_status(type(app), app)
    assert getattr(app, _PRE_SAVE_STATUS_ATTR) == "submitted"


@pytest.mark.django_db
def test_stash_pre_save_status_skips_unsaved_instance():
    """Instances without a PK (unsaved) leave the attribute untouched."""
    app = YouthApplicationFactory.build()  # not saved -> no PK
    app.pk = None  # UUIDModel assigns a uuid4 on __init__; null it to simulate unsaved
    assert app.pk is None
    _stash_pre_save_status(type(app), app)
    assert not hasattr(app, _PRE_SAVE_STATUS_ATTR)


# ---------------------------------------------------------------------------
# _resolve_actor
# ---------------------------------------------------------------------------


def test_resolve_actor_returns_empty_when_no_context():
    """No auditlog context -> (None, '')."""
    with patch("applications.signals.get_actor", return_value=None):
        user, name = _resolve_actor()
    assert user is None
    assert name == ""


def test_resolve_actor_returns_empty_when_context_has_no_actor():
    """Context dict without 'actor' key -> (None, '')."""
    with patch("applications.signals.get_actor", return_value={}):
        user, name = _resolve_actor()
    assert user is None
    assert name == ""


@pytest.mark.django_db
def test_resolve_actor_returns_full_name_for_active_user():
    """Active user -> (user_object, full_name)."""
    actor = HandlerUserFactory(first_name="Matti", last_name="Meikalainen")
    with patch(
        "applications.signals.get_actor",
        return_value=_make_actor_context(actor),
    ):
        user, name = _resolve_actor()
    assert user == actor
    assert name == "Matti Meikalainen"


@pytest.mark.django_db
def test_resolve_actor_returns_deleted_user_for_inactive_user():
    """Inactive (deactivated) user -> (user_object, 'Deleted User')."""
    actor = HandlerUserFactory(is_active=False)
    with patch(
        "applications.signals.get_actor",
        return_value=_make_actor_context(actor),
    ):
        user, name = _resolve_actor()
    assert user == actor
    assert name == "Deleted User"


@pytest.mark.django_db
def test_resolve_actor_returns_deleted_user_when_user_not_in_db():
    """Actor PK that no longer exists in the DB -> (None, 'Deleted User')."""

    class _StubUser:
        pk = 999_999_999  # does not exist

    with patch(
        "applications.signals.get_actor",
        return_value={"actor": _StubUser()},
    ):
        user, name = _resolve_actor()
    assert user is None
    assert name == "Deleted User"


# ---------------------------------------------------------------------------
# _track_status_change
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_track_status_change_creates_log_when_status_differs():
    """A log entry is created when old and new statuses differ."""
    app = YouthApplicationFactory(status="submitted")
    setattr(app, _PRE_SAVE_STATUS_ATTR, "submitted")
    app.status = "accepted"

    with patch("applications.signals.get_actor", return_value=None):
        _track_status_change("youthapplication", app)

    log = TimelineActivityLog.objects.get(application_id=app.pk)
    assert log.from_status == "submitted"
    assert log.to_status == "accepted"


@pytest.mark.django_db
def test_track_status_change_skips_when_status_unchanged():
    """No log entry when old_status == instance.status."""
    app = YouthApplicationFactory(status="submitted")
    setattr(app, _PRE_SAVE_STATUS_ATTR, "submitted")

    with patch("applications.signals.get_actor", return_value=None):
        _track_status_change("youthapplication", app)

    assert not TimelineActivityLog.objects.filter(application_id=app.pk).exists()


@pytest.mark.django_db
def test_track_status_change_skips_when_stash_absent():
    """No log entry when the pre-save stash attribute is missing."""
    app = YouthApplicationFactory(status="submitted")
    # Do NOT set _PRE_SAVE_STATUS_ATTR

    with patch("applications.signals.get_actor", return_value=None):
        _track_status_change("youthapplication", app)

    assert not TimelineActivityLog.objects.filter(application_id=app.pk).exists()


@pytest.mark.django_db
def test_track_status_change_records_actor():
    """Actor user and name are stored correctly in the log entry."""
    actor = HandlerUserFactory(first_name="Anna", last_name="Tester")
    app = YouthApplicationFactory(status="submitted")
    setattr(app, _PRE_SAVE_STATUS_ATTR, "submitted")
    app.status = "accepted"

    with patch(
        "applications.signals.get_actor",
        return_value=_make_actor_context(actor),
    ):
        _track_status_change("youthapplication", app)

    log = TimelineActivityLog.objects.get(application_id=app.pk)
    assert log.actor == actor
    assert log.actor_name == "Anna Tester"


# ---------------------------------------------------------------------------
# Integration: track_application_status_change (post_save receiver)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_youth_application_status_change_creates_log_via_save():
    """Saving a YouthApplication with a changed status creates a log entry."""
    app = YouthApplicationFactory(status="submitted")
    app.status = "accepted"
    app.save()

    log = TimelineActivityLog.objects.filter(application_id=app.pk).last()
    assert log is not None
    assert log.from_status == "submitted"
    assert log.to_status == "accepted"


@pytest.mark.django_db
def test_employer_application_status_change_creates_log_via_save():
    """Saving an EmployerApplication with a changed status creates a log entry."""
    app = EmployerApplicationFactory(status="draft")
    app.status = "submitted"
    app.save()

    log = TimelineActivityLog.objects.filter(application_id=app.pk).last()
    assert log is not None
    assert log.from_status == "draft"
    assert log.to_status == "submitted"


@pytest.mark.django_db
def test_no_log_created_when_status_not_in_update_fields():
    """update_fields without 'status' -> no log entry."""
    app = YouthApplicationFactory(status="submitted")
    app.first_name = "Different"
    app.save(update_fields=["first_name"])

    assert not TimelineActivityLog.objects.filter(application_id=app.pk).exists()


@pytest.mark.django_db
def test_no_log_created_on_initial_creation():
    """Creating a new application does not produce a log entry."""
    app = YouthApplicationFactory(status="submitted")
    assert not TimelineActivityLog.objects.filter(application_id=app.pk).exists()
