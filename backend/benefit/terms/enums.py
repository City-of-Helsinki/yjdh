from django.db import models
from django.utils.translation import gettext_lazy as _


class TermsType(models.TextChoices):
    TERMS_OF_SERVICE = "terms_of_service", _("Terms of service - shown at login")
    APPLICANT_TERMS = "applicant_terms", _(
        "Terms of application - show at application submit"
    )
