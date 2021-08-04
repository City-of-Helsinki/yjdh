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


class ApplicationStep(models.TextChoices):
    STEP_1 = "step_1", _("Step 1 - company details")
    STEP_2 = "step_2", _("Step 2 - employee details")
    STEP_3 = "step_3", _("Step 3 - attachments")
    STEP_4 = "step_4", _("Step 4 - summary")
    STEP_5 = "step_5", _("Step 5 - power of attorney")
    STEP_6 = "step_6", _("Step 6 - terms and send")


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


class AttachmentType(models.TextChoices):
    EMPLOYMENT_CONTRACT = "employment_contract", _("employment contract")
    PAY_SUBSIDY_DECISION = "pay_subsidy_decision", _("pay subsidy decision")
    COMMISSION_CONTRACT = "commission_contract", _("commission contract")
    EDUCATION_CONTRACT = "education_contract", _(
        "education contract of the apprenticeship office"
    )
    HELSINKI_BENEFIT_VOUCHER = "helsinki_benefit_voucher", _("helsinki benefit voucher")


class AttachmentRequirement(models.TextChoices):
    REQUIRED = "required", _("attachment is required")
    OPTIONAL = "optional", _("attachment is optional")
