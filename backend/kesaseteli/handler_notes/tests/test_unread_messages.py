import pytest
from django.urls import reverse
from rest_framework import status

from common.tests.factories import EmployerApplicationFactory, YouthApplicationFactory
from handler_notes.enums import NoteType
from handler_notes.tests.factories import NoteFactory


@pytest.mark.django_db
def test_unread_messages_api(staff_client):
    """Test fetching unread external messages for a target."""
    app = EmployerApplicationFactory()

    # 1. Unread external message (should be returned)
    NoteFactory(
        content_object=app,
        note_type=NoteType.EXTERNAL_MESSAGE,
        seen_at=None,
        content="Unread message",
    )

    # 2. Read external message (should NOT be returned)
    from django.utils import timezone

    NoteFactory(
        content_object=app,
        note_type=NoteType.EXTERNAL_MESSAGE,
        seen_at=timezone.now(),
        content="Read message",
    )

    # 3. Internal note (should NOT be returned)
    NoteFactory(
        content_object=app,
        note_type=NoteType.INTERNAL,
        seen_at=None,
        content="Internal note",
    )

    # 4. Unread external message for ANOTHER target (should NOT be returned)
    app2 = YouthApplicationFactory()
    NoteFactory(
        content_object=app2,
        note_type=NoteType.EXTERNAL_MESSAGE,
        seen_at=None,
        content="Other target message",
    )

    url = reverse("v1:handlernotes-unread-messages-count", kwargs={"pk": app.id})
    response = staff_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data["count"] == 1
