from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate, post_save


class StaffAdminPermissionsConfig(AppConfig):
    name = "staff_admin_permissions"
    verbose_name = "Staff Admin Permissions"

    def ready(self):
        from . import signals

        # Connect signal to ensure 'admins' group exists after migration
        post_migrate.connect(signals.initialize_admins_group)

        # Connect signal to assign admin group to new staff users
        post_save.connect(signals.assign_admins_group, sender=get_user_model())
