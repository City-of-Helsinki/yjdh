from django.db import models
from django.utils.translation import gettext_lazy as _


class NoteType(models.TextChoices):
    # Default for Handler UI comments
    INTERNAL = ("internal", _("Internal Note"))
    # Documenting emails sent/received (both, manually and possibly in future also automatic note creation).  # noqa: E501
    EXTERNAL_MESSAGE = (
        "external_message",
        _("External Message"),
    )
