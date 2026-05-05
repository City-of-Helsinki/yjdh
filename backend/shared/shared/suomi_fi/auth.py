import hashlib
from typing import Any

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from djangosaml2.backends import Saml2Backend


class SuomiFiSAML2AuthenticationBackend(Saml2Backend):
    def clean_user_main_attribute(self, main_attribute: Any) -> Any:
        """
        Return salted hash of Suomi.fi nationalIdentificationNumber.

        This prevents storing the raw national identification number as the username.
        """
        salt = settings.SOCIAL_SECURITY_NUMBER_HASH_KEY

        if not salt or not salt.strip():
            raise ImproperlyConfigured(
                "Required SOCIAL_SECURITY_NUMBER_HASH_KEY is empty."
            )

        digest = hashlib.sha3_512(f"{salt}{main_attribute}".encode()).hexdigest()
        return super().clean_user_main_attribute(digest)
