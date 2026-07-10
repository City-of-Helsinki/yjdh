from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import gettext_lazy as _

from handler_notes.enums import NoteType
from handler_notes.managers import NoteQuerySet
from shared.models.abstract_models import TimeStampedModel, UUIDModel


class Note(TimeStampedModel, UUIDModel):
    """
    Handler's internal note, e.g., regarding an application or attachment.
    Translated as "Käsittelijän huomautus, esim. hakemuksesta tai liitteestä".
    Uses ContentTypes to flexibly attach to YouthApplication,
    EmployerApplication, Attachment, etc.
    """

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey("content_type", "object_id")

    note_type = models.CharField(
        choices=NoteType.choices, max_length=32, default=NoteType.INTERNAL
    )
    is_important = models.BooleanField(default=False, verbose_name=_("is important"))
    content = models.TextField(verbose_name=_("content"))
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("author"),
    )

    objects = NoteQuerySet.as_manager()

    class Meta:
        db_table = "handler_notes_note"
        verbose_name = _("note")
        verbose_name_plural = _("notes")
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]
        ordering = ["-created_at"]
