from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditLogEntry(models.Model):
    is_sent = models.BooleanField(default=False, verbose_name=_("is sent"))
    message = models.JSONField(verbose_name=_("message"))

    def __str__(self):
        return " ".join(
            [
                str(self.is_sent),
                _safe_get(self.message, "audit_event", "date_time"),
                _safe_get(self.message, "audit_event", "actor", "role"),
                _safe_get(self.message, "audit_event", "actor", "user_id"),
                _safe_get(self.message, "audit_event", "operation"),
                _safe_get(self.message, "audit_event", "target", "type").upper(),
                _safe_get(self.message, "audit_event", "target", "id"),
            ]
        )


def _safe_get(value: dict, *keys: str) -> str:
    """Look up a nested key in the given dict, or return "UNKNOWN" on KeyError."""
    for key in keys:
        try:
            value = value[key]
        except KeyError:
            return "UNKNOWN"
    return str(value)
