import logging
from datetime import datetime, timezone
from typing import Callable, Optional, Union

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import Model
from django.db.models.base import ModelBase

try:
    from resilient_logger.sources.resilient_log_source import (
        ResilientLogSource,
        StructuredResilientLogEntryData,
    )
except ImportError:
    pass

from shared.audit_log.enums import Operation, Role, Status
from shared.audit_log.mappings import DJANGO_BACKEND_MAPPING
from shared.audit_log.models import AuditLogEntry

User = get_user_model()


def _now() -> datetime:
    """
    Returns the current time in UTC timezone.
    """
    return datetime.now(tz=timezone.utc)


def _iso8601_date(time: datetime) -> str:
    """
    Formats the timestamp in ISO-8601 format, e.g. '2020-06-01T00:00:00.000Z'.
    """
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

    Each audit log event has an actor (or None for system events), an
    operation(e.g. READ or UPDATE), the target of the operation (a Django model
    instance), status (e.g. SUCCESS), and a timestamp.

    If additional information is provided, the function assumes that there were
    no changes to the object iteself but it was (re-)sent to another system for
    example. Thus it will not log the "changes" of the object.
    """
    current_time = get_time()
    user_id = str(actor.pk) if getattr(actor, "pk", None) else ""
    provider = DJANGO_BACKEND_MAPPING[actor_backend] if actor_backend else ""

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
                "provider": provider,
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

    # Use resilient logger if configured
    if getattr(settings, "RESILIENT_LOGGER", None):
        _create_resilient_log_entry(
            user_id=user_id,
            role=role,
            ip_address=ip_address,
            provider=provider,
            operation=operation,
            target=target,
            status=status,
            additional_information=additional_information,
            message=message,
        )
    else:
        # Fallback to legacy audit log
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
            if _is_sensitive_field(change.field):
                continue
            changes_list.append(
                f"{change.field} changed from {change.old} to {change.new}"
            )

        if changes_list:
            message["audit_event"]["target"]["changes"] = changes_list


def _is_sensitive_field(change_field: str) -> bool:
    "Check if a given field is sensitive personal data."
    return change_field in [
        "encrypted_social_security_number",
        "encrypted_first_name",
        "encrypted_last_name",
        "first_name",
        "last_name",
        "social_security_number",
    ]


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


def _create_resilient_log_entry(
    user_id: str,
    role: Role,
    ip_address: str,
    provider: str,
    operation: Operation,
    target: Union[Model, ModelBase],
    status: Status,
    additional_information: str,
    message: dict,
):
    """Create a resilient log entry using the structured format."""
    target_type = _get_target_type(target)
    target_id = _get_target_id(target)

    extra = {
        "status": str(status.value),
    }

    # Add changes if they exist in the message
    if (
        "target" in message.get("audit_event", {})
        and "changes" in message["audit_event"]["target"]
    ):
        extra["changes"] = message["audit_event"]["target"]["changes"]

    # Add additional information if provided
    if additional_information:
        extra["additional_information"] = additional_information

    # Add provider if available
    if provider:
        extra["provider"] = provider

    entry = StructuredResilientLogEntryData(
        level=logging.NOTSET,
        message=str(status.value),
        actor={
            "user_id": user_id if user_id else None,
            "role": str(role.value),
            "ip_address": ip_address if ip_address else None,
        },
        operation=str(operation.value),
        target={
            "id": target_id,
            "type": target_type,
        },
        extra=extra,
    )

    ResilientLogSource.bulk_create_structured([entry])
