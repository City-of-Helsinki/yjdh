from django.db import transaction
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver

from applications.models import (
    Attachment,
    EmployerApplication,
    YouthApplication,
)
from applications.timeline_service import (
    track_assignee_change,
    track_attachment_added,
    track_attachment_deleted,
    track_status_change,
)

_PRE_SAVE_STATUS_ATTR = "_pre_save_status"
_PRE_SAVE_ASSIGNEE_ATTR = "_pre_save_assignee_id"
_ASSIGNEE_FIELDS = ["assignee", "assignee_id"]


def _stash_status(sender, instance):
    """
    Helper function to retrieve and stash the previous status of an
    instance before it is updated. The value is stored in a private attribute.
    """
    try:
        old_status = sender.objects.values_list("status", flat=True).get(pk=instance.pk)
    except sender.DoesNotExist:
        old_status = None
    setattr(instance, _PRE_SAVE_STATUS_ATTR, old_status)


def _stash_assignee(sender, instance):
    """
    Helper function to retrieve and stash the previous assignee_id of an
    instance before it is updated. The value is stored in a private attribute.
    """
    try:
        old_assignee_id = sender.objects.values_list("assignee_id", flat=True).get(
            pk=instance.pk
        )
    except sender.DoesNotExist:
        old_assignee_id = None
    setattr(instance, _PRE_SAVE_ASSIGNEE_ATTR, old_assignee_id)


def _stash_pre_save_state(sender, instance, **kwargs):
    """
    Store the current DB state on the instance before the UPDATE is applied.
    Called via pre_save so that tracking functions can compare old vs. new
    values without re-querying the database (which would return the already-
    updated row in post_save).
    """
    if instance.pk is None or instance._state.adding or kwargs.get("raw"):
        return

    update_fields = kwargs.get("update_fields")
    update_all = update_fields is None

    if update_all or "status" in update_fields:
        _stash_status(sender, instance)

    if update_all or any(field in update_fields for field in _ASSIGNEE_FIELDS):
        _stash_assignee(sender, instance)


@receiver(pre_save, sender=YouthApplication)
@receiver(pre_save, sender=EmployerApplication)
def stash_application_pre_save_state(sender, instance, **kwargs):
    """
    Signal receiver that triggers before an application is saved.
    Stashes the old values of tracked fields (e.g., status, assignee)
    to allow comparison after the save completes.
    """
    _stash_pre_save_state(sender, instance, **kwargs)


@receiver(post_save, sender=YouthApplication)
@receiver(post_save, sender=EmployerApplication)
def track_application_changes(sender, instance, created, raw, update_fields, **kwargs):
    """
    Track changes for application instances, creating TimelineActivityLog
    entries when fields like status or assignee change. Skips creation events
    and raw saves.
    """
    if created or raw:
        return

    update_all = update_fields is None

    if update_all or "status" in update_fields:
        track_status_change(sender._meta.model_name, instance)

    if update_all or any(field in update_fields for field in _ASSIGNEE_FIELDS):
        track_assignee_change(sender._meta.model_name, instance)


@receiver(post_save, sender=Attachment, dispatch_uid="attachment_added_timeline")
def on_attachment_added(sender, instance, created, raw=False, **kwargs):
    """
    Signal receiver that fires after an attachment is saved.
    If a new attachment was created, logs the addition to the
    TimelineActivityLog for the corresponding application.
    """
    if not created or raw:
        return
    track_attachment_added(instance)


@receiver(pre_delete, sender=Attachment, dispatch_uid="attachment_deleted_timeline")
def on_attachment_deleted(sender, instance, **kwargs):
    """
    pre_delete fires before the DB row is deleted, allowing us to read the
    attachment_file name before it might be cleared.
    """
    track_attachment_deleted(instance)


@receiver(post_delete, sender=Attachment, dispatch_uid="attachment_post_delete_cleanup")
def on_attachment_post_delete(sender, instance, **kwargs):
    """
    post_delete shared cleanup that schedules file deletion via transaction.on_commit()
    so it works for both single instance and bulk cascaded deletes.
    """
    if instance.attachment_file:
        transaction.on_commit(lambda: instance.attachment_file.delete(save=False))
