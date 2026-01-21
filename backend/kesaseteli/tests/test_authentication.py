from unittest import mock

import pytest
from backend.kesaseteli.authentication import KesaseteliAdfsBackend
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()


@pytest.mark.django_db
def test_kesaseteli_adfs_backend_preserves_system_groups(settings):
    """
    Test that KesaseteliAdfsBackend.update_user_groups_from_graph_api
    preserves groups defined in settings.ADFS_SYSTEM_USER_GROUP_NAMES
    while still syncing new groups from Graph API.
    """
    # 1. Setup settings
    system_group_name = "system-protected-group"
    other_group_name = "random-local-group"
    adfs_group_name = "adfs-new-group"

    settings.ADFS_SYSTEM_USER_GROUP_NAMES = [system_group_name]

    # 2. Setup user and existing groups
    user = User.objects.create(username="testuser")

    system_group = Group.objects.create(name=system_group_name)
    other_group = Group.objects.create(name=other_group_name)

    user.groups.add(system_group)
    user.groups.add(other_group)

    # 3. Setup Backend and Mock Graph API response
    backend = KesaseteliAdfsBackend()

    # Mock the get_member_objects_from_graph_api method of the PARENT class
    # so that our override in KesaseteliAdfsBackend still runs.
    with mock.patch(
        "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend.get_member_objects_from_graph_api",
        return_value=[adfs_group_name],
    ):
        # 4. Invoke the method
        backend.update_user_groups_from_graph_api(user, "user-oid-123", "fake-token")

    # 5. Assertions
    user.refresh_from_db()
    user_groups = list(user.groups.values_list("name", flat=True))

    # Should contain the ADFS group
    assert adfs_group_name in user_groups
    # Should contain the preserved system group
    assert system_group_name in user_groups
    # Should NOT contain the random local group
    # (it wasn't in ADFS list and not preserved)
    assert other_group_name not in user_groups

    # Verify exact contents
    assert set(user_groups) == {adfs_group_name, system_group_name}
