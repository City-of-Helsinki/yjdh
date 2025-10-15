from datetime import datetime
from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db import models
from helsinki_gdpr.models import SerializableMixin


def format_date(date: datetime) -> str | None:
    return date.strftime("%d-%m-%Y %H:%M:%S") if date else None


class User(AbstractUser, SerializableMixin):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    ad_username = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "bf_users_user"

    def is_handler(self):
        return self.is_staff

    serialize_fields = (
        {"name": "first_name"},
        {"name": "last_name"},
        {"name": "email"},
        {"name": "date_joined", "accessor": lambda x: format_date(x)},
        {"name": "last_login", "accessor": lambda x: format_date(x)},
    )
