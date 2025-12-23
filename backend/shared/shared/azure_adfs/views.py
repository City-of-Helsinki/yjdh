import logging
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.shortcuts import redirect
from django.utils.encoding import iri_to_uri
from django.utils.http import url_has_allowed_host_and_scheme
from django_auth_adfs.views import OAuth2CallbackView

LOGGER = logging.getLogger(__name__)


class HelsinkiOAuth2CallbackView(OAuth2CallbackView):
    """
    Custom OAuth2 Callback view that prioritizes specific landing pages
    for clients while preserving deep links for Admin/Staff.
    """

    @classmethod
    def is_response_adfs_authorization_redirect(cls, response):
        """
        Detects if the library is initiating a Multi-Factor Authentication (MFA)
        redirect back to ADFS. Is the response a redirect to ADFS authorization URL?

        NOTE: This is not a foolproof method of detecting if the redirect is to ADFS
        authorization URL. The detection depends on the query parameters being set by
        django_auth_adfs.config.ProviderConfig.build_authorization_endpoint, see
        https://github.com/snok/django-auth-adfs/blob/1.7.0/django_auth_adfs/config.py#L321-L327

        The build_authorization_endpoint function is called by the super class's
        OAuth2CallbackView.get function when user authentication fails and multi-factor
        authentication is required, see
        https://github.com/snok/django-auth-adfs/blob/1.7.0/django_auth_adfs/views.py#L38

        :return: True if response's status code is 302 i.e. redirect, response's URL
                 contains query parameters response_type, client_id, resource,
                 redirect_uri and state, and response_type query parameter's value is
                 code, otherwise False.
        """
        return (
            response.status_code == 302
            and (url_query_parameters := parse_qs(urlparse(response.url).query))
            and set(url_query_parameters.keys()).issuperset(
                {
                    # Require following URL query parameters:
                    "response_type",
                    "client_id",
                    "resource",
                    "redirect_uri",
                    "state",
                }
            )
            and url_query_parameters.get("response_type") == ["code"]
        )

    def get(self, request):
        """
        Processes the ADFS callback and determines the final redirect destination.
        """
        # 1. Let the parent class handle the token exchange.
        # It will set response.url based on the 'state' parameter
        # (the original 'next' URL).
        response = super().get(request)

        if response.status_code == 302:
            # Check if this is an MFA redirect back to ADFS; if so, don't interfere.
            if self.is_response_adfs_authorization_redirect(response):
                return response

            # Check for any custom session flags to skip our custom logic
            if request.session.pop("USE_ORIGINAL_REDIRECT_URL", False):
                return response

            # 2. Extract and sanitize the target URL provided by the library
            target_url = response.url

            # Security: Ensure the URL is safe for our domain
            is_safe = url_has_allowed_host_and_scheme(
                url=target_url,
                allowed_hosts={request.get_host()},
                require_https=request.is_secure(),
            )

            if is_safe:
                # We want to honor 'next' only if it points to Admin
                # OR if it is a specific deep-link that isn't just the default home.

                # Fetch default landing from settings (usually "/" or
                # "/accounts/profile/")
                default_login_url = getattr(settings, "LOGIN_REDIRECT_URL", "/")

                # Logic: If it's the admin site, always allow the redirect.
                is_admin_path = target_url.startswith("/admin")

                # Logic: Is the user trying to reach a specific page?
                # (e.g. they aren't just hitting the default landing page)
                is_specific_destination = (
                    target_url != default_login_url
                    and target_url != "/"
                    and target_url != ""
                )

                if is_admin_path or is_specific_destination:
                    # Return the original response with the deep-link
                    response.url = iri_to_uri(target_url)
                    return response

            # 3. Fallback: Force regular client login to the Export Downloads page.
            return redirect(settings.ADFS_LOGIN_REDIRECT_URL)

        # 4. Error Handling
        error_map = {
            400: "No authorization code was provided.",
            403: "Your account is disabled.",
        }
        error_message = error_map.get(response.status_code, "Login failed.")

        LOGGER.error(
            f"Invalid login. Status code: {response.status_code}. "
            f"Error: {error_message}"
        )
        return redirect(settings.ADFS_LOGIN_REDIRECT_URL_FAILURE)
