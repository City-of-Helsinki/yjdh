from django.db import models
from django.utils.translation import gettext_lazy as _

from applications.enums import OrganizationType
from shared.models.abstract_models import TimeStampedModel, UUIDModel


class Company(UUIDModel, TimeStampedModel):
    name = models.CharField(max_length=256, verbose_name=_("name"))
    business_id = models.CharField(
        max_length=64, unique=True, verbose_name=_("business id")
    )
    company_form = models.CharField(
        max_length=64, blank=True, verbose_name=_("company form")
    )
    industry = models.CharField(max_length=256, blank=True, verbose_name=_("industry"))

    street_address = models.CharField(
        max_length=256, blank=True, verbose_name=_("street address")
    )
    postcode = models.CharField(max_length=256, blank=True, verbose_name=_("postcode"))
    city = models.CharField(max_length=256, blank=True, verbose_name=_("city"))
    organization_type = models.CharField(
        # Rationale for this field:
        #
        # Organization type is similar to company_form data which comes from VTJ,
        # but has specific choices requested by product owner for reporting purposes.
        #
        # For example parish (i.e. seurakunta in Finnish) is a category which
        # is at least not evidently mappable from company_form value, and thus
        # needs to be asked from the user.
        max_length=64,
        verbose_name=_("organization type"),
        blank=True,
        choices=OrganizationType.choices,
    )
    ytj_json = models.JSONField(blank=True, null=True, verbose_name=_("ytj json"))

    class Meta:
        verbose_name = _("company")
        verbose_name_plural = _("companies")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.business_id})"
