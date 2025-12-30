from unittest.mock import Mock, patch

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management import call_command

from staff_admin_permissions.constants import ADMIN_GROUP_NAME


@pytest.mark.django_db
def test_setup_admin_permissions_command():
    """
    Test that the setup_admin_permissions command:
    1. Creates the 'admins' group.
    2. Assigns permissions to it.
    """
    settings.AUTO_ASSIGN_ADMIN_TO_STAFF = True
    # Ensure group doesn't exist initially
    Group.objects.filter(name=ADMIN_GROUP_NAME).delete()

    user_model = get_user_model()

    # Mock apps.is_installed to return True for 'django.contrib.admin'
    with patch(
        "staff_admin_permissions.management.commands.setup_admin_permissions.apps.is_installed",
        return_value=True,
    ):
        # Mock admin.site._registry to pretend User model is registered
        with patch(
            "django.contrib.admin.site._registry",
            {user_model: Mock()},
        ):
            # Run the command
            call_command("setup_admin_permissions")

    # Verify group exists
    assert Group.objects.filter(name=ADMIN_GROUP_NAME).exists()

    admins_group = Group.objects.get(name=ADMIN_GROUP_NAME)
    # Since we mocked registry to only have User, we check User permissions
    assert admins_group.permissions.count() > 0

    # Verify a specific common permission exists (e.g., add_user)
    user_ct = ContentType.objects.get_for_model(user_model)
    add_user_perm = Permission.objects.get(content_type=user_ct, codename="add_user")
    assert add_user_perm in admins_group.permissions.all()
