from django.db import models
from django.utils.translation import gettext_lazy as _

from shared.models.abstract_models import TimeStampedModel, UUIDModel


class MessageManager(models.Manager):
    def get_messages_qs(self):
        return self.get_queryset().exclude(message_type=MessageType.NOTE)

    def get_notes_qs(self):
        return self.get_queryset().filter(message_type=MessageType.NOTE)


class MessageType(models.TextChoices):
    NOTE = ("note", _("Note"))
    HANDLER_MESSAGE = ("handler_message", _("Handler's message"))
    APPLICANT_MESSAGE = ("applicant_message", _("Applicant's message"))


class Message(UUIDModel, TimeStampedModel):
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
        choices=MessageType.choices, verbose_name=_("message type"), max_length=32
    )
    seen_by_applicant = models.BooleanField(
        default=False, verbose_name=_("read by applicant")
    )
    seen_by_handler = models.BooleanField(
        default=False, verbose_name=_("read by applicant")
    )

    objects = MessageManager()

    class Meta:
        db_table = "bf_message"
        verbose_name = _("message")
        verbose_name_plural = _("messages")
        ordering = ["created_at"]
