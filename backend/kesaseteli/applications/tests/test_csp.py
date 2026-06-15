import pytest
from django.urls import reverse
from django.test import override_settings

from applications.enums import EmailTemplateType
from applications.models import EmailTemplate


def assert_expected_csp(response):
    csp_header = response.headers["Content-Security-Policy"]
    assert "default-src 'self'" in csp_header
    assert "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net" in csp_header


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_application_pages_include_expected_csp(staff_client, admin_client):
    response = staff_client.get(reverse("excel-download"))
    assert response.status_code == 200
    assert_expected_csp(response)

    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )
    response = admin_client.get(
        reverse("admin:applications_emailtemplate_preview", kwargs={"object_id": template.pk})
    )
    assert response.status_code == 200
    assert_expected_csp(response)
