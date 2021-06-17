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


class OrganizationType(models.TextChoices):
    """
    Coarse classification of the applicant organization type
    e.g.
    "oy", "oyj" -> COMPANY
    "rekisteröity yhdistys", "säätiö" -> ASSOCIATION
    """

    COMPANY = "company", _("Company")
    ASSOCIATION = "association", _("Association")

    @classmethod
    def resolve_organization_type(cls, company_form):
        # TODO: actual implementation when integration to YTJ/palveluväylä/PRH is implemented
        if company_form.lower() in ["oy", "oyj", "tmi"]:
            return OrganizationType.COMPANY
        else:
            return OrganizationType.ASSOCIATION
