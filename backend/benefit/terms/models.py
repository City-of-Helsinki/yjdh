from datetime import date

from applications.models import Application
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from terms.enums import TermsType

from shared.models.abstract_models import TimeStampedModel, UUIDModel


class Terms(UUIDModel, TimeStampedModel):
    terms_type = models.CharField(
        max_length=64,
        verbose_name=_("type of terms"),
        choices=TermsType.choices,
        default=TermsType.APPLICANT_TERMS,
    )

    """
    If effective_from is set to null, that means the terms are not to be displayed to the applicant.
    """
    effective_from = models.DateField(
        verbose_name=_("first day these terms are in effect"), null=True, blank=True
    )

    terms_pdf_fi = models.FileField(verbose_name=_("finnish terms (pdf file)"))
    terms_pdf_en = models.FileField(verbose_name=_("english terms (pdf file)"))
    terms_pdf_sv = models.FileField(verbose_name=_("swedish terms (pdf file)"))

    @property
    def is_editable(self):
        return self.effective_from is None or self.effective_from > date.today()

    def __str__(self):
        return (
            f"{self.terms_type}-{self.effective_from if self.effective_from else 'NA'}"
        )

    class Meta:
        db_table = "bf_terms"
        verbose_name = _("terms")
        verbose_name_plural = _("terms")
        unique_together = ("terms_type", "effective_from")


class ApplicantConsent(UUIDModel, TimeStampedModel):
    """
    This model represents a consent that the user gives when approving Terms.
    The consent is represented as a checkbox+text in the UI.
    """

    terms = models.ForeignKey(
        Terms,
        verbose_name=_("terms"),
        related_name="applicant_consents",
        on_delete=models.CASCADE,
    )
    text_fi = models.CharField(
        max_length=256, verbose_name=_("finnish text for the consent checkbox")
    )
    text_en = models.CharField(
        max_length=256, verbose_name=_("english text for the consent checkbox")
    )
    text_sv = models.CharField(
        max_length=256, verbose_name=_("swedish text for the consent checkbox")
    )

    def __str__(self):
        return f"{self.terms} consent: {self.text_fi}"

    class Meta:
        db_table = "bf_applicationconsents"
        verbose_name = _("application consent")
        verbose_name_plural = _("application consents")


class AbstractTermsApproval(UUIDModel, TimeStampedModel):
    approved_at = models.DateTimeField(verbose_name=_("timestamp of approval"))
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_("user who approved the terms"),
    )
    terms = models.ForeignKey(
        Terms,
        verbose_name=_("terms"),
        on_delete=models.CASCADE,
    )
    """
    API validates that the selected_applicant_consents must belong to the terms of this approval
    """
    selected_applicant_consents = models.ManyToManyField(
        ApplicantConsent,
        verbose_name=_("selected applicant consents"),
    )

    class Meta:
        abstract = True


class ApplicantTermsApproval(AbstractTermsApproval):
    """
    The "terms approval" process in UI has two steps:
    1. User is shown a PDF file with terms
    2. User needs to click a set of mandatory checkboxes in order to proceed

    In discussion with the product owners, we gathered a few requirements for the backend:
    1. The terms might change as a result of political decisions by the city, or for other reasons
    2. The set of checkboxes shown to the applicant may change, together with the Terms
    3. We need to store the exact version of terms that was shown to the user
    4. It's not enough to just store the terms, we need to store also the fact that the user checked the
       required checkboxes (even if the checkboxes are all mandatory)

    So, here, the AbstractTermsApproval is used the store the fact that:
    1. The user has been shown the terms pdf document (=one Terms object)
    2.  The user has checked all the checkboxes (=selected_applicant_consents) defined by that Terms object
        (this is actually redundant data, but I guess it helps us meet some auditing requirements). If we
        didn't have that requirement, the data model would work fine with just a ForeignKey to Terms object,
        as the applicant_consents can be accessed through it.
    """

    application = models.OneToOneField(
        Application,
        verbose_name=_("application"),
        related_name="applicant_terms_approval",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"{self.approved_by.email} approved terms {self.terms} at {self.approved_at}"

    class Meta:
        db_table = "bf_applicanttermsapproval"
        verbose_name = _("applicant terms approval")
        verbose_name_plural = _("Applicant terms approvals")
