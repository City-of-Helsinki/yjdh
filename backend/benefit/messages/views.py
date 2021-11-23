from applications.models import Application
from common.permissions import BFIsAuthenticated, BFIsHandler, TermsOfServiceAccepted
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from messages.models import Message
from messages.permissions import HasMessagePermission
from messages.serializers import MessageSerializer, NoteSerializer
from rest_framework import viewsets
from rest_framework.exceptions import NotFound
from users.utils import get_company_from_request


class ApplicantMessageViewSet(viewsets.ModelViewSet):

    serializer_class = MessageSerializer
    permission_classes = [
        BFIsAuthenticated,
        TermsOfServiceAccepted,
        HasMessagePermission,
    ]

    def get_queryset(self):
        if settings.DISABLE_AUTHENTICATION:
            return Application.objects.get(
                id=self.kwargs["application_pk"]
            ).messages.get_messages_qs()
        company = get_company_from_request(self.request)
        try:
            application = company.applications.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            raise NotFound(_("Application not found"))
        return application.messages.get_messages_qs()


class HandlerMessageViewSet(ApplicantMessageViewSet):
    serializer_class = MessageSerializer
    permission_classes = [BFIsHandler, HasMessagePermission]

    def get_queryset(self):
        try:
            application = Application.objects.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()
        return application.messages.get_messages_qs()


class HandlerNoteViewSet(HandlerMessageViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        try:
            application = Application.objects.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()
        return application.messages.get_notes_qs()
