import pytest
from django.urls import reverse

from applications.enums import EmailTemplateType
from applications.models import EmailTemplate


@pytest.mark.django_db
def test_email_template_preview_view(admin_client, settings):
    # Retrieve existing template created by fixture and update it for the test
    template = EmailTemplate.objects.get(
        type=EmailTemplateType.PROCESSING,
        language="fi",
    )
    template.subject = "Subject {{ first_name }}"
    template.html_body = "<p>Body {{ processing_link }}</p>"
    template.save()

    url = reverse(
        "admin:applications_emailtemplate_preview", kwargs={"object_id": template.pk}
    )

    response = admin_client.get(url)
    assert response.status_code == 200

    content = response.content.decode("utf-8")
    assert "Subject" in content
    assert "Body" in content
    # Check for mocked data
    # The factory produces random data, but processing_link should be identifiable
    assert "https://handler.hel.fi/process/" in content


@pytest.mark.django_db
def test_email_template_preview_all_types(admin_client):
    for template_type in EmailTemplateType.values:
        # Templates are already seeded by conftest fixture
        template = EmailTemplate.objects.get(
            type=template_type,
            language="fi",
        )
        url = reverse(
            "admin:applications_emailtemplate_preview",
            kwargs={"object_id": template.pk},
        )
        response = admin_client.get(url)
        assert response.status_code == 200
