"""Regression coverage for the checked-in Suomi.fi production IdP metadata.

The production metadata is stored in the repository so deployments can use the
same transitional certificate publication that Suomi.fi announced for the May
2026 signing-certificate rollover.
"""

import base64
from pathlib import Path
from typing import Final
from xml.etree import ElementTree

from cryptography import x509

#
# Helpers used to parse and inspect the Suomi.fi metadata XML.
#
METADATA_PATH: Final[Path] = (
    Path(__file__).resolve().parents[1]
    / "metadata"
    / "idp-metadata-tunnistautuminen.xml"
)
NAMESPACES: Final[dict[str, str]] = {
    "saml": "urn:oasis:names:tc:SAML:2.0:metadata",
    "ds": "http://www.w3.org/2000/09/xmldsig#",
}


def _decode_x509_certificate(x509_text: str) -> x509.Certificate:
    """
    Parse an embedded SAML certificate block into an X.509 object.

    The metadata stores certs as base64-encoded DER, so the test decodes them
    before checking the rollover validity windows published by Suomi.fi.

    :return: Certificate object decoded from the metadata payload.
    """
    der_bytes = base64.b64decode("".join(x509_text.split()))
    return x509.load_der_x509_certificate(der_bytes)


def _format_cert_time(value: x509.Certificate) -> tuple[str, str]:
    """
    Normalize certificate validity bounds to the metadata's date format.

    Suomi.fi publishes the transitional metadata with explicit not-before and
    not-after dates. Converting them to the OpenSSL-style string form keeps the
    regression test stable and easy to compare against the source file.

    :return: Tuple containing the not-before and not-after timestamps.
    """
    not_before = value.not_valid_before_utc
    not_after = value.not_valid_after_utc
    return (
        f"{not_before:%b} {not_before.day:2d} {not_before:%H:%M:%S %Y GMT}",
        f"{not_after:%b} {not_after.day:2d} {not_after:%H:%M:%S %Y GMT}",
    )


def _load_suomifi_metadata_root() -> ElementTree.Element:
    """
    Load the checked-in production metadata and return its XML root.

    :return: Parsed XML root for the Suomi.fi production metadata.
    """
    tree: ElementTree.ElementTree = ElementTree.parse(METADATA_PATH)
    return tree.getroot()


def _collect_signing_cert_windows(
    root: ElementTree.Element,
) -> set[tuple[str, str]]:
    """
    Return the signing certificate validity windows from the metadata.

    Each window is a pair of timestamp strings, for example
    ``("Aug 11 21:00:00 2024 GMT", "Aug 11 20:59:59 2026 GMT")`` or
    ``("Apr  7 22:00:00 2026 GMT", "Apr  7 21:59:59 2028 GMT")``.

    :return: Set of not-before and not-after timestamp pairs.
    """
    signing_key_descriptors: list[ElementTree.Element] = root.findall(
        ".//saml:IDPSSODescriptor/saml:KeyDescriptor[@use='signing']",
        NAMESPACES,
    )
    cert_windows: set[tuple[str, str]] = set()
    for key_descriptor in signing_key_descriptors:
        cert_text: str | None = key_descriptor.findtext(
            ".//ds:X509Certificate", namespaces=NAMESPACES
        )
        assert cert_text is not None

        cert_info = _decode_x509_certificate(cert_text)
        cert_windows.add(_format_cert_time(cert_info))
    return cert_windows


def _collect_locations(root: ElementTree.Element, path: str) -> set[str]:
    """
    Return the endpoint locations for the supplied SAML metadata path.

    :return: Set of endpoint URLs found at the supplied XPath.
    """
    return {
        element.attrib["Location"]
        for element in root.findall(
            path,
            NAMESPACES,
        )
    }


def test_suomifi_production_metadata_has_expected_identity() -> None:
    """
    Guard the checked-in Suomi.fi prod metadata against rollover regressions.

    This is the production IdP metadata used by Kesäseteli. The test verifies
    that the transitional publication still exposes the expected entity ID
    needed for the May 2026 certificate switch.
    """
    root: ElementTree.Element = _load_suomifi_metadata_root()

    expected_entity_id = "https://tunnistautuminen.suomi.fi/idp1"

    assert root.tag == "{urn:oasis:names:tc:SAML:2.0:metadata}EntityDescriptor"
    assert root.attrib["entityID"] == expected_entity_id


def test_suomifi_production_metadata_has_expected_signing_cert_windows() -> None:
    """
    Guard the checked-in Suomi.fi prod metadata against rollover regressions.

    This is the production IdP metadata used by Kesäseteli. The test verifies
    that the transitional publication still exposes the signing-cert validity
    windows needed for the May 2026 certificate switch.
    """
    root: ElementTree.Element = _load_suomifi_metadata_root()

    expected_cert_windows: set[tuple[str, str]] = {
        ("Aug 11 21:00:00 2024 GMT", "Aug 11 20:59:59 2026 GMT"),
        ("Apr  7 22:00:00 2026 GMT", "Apr  7 21:59:59 2028 GMT"),
    }

    signing_key_descriptors: list[ElementTree.Element] = root.findall(
        ".//saml:IDPSSODescriptor/saml:KeyDescriptor[@use='signing']",
        NAMESPACES,
    )
    cert_windows = _collect_signing_cert_windows(root)
    assert len(signing_key_descriptors) >= 2
    assert cert_windows == expected_cert_windows


def test_suomifi_production_metadata_has_expected_sso_endpoints() -> None:
    """
    Guard the checked-in Suomi.fi prod metadata against rollover regressions.

    This is the production IdP metadata used by Kesäseteli. The test verifies
    that the transitional publication still exposes the expected SSO
    endpoints needed for the May 2026 certificate switch.
    """
    root: ElementTree.Element = _load_suomifi_metadata_root()

    expected_sso_locations: set[str] = {
        "https://tunnistautuminen.suomi.fi/idp/profile/SAML2/POST/SSO",
        "https://tunnistautuminen.suomi.fi/idp/profile/SAML2/Redirect/SSO",
    }

    sso_locations: set[str] = _collect_locations(
        root,
        ".//saml:IDPSSODescriptor/saml:SingleSignOnService",
    )
    assert sso_locations >= expected_sso_locations


def test_suomifi_production_metadata_has_expected_slo_endpoints() -> None:
    """
    Guard the checked-in Suomi.fi prod metadata against rollover regressions.

    This is the production IdP metadata used by Kesäseteli. The test verifies
    that the transitional publication still exposes the expected SLO
    endpoints needed for the May 2026 certificate switch.
    """
    root: ElementTree.Element = _load_suomifi_metadata_root()

    expected_slo_locations: set[str] = {
        "https://tunnistautuminen.suomi.fi/idp/profile/SAML2/POST/SLO",
        "https://tunnistautuminen.suomi.fi/idp/profile/SAML2/Redirect/SLO",
    }

    slo_locations: set[str] = _collect_locations(
        root,
        ".//saml:IDPSSODescriptor/saml:SingleLogoutService",
    )
    assert slo_locations >= expected_slo_locations
