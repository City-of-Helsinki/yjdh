import json
import logging
from datetime import datetime, timezone
from typing import Callable, Optional, Union

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import Model
from django.db.models.base import ModelBase
from shared.audit_log.enums import Operation, Role, Status

User = get_user_model()

LOGGER = logging.getLogger("audit")


def _now() -> datetime:
    """Returns the current time in UTC timezone."""
    return datetime.now(tz=timezone.utc)


def _iso8601_date(time: datetime) -> str:
    """Formats the timestamp in ISO-8601 format, e.g. '2020-06-01T00:00:00.000Z'."""
    return f"{time.replace(tzinfo=None).isoformat(sep='T', timespec='milliseconds')}Z"


def log(
    actor: Optional[Union[User, AnonymousUser]],
    operation: Operation,
    target: Union[Model, ModelBase],
    status: Status = Status.SUCCESS,
    get_time: Callable[[], datetime] = _now,
    ip_address: Optional[str] = "",
    target_status_before: Optional[str] = None,
    target_status_after: Optional[str] = None,
):
    """
    Write an event to the audit log.

    Each audit log event has an actor (or None for system events),
    an operation(e.g. READ or UPDATE), the target of the operation
    (a Django model instance), status (e.g. SUCCESS), and a timestamp.

    Audit log events are written to the "audit" logger at "INFO" level.
    """
    current_time = get_time()
    user_id = None
    if actor is None:
        role = Role.SYSTEM
    elif isinstance(actor, AnonymousUser):
        role = Role.ANONYMOUS
    elif actor.id == target.pk:
        role = Role.OWNER
        user_id = str(actor.pk)
    else:
        role = Role.USER
        user_id = str(actor.pk)
    message = {
        "audit_event": {
            "origin": settings.AUDIT_LOG_ORIGIN,
            "status": str(status.value),
            "date_time_epoch": int(current_time.timestamp() * 1000),
            "date_time": _iso8601_date(current_time),
            "actor": {
                "role": str(role.value),
                "user_id": user_id,
                "ip_address": ip_address,
            },
            "operation": str(operation.value),
            "target": {
                "id": _get_target_id(target),
                "type": _get_target_type(target),
            },
        },
    }
    if target_status_before != target_status_after:
        message["audit_event"]["target"].update(
            {
                "status_before": target_status_before,
                "status_after": target_status_after,
            }
        )
    LOGGER.info(json.dumps(message))


def _get_target_id(target: Union[Model, ModelBase]) -> Optional[str]:
    if isinstance(target, ModelBase):
        return None
    field_name = getattr(target, "audit_log_id_field", "pk")
    audit_log_id = getattr(target, field_name, None)
    return str(audit_log_id)


def _get_target_type(target: Union[Model, ModelBase]) -> Optional[str]:
    return (
        str(target.__class__.__name__)
        if isinstance(target, Model)
        else str(target.__name__)
    )
