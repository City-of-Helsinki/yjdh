import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from staff_admin_permissions.constants import ADMIN_GROUP_NAME
from staff_admin_permissions.signals import initialize_admins_group

User = get_user_model()  # noqa: N806


@pytest.mark.django_db
def test_initialize_admins_group():
    """Test that the initialize signal creates the group but NOT permissions."""
    Group.objects.filter(name=ADMIN_GROUP_NAME).delete()

    initialize_admins_group(sender=None)

    assert Group.objects.filter(name=ADMIN_GROUP_NAME).exists()
    admins_group = Group.objects.get(name=ADMIN_GROUP_NAME)
    # Should be empty of permissions initially
    assert admins_group.permissions.count() == 0


@pytest.mark.django_db
@pytest.mark.parametrize(
    "auto_assign_flag,is_staff,expect_group",
    [
        (True, True, True),  # Auto-assign enabled: Staff user -> added to group
        (False, True, False),  # Auto-assign disabled: Staff user -> NOT added
        (True, False, False),  # Auto-assign enabled: Normal user -> NOT added
        (False, False, False),  # Auto-assign disabled: Normal user -> NOT added
    ],
)
def test_assign_admins_group_logic(auto_assign_flag, is_staff, expect_group):
    """
    Parametrized test for 'assign_admins_group' signal logic.
    """
    settings.AUTO_ASSIGN_ADMIN_TO_STAFF = auto_assign_flag

    # Ensure group exists
    initialize_admins_group(sender=None)

    user = User.objects.create_user(
        username=f"test_user_{auto_assign_flag}_{is_staff}",
        password="pw",
        is_staff=is_staff,
    )

    admins_group = Group.objects.get(name=ADMIN_GROUP_NAME)
    if expect_group:
        assert admins_group in user.groups.all()
    else:
        assert admins_group not in user.groups.all()


@pytest.mark.django_db
def test_assign_admins_group_skips_if_group_missing(caplog):
    """
    Test that it handles the case gracefully if the admin group doesn't exist.
    """
    settings.AUTO_ASSIGN_ADMIN_TO_STAFF = True
    # Ensure group does NOT exist
    Group.objects.filter(name=ADMIN_GROUP_NAME).delete()

    # This should not raise an exception
    User.objects.create_user(
        username="test_staff_no_group", password="pw", is_staff=True
    )

    assert f"'{ADMIN_GROUP_NAME}' group does not exist" in caplog.text
