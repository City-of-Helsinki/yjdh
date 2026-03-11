import logging
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from django.conf import settings
from django.shortcuts import redirect

try:
    from django.utils.http import url_has_allowed_host_and_scheme
except ImportError:
    from django.utils.http import is_safe_url as url_has_allowed_host_and_scheme
from django.utils.encoding import iri_to_uri
from django_auth_adfs.views import OAuth2CallbackView, OAuth2LogoutView

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
        # 1. Execute the library's standard logic.
        # This handles the OAuth2 code exchange and decodes the 'state' parameter
        # (which contains the original 'next' URL).
        response = super().get(request)

        # If the library failed (e.g., 400, 403), skip redirect logic and handle error
        if response.status_code != 302:
            return self._handle_error_response(response)

        # 2. Check for MFA or manual session overrides
        if self.is_response_adfs_authorization_redirect(response):
            return response

        if request.session.pop("USE_ORIGINAL_REDIRECT_URL", False):
            return response

        # 3. Determine the final destination
        # 'response.url' is now either the decoded 'next' path or LOGIN_REDIRECT_URL.
        target_url = response.url
        default_login_url = getattr(settings, "LOGIN_REDIRECT_URL", "/")

        # Check if the user is heading to the Admin site
        is_admin_path = target_url.startswith("/admin")

        # Check if the user is heading to a specific deep link
        # (i.e., target is NOT the generic home or default landing page)
        is_specific_destination = target_url not in (default_login_url, "/", "")

        if is_admin_path or is_specific_destination:
            # Re-encode URI to handle special characters safely in headers
            return redirect(iri_to_uri(target_url))

        # 4. Fallback.
        return redirect(settings.ADFS_LOGIN_REDIRECT_URL)

    def _handle_error_response(self, response):
        error_messages = {
            400: "No authorization code was provided.",
            403: "Your account is disabled.",
        }
        msg = error_messages.get(response.status_code, "Login failed.")
        LOGGER.error(f"Invalid login. Status: {response.status_code}. Error: {msg}")

        return redirect(settings.ADFS_LOGIN_REDIRECT_URL_FAILURE)


class HelsinkiOAuth2LogoutView(OAuth2LogoutView):
    """
    Custom OAuth2 Logout view that accepts a `next` parameter to determine where
    the user should be redirected after successful ADFS logout.

    Why override the default?
    The default `django_auth_adfs.views.OAuth2LogoutView` does not support dynamic
    redirects upon logout. It clears the local session but statically redirects to the
    Azure AD endpoint without passing a return URL, leaving the user stranded or
    subject to fallback logic. By overriding it, we can intercept the response
    and append the `post_logout_redirect_uri` parameter based on the `next` value
    passed by the client (e.g. Handlers UI or Django Admin), ensuring graceful
    multi-client support. For example, the Django Admin site natively appends
    `?next=/admin/` to login and logout requests, which this view can safely
    parse and redirect back to.
    """

    def _append_next_url_to_response(self, request, response):
        next_url = request.GET.get("next")
        # Derive allowed hosts from the configured CORS origins to ensure that
        # url_has_allowed_host_and_scheme receives a proper host allow-list.
        allowed_hosts = {
            urlparse(origin).netloc
            for origin in getattr(settings, "CORS_ALLOWED_ORIGINS", []) or []
            if urlparse(origin).netloc
        }
        if next_url and url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts=allowed_hosts,
            require_https=request.is_secure(),
        ):
            # Append the post_logout_redirect_uri parameter for Azure AD
            url_parts = list(urlparse(response.url))
            query = parse_qs(url_parts[4])
            query.update({"post_logout_redirect_uri": [next_url]})
            url_parts[4] = urlencode(query, doseq=True)
            response["Location"] = urlunparse(url_parts)

        return response

    def get(self, request):
        return self._append_next_url_to_response(request, super().get(request))

    def post(self, request):
        return self._append_next_url_to_response(request, super().post(request))
