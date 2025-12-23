import logging
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django_auth_adfs.views import OAuth2CallbackView

LOGGER = logging.getLogger(__name__)


class HelsinkiOAuth2CallbackView(OAuth2CallbackView):
    @classmethod
    def is_response_adfs_authorization_redirect(cls, response):
        """
        Is the response a redirect to ADFS authorization URL?

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
            and url_query_parameters["response_type"] == ["code"]
        )

    def get(self, request):
        """
        Override GET method to use custom redirect urls.
        """
        response = super().get(request)

        if response.status_code == 302:
            # OAuth2CallbackView.get may return two types of redirects:
            # 1. Multi-factor authentication redirect:
            # https://github.com/snok/django-auth-adfs/blob/1.7.0/django_auth_adfs/views.py#L38
            # 2. After login page redirect:
            # https://github.com/snok/django-auth-adfs/blob/1.7.0/django_auth_adfs/views.py#L56
            if self.is_response_adfs_authorization_redirect(response):
                # NOTE: This code path has not been tested.
                # Previously if the super class returned a multi-factor authentication
                # redirect the user was not redirected to it but to the URL specified
                # by settings.ADFS_LOGIN_REDIRECT_URL.
                return response  # Redirect to multi-factor authentication endpoint
            if request.session.pop("USE_ORIGINAL_REDIRECT_URL", False):
                return response  # Redirect to the original redirect URL

            # 1. Check for manual 'next' parameter in GET request.
            # This is primarily for flows where the 'next' parameter is explicitly
            # passed to the callback URL (e.g. from the Admin login or testing).
            next_url = request.GET.get("next")
            if next_url and url_has_allowed_host_and_scheme(
                url=next_url,
                allowed_hosts={request.get_host()},
                require_https=request.is_secure(),
            ):
                return redirect(next_url)

            # 2. Check the URL determined by django-auth-adfs.
            # django-auth-adfs calculates the redirect URL (put into response.url) based
            # on:
            # - The 'next' parameter allowed by the 'state' (if authentication
            #   succeeded)
            # - Or falls back to settings.LOGIN_REDIRECT_URL.
            #
            # We want to respect the 'next' parameter if it was present (e.g. user was
            # going to /admin/). However, if it defaulted to LOGIN_REDIRECT_URL
            # (locally configured as "/"), we want to override that default with our
            # specific ADFS_LOGIN_REDIRECT_URL parameter.
            #
            # We validate response.url to ensure it is safe before redirecting.
            default_login_redirect_url = getattr(
                settings, "LOGIN_REDIRECT_URL", "/accounts/profile/"
            )
            if (
                url_has_allowed_host_and_scheme(
                    url=response.url,
                    allowed_hosts={request.get_host()},
                    require_https=request.is_secure(),
                )
                and response.url != default_login_redirect_url
            ):
                return response

            # 3. Fallback to ADFS specific redirect URL.
            # If no 'next' param was found and django-auth-adfs used the default
            # LOGIN_REDIRECT_URL, we redirect to the specific ADFS landing page.
            return redirect(settings.ADFS_LOGIN_REDIRECT_URL)
        elif response.status_code == 400:
            error_message = "No authorization code was provided."
        elif response.status_code == 403:
            error_message = "Your account is disabled."
        else:
            error_message = "Login failed."
        LOGGER.error(
            f"Invalid login. Status code: {response.status_code}. Error message:"
            f" {error_message}."
        )
        return redirect(settings.ADFS_LOGIN_REDIRECT_URL_FAILURE)
