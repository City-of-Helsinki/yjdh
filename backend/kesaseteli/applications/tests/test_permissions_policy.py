"""Tests for Permissions-Policy on application admin HTML pages."""

import pytest
from django.test import override_settings
from django.urls import reverse

from applications.enums import EmailTemplateType
from applications.models import EmailTemplate
from common.middleware import PERMISSIONS_POLICY


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_email_template_preview_includes_permissions_policy(admin_client):
    """Check admin email preview sends the Permissions-Policy header.

    Args:
        admin_client: Logged-in admin user client.
    """
    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )
    response = admin_client.get(
        reverse(
            "admin:applications_emailtemplate_preview",
            kwargs={"object_id": template.pk},
        )
    )
    assert response.status_code == 200
    assert response.headers["Permissions-Policy"] == PERMISSIONS_POLICY
