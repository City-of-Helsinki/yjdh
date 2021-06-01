from django.db import models
from django.utils.translation import gettext_lazy as _


class ApplicationStatus(models.TextChoices):
    DRAFT = "draft", _("Draft")
    RECEIVED = "received", _("Received")
    ADDITIONAL_INFORMATION_NEEDED = "additional_information_needed", _(
        "Additional information requested"
    )
    CANCELLED = "cancelled", _("Cancelled")
    ACCEPTED = "accepted", _("Accepted")
    REJECTED = "rejected", _("Rejected")


class BenefitType(models.TextChoices):
    EMPLOYMENT_BENEFIT = "employment_benefit", _("Employment Benefit")
    SALARY_BENEFIT = "salary_benefit", _("Salary Benefit")
    COMMISSION_BENEFIT = "commission_benefit", _("Commission Benefit")
