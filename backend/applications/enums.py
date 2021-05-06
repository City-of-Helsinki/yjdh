from django.db import models
from django.utils.translation import gettext_lazy as _


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
