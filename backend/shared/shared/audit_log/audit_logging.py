from datetime import datetime, timezone
from typing import Callable, Optional, Union

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import Model
from django.db.models.base import ModelBase

from shared.audit_log.enums import Operation, Role, Status
from shared.audit_log.mappings import DJANGO_BACKEND_MAPPING
from shared.audit_log.models import AuditLogEntry

User = get_user_model()


def _now() -> datetime:
    """Returns the current time in UTC timezone."""
    return datetime.now(tz=timezone.utc)


def _iso8601_date(time: datetime) -> str:
    """Formats the timestamp in ISO-8601 format, e.g. '2020-06-01T00:00:00.000Z'."""
    return f"{time.replace(tzinfo=None).isoformat(timespec='milliseconds')}Z"


def log(
    actor: Optional[Union[User, AnonymousUser]],
    actor_backend: str,
    operation: Operation,
    target: Union[Model, ModelBase],
    status: Status = Status.SUCCESS,
    get_time: Callable[[], datetime] = _now,
    ip_address: str = "",
    additional_information: str = "",
):
    """
    Write an event to the audit log.

    Each audit log event has an actor (or None for system events),
    an operation(e.g. READ or UPDATE), the target of the operation
    (a Django model instance), status (e.g. SUCCESS), and a timestamp.

    If additional information is provided, the function assumes that
    there were no changes to the object iteself but it was (re-)sent
    to another system for example. Thus it will not log the "changes"
    of the object.
    """
    current_time = get_time()
    user_id = str(actor.pk) if getattr(actor, "pk", None) else ""

    if actor is None:
        role = Role.SYSTEM
    elif isinstance(actor, AnonymousUser):
        role = Role.ANONYMOUS
    elif actor.id == target.pk:
        role = Role.OWNER
    else:
        role = Role.USER

    message = {
        "audit_event": {
            "origin": settings.AUDIT_LOG_ORIGIN,
            "status": str(status.value),
            "date_time_epoch": int(current_time.timestamp() * 1000),
            "date_time": _iso8601_date(current_time),
            "actor": {
                "role": str(role.value),
                "user_id": user_id,
                "provider": DJANGO_BACKEND_MAPPING[actor_backend]
                if actor_backend
                else "",
                "ip_address": ip_address,
            },
            "operation": str(operation.value),
            "additional_information": additional_information,
            "target": {
                "id": _get_target_id(target),
                "type": _get_target_type(target),
            },
        },
    }

    if (
        operation == Operation.UPDATE
        and not additional_information
        and hasattr(target, "history")
    ):
        _add_changes(target, message)

    AuditLogEntry.objects.create(
        message=message,
    )


def _add_changes(target: Union[Model, ModelBase], message: dict) -> None:
    # Model is using django-simple-history
    latest_record = target.history.latest()
    previous_record = latest_record.prev_record

    if previous_record:
        delta = latest_record.diff_against(previous_record)

        changes_list = []
        for change in delta.changes:
            changes_list.append(
                f"{change.field} changed from {change.old} to {change.new}"
            )

        if changes_list:
            message["audit_event"]["target"]["changes"] = changes_list


def _get_target_id(target: Union[Model, ModelBase]) -> Optional[str]:
    if isinstance(target, ModelBase):
        return ""
    field_name = getattr(target, "audit_log_id_field", "pk")
    audit_log_id = getattr(target, field_name, None)
    return str(audit_log_id)


def _get_target_type(target: Union[Model, ModelBase]) -> Optional[str]:
    return (
        str(target.__class__.__name__)
        if isinstance(target, Model)
        else str(target.__name__)
    )
