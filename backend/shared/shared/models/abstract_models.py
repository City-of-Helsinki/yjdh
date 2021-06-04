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


class AbstractCompany(models.Model):
    """
    TODO: Shared company fields go here
    """

    class Meta:
        abstract = True
