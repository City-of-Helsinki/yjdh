import logging

from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _

from applications.enums import EmailTemplateType, EmployerApplicationStatus
from applications.models import EmployerApplication, YouthApplication
from applications.services import EmailTemplateService
from handler_notes.enums import NoteType
from handler_notes.models import Note

LOGGER = logging.getLogger(__name__)

ALLOWED_EMPLOYER_ADDITIONAL_INFO_REQUEST_STATUSES = {
    EmployerApplicationStatus.APPLICATION_HANDLING,
}


def send_external_message_email(note):
    """
    Sends an email notification for a note of type EXTERNAL_MESSAGE.
    """
    if note.note_type != NoteType.EXTERNAL_MESSAGE:
        LOGGER.warning(
            f"Attempted to send email for non-external message note {note.id}"
        )
        return False

    target = note.content_object
    recipient_email = None
    language = "fi"
    template_type = None

    if isinstance(target, YouthApplication):
        recipient_email = target.email
        language = target.language
        template_type = EmailTemplateType.YOUTH_EXTERNAL_MESSAGE
    elif isinstance(target, EmployerApplication):
        recipient_email = target.contact_person_email
        language = target.language
        template_type = EmailTemplateType.EMPLOYER_EXTERNAL_MESSAGE

    if not recipient_email or not template_type:
        LOGGER.error(f"Recipient email not found for the application in note {note.id}")
        return False

    context = {
        "message_content": note.content,
        "language": language,
    }

    success = EmailTemplateService.send_email_from_db_template(
        template_type=template_type,
        language=language,
        context=context,
        recipient_list=[recipient_email],
        error_message=_("Unable to send external message email"),
    )

    return success


def _handle_additional_info_request(note, serializer, user):
    mark_as_additional_info_requested = getattr(
        serializer, "mark_as_additional_info_requested", False
    )
    if not mark_as_additional_info_requested:
        return

    target = note.content_object
    if not isinstance(target, EmployerApplication):
        return

    target = EmployerApplication.objects.select_for_update().get(pk=target.pk)

    if target.assignee_id != user.pk:
        return

    if target.status not in ALLOWED_EMPLOYER_ADDITIONAL_INFO_REQUEST_STATUSES:
        return

    target.status = EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED
    target.assignee = None
    target.save(update_fields=["status", "assignee", "modified_at"])


def _get_employer_application_content_type():
    return ContentType.objects.get_for_model(EmployerApplication)


def _get_employer_application_external_messages_queryset(application_id):
    return Note.objects.filter(
        content_type=_get_employer_application_content_type(),
        object_id=application_id,
        note_type=NoteType.EXTERNAL_MESSAGE,
    )
