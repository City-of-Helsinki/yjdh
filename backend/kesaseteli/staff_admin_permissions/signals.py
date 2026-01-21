import logging

from django.conf import settings
from django.contrib.auth.models import Group

LOGGER = logging.getLogger(__name__)


def initialize_admins_group(sender, **kwargs):
    """
    Ensure the 'admins' group exists after migration.
    This does NOT assign permissions, only creates the empty group if missing.
    """
    if not settings.AD_ADMIN_GROUP_NAME:
        LOGGER.info(
            "AD_ADMIN_GROUP_NAME is not set (None or empty). "
            "Skipping creation of admin group."
        )
        return

    group, created = Group.objects.get_or_create(name=settings.AD_ADMIN_GROUP_NAME)
    if created:
        LOGGER.info(f"Created group '{settings.AD_ADMIN_GROUP_NAME}'.")


def assign_admins_group(sender, instance, created, **kwargs):
    """
    Assign the admin group to newly created staff users
    ONLY if we are in a development environment (AUTO_ASSIGN_ADMIN_TO_STAFF is True).
    """
    if not settings.AD_ADMIN_GROUP_NAME:
        LOGGER.info(
            "AD_ADMIN_GROUP_NAME is not set (None or empty). "
            "Skipping assignment of admin group."
        )
        return

    if created and instance.is_staff:
        if not settings.AUTO_ASSIGN_ADMIN_TO_STAFF:
            LOGGER.info(
                f"Skipping auto-assignment of '{settings.AD_ADMIN_GROUP_NAME}' "
                f"group for user {instance} "
                "because AUTO_ASSIGN_ADMIN_TO_STAFF is not enabled."
            )
            return

        try:
            group = Group.objects.get(name=settings.AD_ADMIN_GROUP_NAME)
            instance.groups.add(group)
            LOGGER.info(
                f"Added user {instance} to '{settings.AD_ADMIN_GROUP_NAME}' group."
            )
        except Group.DoesNotExist:
            LOGGER.warning(
                f"'{settings.AD_ADMIN_GROUP_NAME}' group does not exist. Skipping group assignment."
            )
