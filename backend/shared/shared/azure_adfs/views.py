import base64
import binascii
import logging
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.shortcuts import redirect
from django.utils.encoding import iri_to_uri
from django_auth_adfs.views import OAuth2CallbackView, OAuth2LogoutView

from shared.common.utils import is_safe_redirect_url

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

    def _apply_state_redirect_override(self, request, response):
        """
        Manually recover cross-origin redirect targets from the 'state' parameter.

        Why is this needed?
        The underlying `django-auth-adfs` library has a hardcoded host check: it only
        allows redirects back to the exact same host that initiated the login.
        In local development and multi-client environments, we often need to jump
        from the API (e.g. localhost:8000) back to a specific UI (e.g. localhost:3200).

        This method extracts the base64-encoded 'next' URL from the OAuth2 'state'
        parameter. If the decoded URL is safe and belongs to an authorized host
        (as defined by `self._get_allowed_hosts()`), we manually override the
        Location header in the response object to ensure the user lands on the
        correct client application.

        References:
        - This limitation is documented in: https://github.com/snok/django-auth-adfs/issues/355.
        """
        state = request.GET.get("state")

        # If there is no state, there is nothing to do.
        if not state:
            return response
        try:
            decoded_next = base64.urlsafe_b64decode(state.encode()).decode()
            # Check if the recovered URL is safe and authorized
            if is_safe_redirect_url(self.request, decoded_next):
                response["Location"] = iri_to_uri(decoded_next)
            else:
                message = (
                    f"ADFS callback 'state' contained an unauthorized or "
                    f"unsafe redirect target: {decoded_next}"
                )
                LOGGER.warning(message)
                raise SuspiciousOperation(message)
        except SuspiciousOperation:
            raise
        except (ValueError, binascii.Error):
            # NOTE: this should have had failed already with super().get().
            # This was likely a standard ADFS state, not our custom one.
            LOGGER.debug(
                f"ADFS callback 'state' parameter is not our custom base64 URL: {state}"
            )
        return response

    def get(self, request):
        # 1. Execute the library's standard logic.
        # This handles the OAuth2 code exchange and decodes the 'state' parameter
        # (which contains the original 'next' URL).
        response = super().get(request)

        # If the library failed (e.g., 400, 403), skip redirect logic and handle error
        if response.status_code != 302:
            return self._handle_error_response(response)

        # 2. Safety Case: Do not interfere with "Don't Touch" redirects.
        # If the library is redirecting back to ADFS for MFA (Multi-Factor Auth),
        # we must return immediately. If we proceeded to the state-override
        # below, we would accidentally replace the MFA challenge URL with the
        # final application URL, breaking the login flow.
        if self.is_response_adfs_authorization_redirect(response):
            return response

        # 3. Escape hatch: Manual session-based overrides.
        # If this flag is set in the session, we return the library's choice
        # immediately and skip the state-based redirect recovery below.
        if request.session.pop("USE_ORIGINAL_REDIRECT_URL", False):
            return response

        # 4. Final routing: Override the redirect if 'state' provides an authorized
        # destination. django-auth-adfs only allows the same host, so cross-origin
        # targets are manually recovered here.
        return self._apply_state_redirect_override(request, response)

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
        if next_url and is_safe_redirect_url(self.request, next_url):
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
