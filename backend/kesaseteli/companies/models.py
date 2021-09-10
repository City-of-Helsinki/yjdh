from django.db import models
from django.utils.translation import gettext_lazy as _
from shared.models.abstract_models import UUIDModel


class Company(UUIDModel):
    name = models.CharField(max_length=256, verbose_name=_("name"))
    business_id = models.CharField(max_length=64, verbose_name=_("business id"))
    company_form = models.CharField(
        max_length=64, blank=True, verbose_name=_("company form")
    )
    industry = models.CharField(max_length=256, blank=True, verbose_name=_("industry"))

    street_address = models.CharField(
        max_length=256, blank=True, verbose_name=_("street address")
    )
    postcode = models.CharField(max_length=256, blank=True, verbose_name=_("postcode"))
    city = models.CharField(max_length=256, blank=True, verbose_name=_("city"))

    ytj_json = models.JSONField(blank=True, null=True, verbose_name=_("ytj json"))

    eauth_profile = models.OneToOneField(
        "oidc.EAuthorizationProfile",
        on_delete=models.SET_NULL,
        related_name="company",
        verbose_name=_("eauthorization profile"),
        null=True,
    )
