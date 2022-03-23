from django.utils import translation
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from messages.models import Message, MessageType

APPLICATION_REOPENED_MESSAGE = _(
    "Your application has been opened for editing. Please make the requested changes by "
    "{additional_information_needed_by}, otherwise your application can not be processed."
)


def send_application_reopened_message(
    user, application, additional_information_needed_by
):
    """
    :param user: The handler who is setting the application to ADDITIONAL_INFORMATION_REQUESTED status
    :param application: The application being reopened
    :param application: The last response date
    """
    with translation.override(application.applicant_language):
        Message.objects.create(
            sender=user,
            application=application,
            message_type=MessageType.HANDLER_MESSAGE,
            content=format_lazy(
                APPLICATION_REOPENED_MESSAGE,
                additional_information_needed_by=additional_information_needed_by.strftime(
                    "%d.%m.%Y"
                ),
            ),
        )
