import hashlib
from typing import Any

from djangosaml2.backends import Saml2Backend


class SuomiFiSAML2AuthenticationBackend(Saml2Backend):
    def clean_user_main_attribute(self, main_attribute: Any) -> Any:
        """Return hash of Suomi.fi SSO session identifier.

        SSO session identifier is over the normal 150 character username limit.
        """
        digest = hashlib.sha3_512(main_attribute.encode()).hexdigest()
        return super().clean_user_main_attribute(digest)
