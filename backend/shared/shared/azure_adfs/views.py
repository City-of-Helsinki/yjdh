import logging

from django.conf import settings
from django.shortcuts import redirect
from django_auth_adfs.views import OAuth2CallbackView

LOGGER = logging.getLogger(__name__)


class HelsinkiOAuth2CallbackView(OAuth2CallbackView):
    def get(self, request):
        """
        Override GET method to use custom redirect urls.
        """
        response = super().get(request)

        if response.status_code == 302:
            return redirect(settings.ADFS_LOGIN_REDIRECT_URL)
        elif response.status_code == 400:
            error_message = "No authorization code was provided."
        elif response.status_code == 403:
            error_message = "Your account is disabled."
        else:
            error_message = "Login failed."
        LOGGER.error(
            f"Invalid login. Status code: {response.status_code}. Error message: {error_message}."
        )
        return redirect(settings.ADFS_LOGIN_REDIRECT_URL_FAILURE)
