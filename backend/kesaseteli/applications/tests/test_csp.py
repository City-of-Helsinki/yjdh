"""Tests for CSP headers on application HTML pages.

Checks the excel-download page and other pages that use the global policy.
"""

import pytest
from django.urls import reverse
from django.test import override_settings

from applications.enums import EmailTemplateType
from applications.models import EmailTemplate


def assert_expected_csp(response):
    """Check that a response has the global backend CSP rules.

    Args:
        response: Page response to check.
    """
    assert "Content-Security-Policy" in response.headers, "CSP header missing from response"
    csp_header = response.headers["Content-Security-Policy"]
    assert "default-src 'self'" in csp_header
    assert "style-src 'self' 'unsafe-inline'" in csp_header
    assert "img-src 'self' data:" in csp_header


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_download_includes_bootstrap_csp(staff_client):
    """Check excel-download allows the Bootstrap CDN in CSP.

    Args:
        staff_client: Logged-in staff user client.
    """
    response = staff_client.get(reverse("excel-download"))
    assert response.status_code == 200
    assert_expected_csp(response)
    csp_header = response.headers["Content-Security-Policy"]
    assert "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net" in csp_header
    assert "connect-src" not in csp_header


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_email_template_preview_uses_global_csp_only(admin_client):
    """Check admin email preview does not allow the Bootstrap CDN in CSP.

    Args:
        admin_client: Logged-in admin user client.
    """
    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )
    response = admin_client.get(
        reverse("admin:applications_emailtemplate_preview", kwargs={"object_id": template.pk})
    )
    assert response.status_code == 200
    assert_expected_csp(response)
    assert "cdn.jsdelivr.net" not in response.headers["Content-Security-Policy"]
