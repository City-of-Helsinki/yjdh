import binascii
import secrets
from base64 import b64decode

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

TALPA_ROBOT_AUTH_NAME = "talpa_robot"


class TalpaRobotBasicAuthentication(authentication.BaseAuthentication):
    """
    HTTP Basic Auth fallback for the Talpa webhook.
    Used when Talpa cannot send the X-Api-Key header.
    Credential is stored in settings.TALPA_ROBOT_AUTH_CREDENTIAL as
    a "username:password" string.
    """

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request)
        if not auth_header:
            return None  # Let the next authenticator (or permission) handle it
        try:
            auth_type, encoded = auth_header.split(maxsplit=1)
        except ValueError:
            raise AuthenticationFailed("Invalid Basic header.")

        if auth_type.lower() != b"basic":
            return None  # Not Basic Auth, skip

        try:
            credentials = b64decode(encoded).decode(authentication.HTTP_HEADER_ENCODING)
        except (TypeError, UnicodeDecodeError, binascii.Error):
            raise AuthenticationFailed(
                "Invalid Basic header. Credentials not correctly base64 encoded."
            )

        expected = getattr(settings, "TALPA_ROBOT_AUTH_CREDENTIAL", "")
        if not expected:
            raise AuthenticationFailed(
                "Basic Auth is not configured for this endpoint."
            )
        if not secrets.compare_digest(
            expected.encode("utf-8"), credentials.encode("utf-8")
        ):
            raise AuthenticationFailed("Invalid credentials.")
        return (AnonymousUser(), TALPA_ROBOT_AUTH_NAME)

    def authenticate_header(self, request):
        return 'Basic realm="api"'
