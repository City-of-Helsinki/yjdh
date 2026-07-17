from auditlog_extra.context import get_actor
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from applications.models import (
    EmployerApplication,
    TimelineActivityLog,
    YouthApplication,
)

_PRE_SAVE_STATUS_ATTR = "_pre_save_status"


def _stash_pre_save_status(sender, instance, **kwargs):
    """
    Store the current DB status on the instance before the UPDATE is applied.
    Called via pre_save so that _track_status_change can compare old vs. new
    status without re-querying the database (which would return the already-
    updated row in post_save).
    """
    if not instance.pk:
        return
    try:
        old_status = sender.objects.values_list("status", flat=True).get(pk=instance.pk)
    except sender.DoesNotExist:
        old_status = None
    setattr(instance, _PRE_SAVE_STATUS_ATTR, old_status)


def _resolve_actor():
    """
    Resolve the current request actor from the auditlog context.

    Returns a (user, name) tuple where user may be None and name is a
    non-PII string safe to persist: the user's full name for active
    accounts, or "Deleted User" for missing / inactive ones.
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
        # Use only full name; omit email to avoid PII in the log.
        return actor_user, actor_user.get_full_name() or ""

    # User is deleted or inactive – use a non-identifying placeholder.
    return actor_user, "Deleted User"


def _track_status_change(application_type, instance):
    """Create a TimelineActivityLog entry if status changed on an existing instance."""
    if not instance.pk:
        return

    # Read the status that was stashed before the save (see _stash_pre_save_status).
    old_status = getattr(instance, _PRE_SAVE_STATUS_ATTR, None)
    if old_status is None or old_status == instance.status:
        return

    actor_user, actor_name = _resolve_actor()

    TimelineActivityLog.objects.create(
        application_type=application_type,
        application_id=instance.pk,
        from_status=old_status,
        to_status=instance.status,
        actor=actor_user,
        actor_name=actor_name,
    )


@receiver(pre_save, sender=YouthApplication)
@receiver(pre_save, sender=EmployerApplication)
def stash_application_pre_save_status(sender, instance, **kwargs):
    _stash_pre_save_status(sender, instance, **kwargs)


@receiver(post_save, sender=YouthApplication)
@receiver(post_save, sender=EmployerApplication)
def track_application_status_change(
    sender, instance, created, raw, update_fields, **kwargs
):
    """
    Track status changes for application instances, creating TimelineActivityLog
    entries when status changes. Skips creation events, raw saves, and updates where
    status wasn't modified.
    """
    if created or raw:
        return
    if update_fields is not None and "status" not in update_fields:
        return
    _track_status_change(sender._meta.model_name, instance)
