import logging

from django.utils.translation import gettext_lazy as _

from applications.enums import EmailTemplateType
from applications.models import EmployerApplication, YouthApplication
from applications.services import EmailTemplateService
from handler_notes.enums import NoteType

LOGGER = logging.getLogger(__name__)


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
