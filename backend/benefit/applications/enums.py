from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class ApplicationStatus(models.TextChoices):
    DRAFT = "draft", _("Draft")
    RECEIVED = "received", _("Received")
    HANDLING = "handling", _("Handling")
    ADDITIONAL_INFORMATION_NEEDED = "additional_information_needed", _(
        "Additional information requested"
    )
    CANCELLED = "cancelled", _("Cancelled")
    ACCEPTED = "accepted", _("Accepted")
    REJECTED = "rejected", _("Rejected")

    @classmethod
    def is_editable_status(cls, user, status):
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return cls.is_handler_editable_status(
                status, None
            ) or cls.is_applicant_editable_status(status)
        elif not user.is_authenticated:
            return False
        elif user.is_handler():
            return cls.is_handler_editable_status(status, None)
        else:
            return cls.is_applicant_editable_status(status)

    @classmethod
    def is_handler_editable_status(cls, status, new_status=None):
        if status not in cls.values:
            raise ValueError(_("Invalid application status"))
        if new_status is not None and new_status not in cls.values:
            raise ValueError(_("Invalid application status change"))

        # Application can be transitioned back from these non-editable statuses, so make an exception
        # to make the application editable if status transition is done at the same time
        if (status, new_status) in [
            (ApplicationStatus.ACCEPTED, ApplicationStatus.HANDLING),
            (ApplicationStatus.REJECTED, ApplicationStatus.HANDLING),
        ]:
            return True

        # drafts may be edited by the handler when entering data from a paper application
        return status in (
            cls.DRAFT,
            cls.RECEIVED,
            cls.HANDLING,
            cls.ADDITIONAL_INFORMATION_NEEDED,
        )

    @classmethod
    def is_applicant_editable_status(cls, status):
        if status not in cls.values:
            raise ValueError(_("Invalid application status"))
        return status in (cls.DRAFT, cls.ADDITIONAL_INFORMATION_NEEDED)


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
    """

    COMPANY = "company", _("Company")
    ASSOCIATION = "association", _("Association")

    @classmethod
    def resolve_organization_type(cls, company_form_code):
        # company is the default organization type
        if company_form_code in settings.ASSOCIATION_FORM_CODES:
            return OrganizationType.ASSOCIATION
        else:
            return OrganizationType.COMPANY


class AttachmentType(models.TextChoices):
    EMPLOYMENT_CONTRACT = "employment_contract", _("employment contract")
    PAY_SUBSIDY_DECISION = "pay_subsidy_decision", _("pay subsidy decision")
    COMMISSION_CONTRACT = "commission_contract", _("commission contract")
    EDUCATION_CONTRACT = "education_contract", _(
        "education contract of the apprenticeship office"
    )
    HELSINKI_BENEFIT_VOUCHER = "helsinki_benefit_voucher", _("helsinki benefit voucher")
    EMPLOYEE_CONSENT = "employee_consent", _("employee consent")
    FULL_APPLICATION = "full_application", _("full application")
    OTHER_ATTACHMENT = "other_attachment", _("other attachment")
    PDF_SUMMARY = "pdf_summary", _("pdf summary")
    DECISION_TEXT_XML = "decision_text_xml", _("public decision text xml attachment")
    DECISION_TEXT_SECRET_XML = "decision_text_secret_xml", _(
        "non-public decision text xml attachment"
    )


class AttachmentRequirement(models.TextChoices):
    REQUIRED = "required", _("attachment is required")
    OPTIONAL = "optional", _("attachment is optional")


class ApplicationBatchStatus(models.TextChoices):
    DRAFT = "draft", _("Draft")
    AHJO_REPORT_CREATED = "exported_ahjo_report", _(
        "Ahjo report created, not yet sent to AHJO"
    )
    AWAITING_AHJO_DECISION = "awaiting_ahjo_decision", _(
        "Sent to Ahjo, decision pending"
    )
    DECIDED_ACCEPTED = "accepted", _("Accepted in Ahjo")
    DECIDED_REJECTED = "rejected", _("Rejected in Ahjo")
    RETURNED = "returned", _(
        "Returned from Ahjo without decision"
    )  # Theoretically possible: means that a decision was not made
    SENT_TO_TALPA = "sent_to_talpa", _("Sent to Talpa")
    COMPLETED = "completed", _("Processing is completed")
    REJECTED_BY_TALPA = "rejected_by_talpa", _("Rejected by Talpa")


class ApplicationTalpaStatus(models.TextChoices):
    NOT_PROCESSED_BY_TALPA = "not_sent_to_talpa", _("Not sent to Talpa")
    REJECTED_BY_TALPA = "rejected_by_talpa", _("Rejected by Talpa")
    SUCCESSFULLY_SENT_TO_TALPA = "successfully_sent_to_talpa", _(
        "Successfully sent to Talpa"
    )


class AhjoDecision(models.TextChoices):
    # The possible decisions for Ahjo processing
    DECIDED_ACCEPTED = ApplicationBatchStatus.DECIDED_ACCEPTED
    DECIDED_REJECTED = ApplicationBatchStatus.DECIDED_REJECTED


class ApplicationOrigin(models.TextChoices):
    HANDLER = "handler", _("Handler")
    APPLICANT = "applicant", _("Applicant")


class PaySubsidyGranted(models.TextChoices):
    GRANTED = "granted", _("Pay subsidy granted (default)")
    GRANTED_AGED = "granted_aged", _("Pay subsidy granted (aged)")
    NOT_GRANTED = "not_granted", _("No granted pay subsidy")


class AhjoStatus(models.TextChoices):
    # The possible statuses for Ahjo processing
    SUBMITTED_BUT_NOT_SENT_TO_AHJO = "submitted_but_not_sent_to_ahjo", _(
        "Submitted but not sent to AHJO"
    )
    REQUEST_TO_OPEN_CASE_SENT = "request_to_open_case_sent", _(
        "Request to open the case sent to AHJO"
    )
    CASE_OPENED = "case_opened", _("Case opened in AHJO")
    UPDATE_REQUEST_SENT = "update_request_sent", _("Update request sent")
    UPDATE_REQUEST_RECEIVED = "update_request_received", _("Update request received")
    DECISION_PROPOSAL_SENT = "decision_proposal_sent", _("Decision proposal sent")
    DECISION_PROPOSAL_ACCEPTED = "decision_proposal_accepted", _(
        "Decision proposal accepted"
    )
    DECISION_PROPOSAL_REJECTED = "decision_proposal_rejected", _(
        "Decision proposal rejected"
    )
    DELETE_REQUEST_SENT = "delete_request_sent", _("Delete request sent")
    DELETE_REQUEST_RECEIVED = "delete_request_received", _("Delete request received")


class ApplicationActions(models.TextChoices):
    HANDLER_ALLOW_APPLICATION_EDIT = "HANDLER_ALLOW_APPLICATION_EDIT", _(
        "Allow/disallow applicant's modifications to the application"
    )


class AhjoCallBackStatus(models.TextChoices):
    SUCCESS = "Success", _("Success")
    FAILURE = "Failure", _("Failure")


class AhjoRequestType(models.TextChoices):
    OPEN_CASE = "open_case", _("Open case in Ahjo")
    DELETE_APPLICATION = "delete_application", _("Delete application in Ahjo")
    UPDATE_APPLICATION = "update_application", _("Update application in Ahjo")
    SEND_DECISION_PROPOSAL = "send_decision", _("Send decision to Ahjo")


class DecisionProposalTemplateSectionType(models.TextChoices):
    DECISION_SECTION = "decision_section", _(
        "Template part for the decision section of a application decision proposal"
    )
    JUSTIFICATION_SECTION = "justification_section", _(
        "Template part for the decision justification section of a decision proposal"
    )


class DecisionType(models.TextChoices):
    ACCEPTED = "accepted_decision", _("An accepted decision")
    DENIED = "denied_decision", _("A denied decision")


class ApplicationAlterationType(models.TextChoices):
    TERMINATION = "termination", _("Termination")
    SUSPENSION = "suspension", _("Suspension")


class ApplicationAlterationState(models.TextChoices):
    RECEIVED = "received", _("Received")
    OPENED = "opened", _("Opened")
    HANDLED = "handled", _("Handled")
