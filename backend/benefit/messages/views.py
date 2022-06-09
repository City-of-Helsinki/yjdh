from django.conf import settings
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets
from rest_framework.exceptions import NotFound

from applications.models import Application
from common.permissions import BFIsApplicant, BFIsHandler, TermsOfServiceAccepted
from messages.automatic_messages import notify_applicant_by_email_about_new_message
from messages.models import Message
from messages.permissions import HasMessagePermission
from messages.serializers import MessageSerializer, NoteSerializer
from shared.audit_log.viewsets import AuditLoggingModelViewSet
from users.utils import get_company_from_request


class ApplicantMessageViewSet(AuditLoggingModelViewSet):

    serializer_class = MessageSerializer
    permission_classes = [
        BFIsApplicant,
        TermsOfServiceAccepted,
        HasMessagePermission,
    ]

    @transaction.atomic
    def list(self, request, *args, **kwargs):
        self.get_queryset().update(seen_by_applicant=True)
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        if settings.DISABLE_AUTHENTICATION:
            return Application.objects.get(
                id=self.kwargs["application_pk"]
            ).messages.get_messages_qs()
        company = get_company_from_request(self.request)
        if not company:
            return Message.objects.none()
        try:
            application = company.applications.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            raise NotFound(_("Application not found"))
        return application.messages.get_messages_qs()


class HandlerMessageViewSet(ApplicantMessageViewSet):
    serializer_class = MessageSerializer
    permission_classes = [BFIsHandler, HasMessagePermission]

    def perform_create(self, serializer):
        message = serializer.save()
        notify_applicant_by_email_about_new_message(message.application)

    def get_queryset(self):
        try:
            application = Application.objects.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()
        return application.messages.get_messages_qs()

    @transaction.atomic
    def list(self, request, *args, **kwargs):
        self.get_queryset().update(seen_by_handler=True)
        return super(viewsets.ModelViewSet, self).list(request, *args, **kwargs)


class HandlerNoteViewSet(HandlerMessageViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        try:
            application = Application.objects.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()
        return application.messages.get_notes_qs()
