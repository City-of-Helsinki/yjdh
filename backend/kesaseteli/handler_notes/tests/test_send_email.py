import pytest
from django.core import mail
from django.urls import reverse
from rest_framework import status

from applications.services import EmailTemplateService
from common.tests.factories import EmployerApplicationFactory, YouthApplicationFactory
from handler_notes.enums import NoteType


@pytest.mark.django_db
def test_send_email_on_note_creation_youth_application(staff_client):
    """Test that email is sent automatically when a youth application note is created."""
    # Ensure templates exist in DB
    EmailTemplateService.ensure_templates_exist()

    app = YouthApplicationFactory(email="youth@example.com", language="fi")
    payload = {
        "target_type": "youthapplication",
        "target_id": str(app.id),
        "content": "Hello Youth!",
        "note_type": NoteType.EXTERNAL_MESSAGE,
    }

    url = reverse("v1:handlernotes-list")
    response = staff_client.post(url, data=payload)

    assert response.status_code == status.HTTP_201_CREATED
    assert len(mail.outbox) == 1
    email = mail.outbox[0]
    assert email.to == ["youth@example.com"]
    assert "Uusi viesti" in email.subject
    assert "Hello Youth!" in email.body


@pytest.mark.django_db
def test_send_email_on_note_creation_employer_application(staff_client):
    """Test that email is sent automatically when an employer application note is created."""
    # Ensure templates exist in DB
    EmailTemplateService.ensure_templates_exist()

    app = EmployerApplicationFactory(
        contact_person_email="employer@example.com", language="sv"
    )
    payload = {
        "target_type": "employerapplication",
        "target_id": str(app.id),
        "content": "Hello Employer!",
        "note_type": NoteType.EXTERNAL_MESSAGE,
    }

    url = reverse("v1:handlernotes-list")
    response = staff_client.post(url, data=payload)

    assert response.status_code == status.HTTP_201_CREATED
    assert len(mail.outbox) == 1
    email = mail.outbox[0]
    assert email.to == ["employer@example.com"]
    assert "Nytt meddelande" in email.subject
    assert "Hello Employer!" in email.body


@pytest.mark.django_db
def test_no_email_on_internal_note_creation(staff_client):
    """Test that no email is sent for internal notes."""
    app = YouthApplicationFactory()
    payload = {
        "target_type": "youthapplication",
        "target_id": str(app.id),
        "content": "Internal note",
        "note_type": NoteType.INTERNAL,
    }

    url = reverse("v1:handlernotes-list")
    response = staff_client.post(url, data=payload)

    assert response.status_code == status.HTTP_201_CREATED
    assert len(mail.outbox) == 0
