import uuid

from django.db import models
from simple_history.models import HistoricalRecords


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
