import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from helsinki_gdpr.models import SerializableMixin


class User(AbstractUser, SerializableMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        db_table = "bf_users_user"

    def is_handler(self):
        return self.is_staff

    serialize_fields = (
        {"name": "first_name"},
        {"name": "last_name"},
        {"name": "email"},
        {"name": "date_joined", "accessor": lambda x: x.strftime("%d-%m-%Y %H:%M:%S")},
        {"name": "last_login", "accessor": lambda x: x.strftime("%d-%m-%Y %H:%M:%S")},
        {"name": "terms_of_service_approvals"},
        {"name": "calculations"},
    )
