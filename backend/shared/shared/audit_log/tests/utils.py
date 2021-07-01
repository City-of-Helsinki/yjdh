from json import JSONDecodeError, loads
from typing import Optional, Union

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import Model
from django.db.models.base import ModelBase
from shared.audit_log.enums import Role

User = get_user_model()


def get_audit_log_event(caplog) -> Optional[dict]:
    for record in caplog.records:
        try:
            message = loads(record.message)
            if "audit_event" in message:
                return message["audit_event"]
        except JSONDecodeError:
            pass
    return None


def get_role(
    actor: Optional[Union[User, AnonymousUser]],
    target: Optional[Union[Model, ModelBase]],
) -> Role:
    if actor is None:
        return Role.SYSTEM
    elif isinstance(actor, AnonymousUser):
        return Role.ANONYMOUS
    elif actor.id == target.pk:
        return Role.OWNER
    else:
        return Role.USER
