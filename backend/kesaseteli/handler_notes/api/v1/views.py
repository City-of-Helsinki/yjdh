import logging
from datetime import timedelta

from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from applications.api.v1.permissions import has_employer_application_permission
from applications.enums import EmployerApplicationStatus
from applications.models import EmployerApplication
from common.permissions import HandlerPermission
from handler_notes.api.v1.serializers import NoteSerializer
from handler_notes.enums import NoteType
from handler_notes.models import Note

LOGGER = logging.getLogger(__name__)

ALLOWED_EMPLOYER_ADDITIONAL_INFO_REQUEST_STATUSES = {
    EmployerApplicationStatus.APPLICATION_HANDLING,
}


class NoteModificationPermission(permissions.BasePermission):
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
        now = timezone.now()
        if now < obj.created_at or now - obj.created_at >= timedelta(hours=24):
            if request.method == "DELETE":
                self.message = _(
                    "You can only delete notes within 24 hours of creation."
                )
            else:
                self.message = _(
                    "You can only modify notes within 24 hours of creation."
                )
            return False
        return True


class IsEmployerOrHandler(permissions.BasePermission):
    def has_permission(self, request, view):
        if HandlerPermission().has_permission(request, view):
            return True

        application_id = view.kwargs.get("pk")
        if not application_id:
            return False

        try:
            application = EmployerApplication.objects.get(pk=application_id)
            return has_employer_application_permission(request, application)
        except EmployerApplication.DoesNotExist:
            return False


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        HandlerPermission,
        NoteModificationPermission,
    ]

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

    def perform_create(self, serializer):
        note = serializer.save()
        self._handle_additional_info_request(note, serializer)

    def perform_update(self, serializer):
        note = serializer.save()
        self._handle_additional_info_request(note, serializer)

    def _handle_additional_info_request(self, note, serializer):
        mark_as_additional_info_requested = getattr(
            serializer, "mark_as_additional_info_requested", False
        )
        if not mark_as_additional_info_requested:
            return

        if (
            note.content_object.status
            not in ALLOWED_EMPLOYER_ADDITIONAL_INFO_REQUEST_STATUSES
        ):
            return

        target = note.content_object
        if isinstance(target, EmployerApplication):
            target.status = EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED
            target.save(update_fields=["status"])

    @action(
        methods=["get"],
        detail=True,
        url_path="unread-messages-count",
        url_name="unread-messages-count",
        permission_classes=[permissions.IsAuthenticated, IsEmployerOrHandler],
    )
    def unread_messages_count(self, request, pk=None):
        count = Note.objects.filter(
            object_id=pk,
            note_type=NoteType.EXTERNAL_MESSAGE,
            seen_at__isnull=True,
        ).count()

        return Response(status=status.HTTP_200_OK, data={"count": count})

    @action(
        methods=["get"],
        detail=True,
        url_path="external-messages",
        url_name="external-messages",
        permission_classes=[permissions.IsAuthenticated, IsEmployerOrHandler],
    )
    def external_messages(self, request, pk=None):
        queryset = Note.objects.filter(
            object_id=pk, note_type=NoteType.EXTERNAL_MESSAGE
        ).order_by("-created_at")

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        methods=["post"],
        detail=True,
        url_path="mark-read",
        url_name="mark-read",
        permission_classes=[permissions.IsAuthenticated, IsEmployerOrHandler],
    )
    def mark_read(self, request, pk=None):
        LOGGER.debug(f"Marking external messages as read for {pk=}")
        Note.objects.filter(
            object_id=pk,
            note_type=NoteType.EXTERNAL_MESSAGE,
            seen_at__isnull=True,
        ).update(seen_at=timezone.now(), seen_by=request.user)

        return Response(status=status.HTTP_200_OK)
