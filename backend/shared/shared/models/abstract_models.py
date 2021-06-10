import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("time created"))
    modified_at = models.DateTimeField(auto_now=True, verbose_name=_("time modified"))

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class HistoricalModel(models.Model):
    """
    Keeps a simple history of the changes for the model.
    """

    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True


class AbstractCompany(UUIDModel):
    name = models.CharField(max_length=256, verbose_name=_("name"))
    business_id = models.CharField(max_length=64, verbose_name=_("business id"))
    company_form = models.CharField(max_length=64, verbose_name=_("company form"))

    street_address = models.CharField(max_length=256, verbose_name=_("street address"))
    postcode = models.CharField(max_length=256, verbose_name=_("postcode"))
    city = models.CharField(max_length=256, verbose_name=_("city"))

    class Meta:
        abstract = True
