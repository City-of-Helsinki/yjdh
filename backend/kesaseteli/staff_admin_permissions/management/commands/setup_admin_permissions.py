import logging

from django.apps import apps
from django.contrib import admin
from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand
from django.db import transaction

from staff_admin_permissions.constants import ADMIN_GROUP_NAME

LOGGER = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Creates/Updates the 'admins' group with permissions for all key models "
        "registered in the admin site."
    )

    def handle(self, *args, **options):
        with transaction.atomic():
            group, created = Group.objects.get_or_create(name=ADMIN_GROUP_NAME)
            action = "Created" if created else "Updated"

            if not apps.is_installed("django.contrib.admin"):
                msg = (
                    f"{action} group '{ADMIN_GROUP_NAME}', but 'django.contrib.admin' "
                    "is not installed. Skipping permission setup."
                )
                LOGGER.warning(msg)
                self.stdout.write(self.style.WARNING(msg))
                return

            permissions_to_add = []

            for model, _ in admin.site._registry.items():
                opts = model._meta
                codenames = [
                    f"add_{opts.model_name}",
                    f"change_{opts.model_name}",
                    f"delete_{opts.model_name}",
                    f"view_{opts.model_name}",
                ]
                perms = Permission.objects.filter(
                    content_type__app_label=opts.app_label, codename__in=codenames
                )
                permissions_to_add.extend(perms)

            group.permissions.set(permissions_to_add)

            msg = (
                f"{action} group '{ADMIN_GROUP_NAME}' with {len(permissions_to_add)} "
                "permissions."
            )
            LOGGER.info(msg)
            self.stdout.write(self.style.SUCCESS(msg))
