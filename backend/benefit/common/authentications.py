import binascii
from base64 import b64decode

from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed


class RobotBasicAuthentication(authentication.BaseAuthentication):
    """
    HTTP Basic authentication against preset credentials.
    """

    www_authenticate_realm = "api"
    credentials = settings.TALPA_ROBOT_AUTH_CREDENTIAL

    def authenticate(self, request):
        try:
            auth, encoded = authentication.get_authorization_header(request).split(
                maxsplit=1
            )
        except ValueError:
            raise AuthenticationFailed("Invalid basic header.")

        if not auth or auth.lower() != b"basic":
            raise AuthenticationFailed("Authentication needed")

        try:
            credentials = b64decode(encoded).decode(authentication.HTTP_HEADER_ENCODING)
        except (TypeError, UnicodeDecodeError, binascii.Error):
            raise AuthenticationFailed(
                "Invalid basic header. Credentials not correctly base64 encoded."
            )

        if self.credentials != credentials:
            raise AuthenticationFailed("Invalid username/password.")

    def authenticate_header(self, request):
        return 'Basic realm="{}"'.format(self.www_authenticate_realm)
