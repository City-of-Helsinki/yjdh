from django.conf import settings
from django.db import transaction
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from applications.enums import ApplicationStatus
from applications.models import Application
from common.permissions import BFIsApplicant, BFIsHandler, TermsOfServiceAccepted
from messages.automatic_messages import (
    get_default_email_notification_subject,
    get_email_template_context,
    render_email_template,
    send_email_to_applicant,
)
from messages.models import Message, MessageType
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
        if settings.NEXT_PUBLIC_MOCK_FLAG:
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
        application = message.application
        # Never send email if it's a handler's note!
        if message.message_type in [
            MessageType.HANDLER_MESSAGE,
            MessageType.APPLICANT_MESSAGE,
        ]:
            with translation.override(application.applicant_language):
                subject = get_default_email_notification_subject()
                context = get_email_template_context(application)
                text_message = render_email_template(context, "received-message", "txt")
                html_message = render_email_template(
                    context, "received-message", "html"
                )

                send_email_to_applicant(
                    application, subject, text_message, html_message
                )

    def get_queryset(self):
        try:
            application = Application.objects.get(id=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()
        return application.messages.get_messages_qs()

    def list(self, request, *args, **kwargs):
        return super(viewsets.ModelViewSet, self).list(request, *args, **kwargs)

    @transaction.atomic
    @action(detail=False, methods=["post"])
    def mark_read(self, *args, **kwargs):
        self.get_queryset().update(seen_by_handler=True)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @transaction.atomic
    @action(detail=False, methods=["post"])
    def mark_unread(self, *args, **kwargs):
        last_message = (
            self.get_queryset()
            .order_by("-created_at")
            .filter(message_type=MessageType.APPLICANT_MESSAGE)
            .first()
        )
        if last_message is not None:
            last_message.seen_by_handler = False
            last_message.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class HandlerNoteViewSet(HandlerMessageViewSet):
    serializer_class = NoteSerializer

    def list(self, request, *args, **kwargs):
        try:
            application = Application.objects.get(pk=self.kwargs["application_pk"])
        except Application.DoesNotExist:
            return Message.objects.none()

        messages = MessageSerializer(
            application.messages.get_notes_qs(), many=True
        ).data

        log_entry = (
            application.log_entries.filter(
                application_id=self.kwargs["application_pk"],
                from_status=ApplicationStatus.HANDLING,
                to_status__in=[ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
            ).first()
            or None
        )

        if log_entry and application.status in [
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
        ]:
            log_entry_comment = getattr(log_entry, "comment", None)
            content = _("Handling comment") + ": " + log_entry_comment
            if log_entry_comment is not None and log_entry_comment != "":
                messages.append(
                    MessageSerializer(
                        Message(
                            id=getattr(log_entry, "id", None),
                            created_at=getattr(log_entry, "created_at", None),
                            modified_at=getattr(log_entry, "modified_at", None),
                            content=content,
                            message_type=MessageType.NOTE,
                            seen_by_applicant=True,
                            seen_by_handler=True,
                        )
                    ).data
                )

        calculation_comment = (
            (application.calculation.override_monthly_benefit_amount_comment)
            if application.calculation
            else None
        )

        if calculation_comment:
            content = _("Manual calculation comment") + ": " + calculation_comment
            messages.append(
                MessageSerializer(
                    Message(
                        id=application.calculation.id,
                        created_at=getattr(application.calculation, "created_at", None),
                        modified_at=getattr(
                            application.calculation, "modified_at", None
                        ),
                        content=content,
                        message_type=MessageType.NOTE,
                        seen_by_applicant=True,
                        seen_by_handler=True,
                    )
                ).data
            )

        if calculation_comment or log_entry:
            messages.sort(key=lambda x: x["created_at"])

        return Response(messages)


_("Manual calculation comment")
