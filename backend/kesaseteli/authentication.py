from django.conf import settings

from shared.azure_adfs.auth import HelsinkiAdfsAuthCodeBackend


class KesaseteliAdfsBackend(HelsinkiAdfsAuthCodeBackend):
    def update_user_groups_from_graph_api(
        self, user, user_oid: str, graph_api_access_token: str
    ):
        # Temporarily store the user on the instance so that
        # get_member_objects_from_graph_api can access it to preserve local groups.
        self._current_user = user
        try:
            super().update_user_groups_from_graph_api(
                user, user_oid, graph_api_access_token
            )
        finally:
            self._current_user = None

    def get_member_objects_from_graph_api(
        self, user_oid: str, graph_api_access_token: str
    ):
        """
        Fetches user groups from MS Graph API, and adds preserved local groups
        defined in settings.ADFS_SYSTEM_USER_GROUP_NAMES.
        """
        # Fetch actual ADFS groups from the parent class
        adfs_groups = super().get_member_objects_from_graph_api(
            user_oid, graph_api_access_token
        )

        # If there is a user context, add preserved groups
        user = getattr(self, "_current_user", None)
        if user:
            system_group_names = getattr(settings, "ADFS_SYSTEM_USER_GROUP_NAMES", [])

            if not system_group_names:
                return adfs_groups

            current_system_groups = list(
                user.groups.filter(name__in=system_group_names).values_list(
                    "name", flat=True
                )
            )
            # Add preserved groups to the ADFS list.
            # Use set to avoid duplicates but return list as expected
            return list(set(adfs_groups) | set(current_system_groups))

        return adfs_groups
