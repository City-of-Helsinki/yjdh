import os

from auditlog_extra.context import get_actor
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

from applications.enums import ActionType
from applications.models import (
    EmployerApplication,
    TimelineActivityLog,
    YouthApplication,
)

_PRE_SAVE_STATUS_ATTR = "_pre_save_status"
_PRE_SAVE_ASSIGNEE_ATTR = "_pre_save_assignee_id"


def _resolve_actor():
    """
    Resolve the current request actor from the auditlog_extra.context.

    Returns a (user, name) tuple where user may be None and name is
    the user's full name for active accounts, or "Deleted User" for
    missing / inactive ones.
    """
    actor_context = get_actor()
    if not isinstance(actor_context, dict):
        return None, ""

    lazy_user = actor_context.get("actor")
    if not lazy_user:
        return None, ""

    # Force evaluation of SimpleLazyObject and verify user exists in DB.
    user_pk = getattr(lazy_user, "pk", None)
    actor_user = None
    if user_pk:
        user_model = get_user_model()
        try:
            actor_user = user_model.objects.get(pk=user_pk)
        except user_model.DoesNotExist:
            # Actor may have been deleted between context capture and lookup.
            # Keep actor_user as None so caller uses the "Deleted User" fallback.
            actor_user = None

    if actor_user and actor_user.is_active:
        return actor_user, actor_user.get_full_name() or ""

    # User is deleted or inactive – use a non-identifying placeholder.
    return actor_user, "Deleted User"


def track_status_change(application_type: str, instance) -> None:
    """Create a TimelineActivityLog entry if status changed on an existing instance."""
    if not instance.pk:
        return

    # Read the status that was stashed before the save (see _stash_pre_save_state).
    old_status = getattr(instance, _PRE_SAVE_STATUS_ATTR, None)
    if old_status is None or old_status == instance.status:
        return

    actor_user, actor_name = _resolve_actor()

    TimelineActivityLog.objects.create(
        application_type=application_type,
        application_id=instance.pk,
        action_type=ActionType.APPLICATION_STATUS_CHANGE,
        old_value=old_status,
        new_value=instance.status,
        actor=actor_user,
        actor_name=actor_name,
    )


def track_assignee_change(application_type: str, instance) -> None:
    """
    Create a TimelineActivityLog entry when the assignee field changes.

    Called from the post_save signal receiver. Uses the pre-save stash
    to compare old vs. new assignee_id without an extra DB query.
    """
    if not instance.pk:
        return

    old_assignee_id = getattr(instance, _PRE_SAVE_ASSIGNEE_ATTR, None)
    if old_assignee_id == instance.assignee_id:
        return

    actor_user, actor_name = _resolve_actor()

    user_model = get_user_model()
    old_value = ""
    if old_assignee_id:
        try:
            old_user = user_model.objects.get(pk=old_assignee_id)
            old_value = old_user.get_full_name() or ""
        except user_model.DoesNotExist:
            old_value = "Deleted User"

    new_value = instance.assignee.get_full_name() if instance.assignee else ""

    TimelineActivityLog.objects.create(
        application_type=application_type,
        application_id=instance.pk,
        action_type=ActionType.ASSIGNEE_CHANGE,
        old_value=old_value,
        new_value=new_value,
        actor=actor_user,
        actor_name=actor_name,
    )


def _resolve_attachment_application(attachment):
    """
    Resolve the application model name and pk for the given attachment.

    Returns (application_type, application_id) tuple or (None, None).
    """
    if attachment.summer_voucher:
        return (
            EmployerApplication._meta.model_name,
            attachment.summer_voucher.application_id,
        )
    if attachment.youth_application:
        return (
            YouthApplication._meta.model_name,
            attachment.youth_application_id,
        )
    return None, None


def track_attachment_added(attachment) -> None:
    """Log an ATTACHMENT_ADDED entry to TimelineActivityLog."""
    app_type, app_id = _resolve_attachment_application(attachment)
    if not app_type or not app_id:
        return

    actor_user, actor_name = _resolve_actor()
    if not actor_user and getattr(attachment, "author", None):
        actor_user = attachment.author
        actor_name = (
            actor_user.get_full_name() or "" if actor_user.is_active else "Deleted User"
        )

    attachment_ct = ContentType.objects.get_for_model(type(attachment))
    TimelineActivityLog.objects.create(
        application_type=app_type,
        application_id=app_id,
        action_type=ActionType.ATTACHMENT_ADDED,
        old_value="",
        new_value=os.path.basename(
            getattr(attachment.attachment_file, "name", None) or ""
        ),
        actor=actor_user,
        actor_name=actor_name,
        target_content_type=attachment_ct,
        target_object_id=attachment.pk,
    )


def track_attachment_deleted(attachment) -> None:
    """Log an ATTACHMENT_DELETED entry to TimelineActivityLog."""
    app_type, app_id = _resolve_attachment_application(attachment)
    if not app_type or not app_id:
        return

    actor_user, actor_name = _resolve_actor()
    attachment_ct = ContentType.objects.get_for_model(type(attachment))
    TimelineActivityLog.objects.create(
        application_type=app_type,
        application_id=app_id,
        action_type=ActionType.ATTACHMENT_DELETED,
        old_value=os.path.basename(
            getattr(attachment, "_deleted_attachment_name", "")
            or getattr(attachment.attachment_file, "name", None)
            or ""
        ),
        new_value="",
        actor=actor_user,
        actor_name=actor_name,
        target_content_type=attachment_ct,
        target_object_id=attachment.pk,
    )
