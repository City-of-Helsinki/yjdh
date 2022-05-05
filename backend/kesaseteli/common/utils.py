import logging
from datetime import date
from email.mime.image import MIMEImage
from typing import List, Optional

from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives, get_connection
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from stdnum.fi.hetu import is_valid as is_valid_finnish_social_security_number

LOGGER = logging.getLogger(__name__)


def has_whitespace(value):
    value_without_whitespace = "".join(value.split())
    return value != value_without_whitespace


def normalize_whitespace(value):
    return " ".join(value.split())


def is_uppercase(value):
    """
    Is the value all uppercase? Returns True also if there are no alphabetic characters.
    """
    return value == value.upper()


def normalize_for_string_comparison(text):
    """
    Normalize text for string comparison. Converts None to an empty string, strips
    leading and trailing whitespace, and makes result case-insensitive by folding case.
    """
    return "" if text is None else str(text).strip().casefold()


def are_same_texts(a, b) -> bool:
    """
    Are the two given values same when compared after first normalizing them using
    normalize_for_string_comparison?
    """
    return normalize_for_string_comparison(a) == normalize_for_string_comparison(b)


def are_same_text_lists(a, b) -> bool:
    """
    Are the two given value lists same when compared after first normalizing their
    values using normalize_for_string_comparison?
    """
    return list(map(normalize_for_string_comparison, a)) == list(
        map(normalize_for_string_comparison, b)
    )


def send_mail_with_error_logging(
    subject,
    message,
    from_email,
    recipient_list,
    error_message,
    html_message=None,
    images: Optional[List[MIMEImage]] = None,
) -> bool:
    """
    Send email with given parameters and log given error message in case of failure.

    :param subject: Email subject
    :param message: Plain text email body
    :param from_email: Email address of the email's sender
    :param recipient_list: List of email recipients
    :param error_message: Error message to be logged in case of failure
    :param html_message: Optional html message. If provided the resulting email will be
                         a multipart/alternative email with message as the text/plain
                         content type and html_message as the text/html content type.
    :param images: Optional attachable images. Must also provide html_message if any
                   images are provided. If provided will change mail's mixed_subtype to
                   related.
    :return: True if email was sent, otherwise False.
    """
    connection = get_connection(fail_silently=True)
    mail = EmailMultiAlternatives(
        subject, message, from_email, recipient_list, connection=connection
    )
    if html_message:
        mail.attach_alternative(html_message, "text/html")
        if images:
            mail.mixed_subtype = "related"
            for image in images:
                mail.attach(image)

    sent_email_count = mail.send(fail_silently=True)
    if sent_email_count == 0:
        LOGGER.error(error_message)
    return sent_email_count > 0


def validate_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not an uppercase Finnish social
    security number with no whitespace.
    """
    if (
        not is_valid_finnish_social_security_number(value)
        or has_whitespace(value)
        or not is_uppercase(value)
    ):
        raise ValidationError(
            _(
                "%(value)s is not a valid Finnish social security number. "
                "Make sure to have it in uppercase and without whitespace."
            ),
            params={"value": value},
        )


def validate_optional_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not None, an empty string or an
    uppercase Finnish social security number with no whitespace.
    """
    if value is not None and value != "":
        validate_finnish_social_security_number(value)


def getattr_nested(obj, attrs: list):
    """
    Example:
        obj: EmployerApplication
        attrs: ["company", "business_id"]
        returns obj.company.business_id if company exists, else returns ""
    """
    attr = attrs.pop(0)
    value = getattr(obj, attr, "")
    if not value:
        return ""

    if attrs:
        return getattr_nested(value, attrs)
    else:
        if isinstance(value, date):
            value = value.strftime("%d.%m.%Y")
        elif hasattr(obj, f"get_{attr}_display"):
            with translation.override("fi"):
                value = getattr(obj, f"get_{attr}_display")()
        return value
