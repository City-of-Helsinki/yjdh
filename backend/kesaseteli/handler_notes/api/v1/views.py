from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, viewsets

from common.permissions import HandlerPermission
from handler_notes.api.v1.serializers import NoteSerializer
from handler_notes.models import Note


class IsNoteAuthor(permissions.BasePermission):
    """
    Permission class to only allow the author of a note to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if obj.author != request.user:
            if request.method == "DELETE":
                self.message = _("You can only delete your own notes.")
            else:
                self.message = _("You can only modify your own notes.")
            return False
        return True


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, HandlerPermission, IsNoteAuthor]

    def get_queryset(self):
        qs = Note.objects.all().select_related("author", "content_type")

        if getattr(self, "action", None) == "list" and hasattr(self, "request"):
            target_type = self.request.query_params.get("target_type")
            target_id = self.request.query_params.get("target_id")

            if not (target_type and target_id):
                return Note.objects.none()

            try:
                qs = qs.filter(
                    content_type__model=target_type.lower(), object_id=target_id
                )
            except ValidationError:
                qs = qs.none()

        return qs.order_by("-created_at")
