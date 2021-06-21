import logging
import uuid

import requests
from django.contrib.auth.models import Group
from django.core.exceptions import PermissionDenied
from django_auth_adfs.backend import AdfsAuthCodeBackend
from django_auth_adfs.config import provider_config, settings
from django_auth_adfs.exceptions import MFARequired

LOGGER = logging.getLogger(__name__)


class HelsinkiAdfsAuthCodeBackend(AdfsAuthCodeBackend):
    def get_member_objects_from_graph_api(
        self, user_oid: str, graph_api_access_token: str
    ):
        """
        Fetches user groups from MS Graph API, validates the group names and adds
        "adfs-" prefix for them.

        :returns A list of group names
        """
        url = f"https://graph.microsoft.com/v1.0/users/{user_oid}/getMemberObjects"

        headers = {
            "Authorization": f"Bearer {graph_api_access_token}",
        }

        data = {"securityEnabledOnly": False}

        response = requests.post(
            url,
            json=data,
            headers=headers,
        )
        response.raise_for_status()

        # This will be a list of UUIDs. We will use them as group names in Django.
        groups = response.json()["value"]

        # Validate group names and add prefix
        try:
            for group in groups:
                uuid.UUID(group)
            groups = ["adfs-" + group for group in groups]
        except ValueError:
            groups = []

        return groups

    def update_user_groups_from_graph_api(
        self, user, user_oid: str, graph_api_access_token: str
    ):
        """
        This method is derived from `django_auth_adfs.backend.AdfsBaseBackend.update_user_groups`.
        """
        groups = self.get_member_objects_from_graph_api(
            user_oid, graph_api_access_token
        )

        user_existing_groups_groups = [group.name for group in user.groups.all()]

        if sorted(groups) != sorted(user_existing_groups_groups):
            new_groups = [Group.objects.get_or_create(name=name)[0] for name in groups]
            user.groups.set(new_groups)

    def get_graph_api_access_token(self, access_token):
        """
        Handles the Microsoft On-Behalf-Of flow to fetch an access token that can be
        used with Microsoft Graph API. We will use the v2.0 enpoint to fetch this
        token.
        This method is derived from `django_auth_adfs.backend.AdfsBaseBackend.exchange_auth_code` but the
        data is changed according to the OBO flow and the token endpiont is changed to v2.0.

        Docs: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow
        """
        data = {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "client_id": settings.CLIENT_ID,
            "assertion": access_token,
            "scope": "https://graph.microsoft.com/user.read",
            "requested_token_use": "on_behalf_of",
        }
        if settings.CLIENT_SECRET:
            data["client_secret"] = settings.CLIENT_SECRET

        token_endpoint = provider_config.token_endpoint.replace(
            "oauth2/", "oauth2/v2.0/"
        )
        LOGGER.debug("Getting access token at: %s", provider_config.token_endpoint)
        response = provider_config.session.post(
            token_endpoint, data, timeout=settings.TIMEOUT
        )
        # 200 = valid token received
        # 400 = 'something' is wrong in our request
        if response.status_code == 400:
            if response.json().get("error_description", "").startswith("AADSTS50076"):
                # This error description indicates that multi factor authentication is required.
                raise MFARequired
            LOGGER.error(
                "ADFS (OBO) server returned an error: %s",
                response.json()["error_description"],
            )
            raise PermissionDenied

        if response.status_code != 200:
            LOGGER.error(
                "Unexpected ADFS (OBO) response: %s", response.content.decode()
            )
            raise PermissionDenied

        response_json = response.json()

        return response_json["access_token"]

    def authenticate(self, request=None, authorization_code=None, **kwargs):
        """
        Override the authenticate method to fetch the user groups from Microsoft Graph API
        instead of getting them from the claims.
        This is done because of the limited size of the (JWT) access token that sometimes
        cannot fit all of the groups in the claims.

        Docs: https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens#groups-overage-claim
        """
        # If loaded data is too old, reload it again
        provider_config.load_config()

        # If there's no token or code, we pass control to the next authentication backend
        if authorization_code is None or authorization_code == "":
            return

        adfs_response = self.exchange_auth_code(authorization_code, request)
        access_token = adfs_response["access_token"]
        claims = self.validate_access_token(access_token)

        user = self.process_access_token(access_token, adfs_response)

        graph_api_access_token = self.get_graph_api_access_token(access_token)

        self.update_user_groups_from_graph_api(
            user, claims["oid"], graph_api_access_token
        )

        return user
