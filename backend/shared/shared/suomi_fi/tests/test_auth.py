import hashlib
import secrets

import pytest
from django.core.exceptions import ImproperlyConfigured

from shared.suomi_fi.auth import SuomiFiSAML2AuthenticationBackend


@pytest.mark.django_db
def test_suomifi_auth_backend_hashes_main_attribute(settings):
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = "test_salt"

    backend = SuomiFiSAML2AuthenticationBackend()
    main_attribute = "010101-123A"

    expected_hash = hashlib.sha3_512(f"test_salt{main_attribute}".encode()).hexdigest()

    cleaned_attribute = backend.clean_user_main_attribute(main_attribute)

    assert cleaned_attribute == expected_hash
    assert len(cleaned_attribute) == 128  # sha3_512 hexdigest length


@pytest.mark.django_db
def test_suomifi_auth_backend_raises_with_empty_salt(settings):
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = ""

    backend = SuomiFiSAML2AuthenticationBackend()
    main_attribute = "010101-123A"

    with pytest.raises(
        ImproperlyConfigured, match="Required SOCIAL_SECURITY_NUMBER_HASH_KEY is empty."
    ):
        backend.clean_user_main_attribute(main_attribute)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "salt",
    [
        "test-salt-123",
        secrets.token_hex(16),
        secrets.token_urlsafe(32),
    ],
)
@pytest.mark.parametrize(
    "ssn",
    [
        "010101-123A",
        "120202-345B",
    ],
)
def test_suomifi_auth_backend_authenticate_uses_mapped_attribute(settings, salt, ssn):
    settings.SOCIAL_SECURITY_NUMBER_HASH_KEY = salt
    settings.SAML_USE_NAME_ID_AS_USERNAME = False
    settings.SAML_DJANGO_USER_MAIN_ATTRIBUTE = "username"

    backend = SuomiFiSAML2AuthenticationBackend()
    session_info = {
        "ava": {
            "nationalIdentificationNumber": [ssn],
            "givenName": ["Test"],
            "sn": ["User"],
        },
        "issuer": "https://test-idp.example.com/",
        "name_id": "irrelevant-because-SAML_USE_NAME_ID_AS_USERNAME-is-False",
    }

    attribute_mapping = {
        "nationalIdentificationNumber": ("username",),
        "givenName": ("first_name",),
        "sn": ("last_name",),
    }

    user = backend.authenticate(
        None, session_info=session_info, attribute_mapping=attribute_mapping
    )

    assert user is not None
    expected_username = hashlib.sha3_512(f"{salt}{ssn}".encode()).hexdigest()
    assert user.username == expected_username
    assert user.first_name == "Test"
    assert user.last_name == "User"
