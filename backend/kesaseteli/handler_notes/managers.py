from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q

from applications.models import Attachment, EmployerApplication
from handler_notes.enums import NoteType


class NoteQuerySet(models.QuerySet):
    def internal_notes(self):
        return self.filter(note_type=NoteType.INTERNAL)

    def external_notes(self):
        return self.filter(note_type=NoteType.EXTERNAL_MESSAGE)

    def for_application_timeline(self, application):
        """
        Returns a queryset of Notes for the given application AND any of its children
        (e.g. attachments linked to the application's vouchers).
        """
        app_ct = ContentType.objects.get_for_model(application)
        query = Q(content_type=app_ct, object_id=application.id)

        if isinstance(application, EmployerApplication):
            attachment_ct = ContentType.objects.get_for_model(Attachment)
            attachment_ids = Attachment.objects.filter(
                summer_voucher__application=application
            ).values_list("id", flat=True)
            query |= Q(content_type=attachment_ct, object_id__in=attachment_ids)

        return (
            self.filter(query)
            .select_related("author", "content_type")
            .order_by("-created_at")
        )
