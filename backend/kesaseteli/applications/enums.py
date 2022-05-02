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


class EmployerApplicationStatus(models.TextChoices):
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


class YouthApplicationStatus(models.TextChoices):
    SUBMITTED = "submitted", _("Submitted")
    AWAITING_MANUAL_PROCESSING = "awaiting_manual_processing", _(
        "Awaiting manual processing"
    )
    ADDITIONAL_INFORMATION_REQUESTED = "additional_information_requested", _(
        "Additional information requested"
    )
    ADDITIONAL_INFORMATION_PROVIDED = "additional_information_provided", _(
        "Additional information provided"
    )
    ACCEPTED = "accepted", _("Accepted")
    REJECTED = "rejected", _("Rejected")

    @staticmethod
    def active_values():
        """
        Youth application statuses for youth application that have been activated.
        """
        return [
            YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value,
            YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value,
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
            YouthApplicationStatus.ACCEPTED.value,
            YouthApplicationStatus.REJECTED.value,
        ]

    @staticmethod
    def can_have_additional_info_values():
        """
        Youth application statuses in which additional info may have been provided.
        """
        return [
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
            YouthApplicationStatus.ACCEPTED.value,
            YouthApplicationStatus.REJECTED.value,
        ]

    @staticmethod
    def must_have_additional_info_values():
        """
        Youth application statuses in which additional info must have been provided.
        """
        return [
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
        ]

    @staticmethod
    def acceptable_values():
        """
        Youth application statuses from which the youth application can be accepted.
        """
        return [
            YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value,
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
        ]

    @staticmethod
    def rejectable_values():
        """
        Youth application statuses from which the youth application can be rejected.
        """
        return [
            YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value,
            YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value,
            YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
        ]

    @staticmethod
    def handled_values():
        """
        Youth application statuses which have been handled and require a handler.
        """
        return [YouthApplicationStatus.ACCEPTED, YouthApplicationStatus.REJECTED]

    @staticmethod
    def unhandled_values():
        """
        Youth application statuses which have not been handled.
        """
        return sorted(
            set(YouthApplicationStatus.values)
            - set(YouthApplicationStatus.handled_values())
        )

    @staticmethod
    def active_unhandled_values():
        """
        Active youth application statuses which have not been handled.
        """
        return sorted(
            set(YouthApplicationStatus.unhandled_values())
            - {YouthApplicationStatus.SUBMITTED.value}
        )


class AdditionalInfoUserReason(models.TextChoices):
    STUDENT_IN_HELSINKI_BUT_NOT_RESIDENT = "student_in_helsinki_but_not_resident", _(
        "Student in Helsinki but not resident"
    )
    MOVING_TO_HELSINKI = "moving_to_helsinki", _("Moving to Helsinki")
    UNDERAGE_OR_OVERAGE = "underage_or_overage", _("Underage or overage")
    PERSONAL_INFO_DIFFERS_FROM_VTJ = "personal_info_differs_from_vtj", _(
        "Personal info differs from VTJ"
    )
    UNLISTED_SCHOOL = "unlisted_school", _("Unlisted school")
    OTHER = "other", _("Other")


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
    INADMISSIBLE_DATA = "inadmissible_data", _("Inadmissible data")
    PLEASE_RECHECK_DATA = "please_recheck_data", _("Please recheck data")

    def json(self):
        return {
            "code": str(self.value),
            "message": str(self.label),
        }


class VtjTestCase(models.TextChoices):
    DEAD = "Kuollut", _("Kuollut")
    WRONG_LAST_NAME = "Väärä sukunimi", _("Väärä sukunimi")
    NOT_FOUND = "Ei löydy", _("Ei löydy")
    NO_ANSWER = "Ei vastaa", _("Ei vastaa")
    HOME_MUNICIPALITY_HELSINKI = "Kotikunta Helsinki", _("Kotikunta Helsinki")
    HOME_MUNICIPALITY_UTSJOKI = "Kotikunta Utsjoki", _("Kotikunta Utsjoki")

    @staticmethod
    def first_name():
        return "VTJ-testi"
