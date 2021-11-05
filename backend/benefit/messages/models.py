from django.db import models
from django.utils.translation import gettext_lazy as _

from shared.models.abstract_models import TimeStampedModel, UUIDModel


class Message(UUIDModel, TimeStampedModel):
    MESSAGE_TYPES = (
        ("note", _("Note")),
        ("handler_message", _("Handler's message")),
        ("applicant_message", _("Applicant's message")),
    )

    content = models.TextField(verbose_name=_("content"))
    sender = models.ForeignKey(
        "users.User", verbose_name=_("sender"), on_delete=models.CASCADE
    )
    application = models.ForeignKey(
        "applications.Application",
        related_name="messages",
        on_delete=models.CASCADE,
        verbose_name=_("application"),
    )
    message_type = models.CharField(
        choices=MESSAGE_TYPES, verbose_name=_("message_type"), max_length=32
    )

    class Meta:
        db_table = "bf_message"
        verbose_name = _("message")
        verbose_name_plural = _("messages")
        ordering = ["created_at"]
