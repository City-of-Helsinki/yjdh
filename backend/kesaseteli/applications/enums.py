from typing import Tuple

from django.db import models
from django.utils.translation import gettext_lazy as _

ATTACHMENT_CONTENT_TYPE_CHOICES = (
    ("application/pdf", "pdf"),
    ("image/png", "png"),
    ("image/jpeg", "jpeg"),
)


APPLICATION_LANGUAGE_CHOICES = (
    ("fi", "suomi"),
    ("sv", "svenska"),
    ("en", "english"),
)


def get_supported_languages() -> Tuple[str]:
    """
    Get tuple of supported languages

    :return: Tuple of the supported languages' codes, e.g. ('fi', 'sv', 'en')
    """
    return list(zip(*APPLICATION_LANGUAGE_CHOICES))[0]


class ApplicationStatus(models.TextChoices):
    DRAFT = "draft", _("Draft")
    SUBMITTED = "submitted", _("Submitted")
    ADDITIONAL_INFORMATION_REQUESTED = "additional_information_requested", _(
        "Additional information requested"
    )
    ADDITIONAL_INFORMATION_PROVIDED = "additional_information_provided", _(
        "Additional information provided"
    )
    ACCEPTED = "accepted", _("Accepted")
    REJECTED = "rejected", _("Rejected")
    DELETED_BY_CUSTOMER = "deleted_by_customer", _("Deleted by customer")


class AttachmentType(models.TextChoices):
    EMPLOYMENT_CONTRACT = "employment_contract", _("employment contract")
    PAYSLIP = "payslip", _("payslip")


class SummerVoucherExceptionReason(models.TextChoices):
    # TODO: Replace this hard coded enum class with a model where the controllers can add the exceptions themselves.
    # These exceptions can change yearly and thus should be dynamically editable by the controllers.
    NINTH_GRADER = "9th_grader", _("9th grader")
    BORN_2004 = "born_2004", _("born 2004")


class HiredWithoutVoucherAssessment(models.TextChoices):
    YES = "yes", _("yes")
    NO = "no", _("no")
    MAYBE = "maybe", _("maybe")


class YouthApplicationRejectedReason(models.TextChoices):
    EMAIL_IN_USE = "email_in_use", _("Email in use")
    ALREADY_ASSIGNED = "already_assigned", _("Already assigned")

    def json(self):
        return {
            "code": str(self.value),
            "message": str(self.label),
        }
