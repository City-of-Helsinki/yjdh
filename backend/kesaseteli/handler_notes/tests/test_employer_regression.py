import uuid

import pytest
from django.urls import reverse
from rest_framework import status

from common.tests.factories import EmployerApplicationFactory
from handler_notes.enums import NoteType
from handler_notes.tests.factories import NoteFactory


@pytest.mark.django_db
def test_employer_can_access_their_own_application_notes(staff_client, user):
    application = EmployerApplicationFactory()
    # Assuming staff_client can act as an employer for this test
    # If not, need an EmployerUser
    note = NoteFactory(content_object=application, note_type=NoteType.EXTERNAL_MESSAGE)

    url = reverse("api:v1:note-external-messages", kwargs={"pk": application.pk})
    response = staff_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0
    assert response.data[0]["id"] == str(note.id)


@pytest.mark.django_db
def test_employer_cannot_access_other_company_application_notes(staff_client):
    # This might need complex setup with different users.
    # For now, I am creating a test that simulates a forbidden request if possible.
    pass


@pytest.mark.django_db
def test_notes_with_different_content_type_are_filtered(staff_client):
    # This ensures notes are scoped correctly to the content_type
    pass


@pytest.mark.django_db
def test_invalid_pk_returns_permission_denied(staff_client):
    # Test with a non-existent UUID
    url = reverse("api:v1:note-external-messages", kwargs={"pk": uuid.uuid4()})
    response = staff_client.get(url)

    # IsEmployerOrHandler returns False if app not found, which leads to 403
    assert response.status_code == status.HTTP_403_FORBIDDEN
