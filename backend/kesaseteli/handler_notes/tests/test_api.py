import uuid

import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework import serializers, status

from common.tests.factories import (
    AttachmentFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    YouthApplicationFactory,
)
from handler_notes.models import Note
from handler_notes.tests.factories import NoteFactory
from shared.common.tests.factories import UserFactory


@pytest.mark.django_db
def test_create_note_api(staff_client, user):
    app = YouthApplicationFactory()
    url = reverse("v1:handlernotes-list")

    data = {
        "target_type": "youthapplication",
        "target_id": app.id,
        "content": "API test note",
    }

    response = staff_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Note.objects.count() == 1

    note = Note.objects.first()
    assert note.content == "API test note"
    assert note.author == user
    assert response.data["target_type"] == "youthapplication"
    assert response.data["target_id"] == str(app.id)


@pytest.mark.django_db
def test_youth_application_timeline_api(staff_client):
    # Tests the timeline @action defined on YouthApplicationViewSet (applications app)
    app = YouthApplicationFactory()
    NoteFactory(content_object=app, content="Note 1")
    NoteFactory(content_object=app, content="Note 2")

    # Another application
    NoteFactory()

    url = reverse("v1:youthapplication-timeline", kwargs={"pk": app.id})
    response = staff_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2


@pytest.mark.django_db
def test_employer_application_timeline_api(staff_client):
    # Tests the timeline @action defined on EmployerApplicationViewSet (applications app)
    app = EmployerApplicationFactory()
    NoteFactory(content_object=app, content="Emp Note 1")
    NoteFactory(content_object=app, content="Emp Note 2")

    # Add child attachment note coverage
    voucher = EmployerSummerVoucherFactory(application=app)
    attachment = AttachmentFactory(summer_voucher=voucher)
    NoteFactory(content_object=attachment, content="Attachment Note")

    url = reverse("v1:employerapplication-timeline", kwargs={"pk": app.id})
    response = staff_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 3
    contents = [item["content"] for item in response.data]
    assert "Emp Note 1" in contents
    assert "Emp Note 2" in contents
    assert "Attachment Note" in contents


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_note_list_permissions_unauthenticated(api_client):
    url = reverse("v1:handlernotes-list")
    response = api_client.get(url)
    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_note_list_permissions_non_handler(api_client, user):
    url = reverse("v1:handlernotes-list")
    api_client.force_authenticate(user=user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_note_detail_permissions_unauthenticated(api_client):
    note = NoteFactory()
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})
    response = api_client.get(url)
    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_note_detail_permissions_non_handler(api_client, user):
    note = NoteFactory()
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})
    api_client.force_authenticate(user=user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_attachment_external_note_invalid(staff_client):
    attachment = AttachmentFactory(summer_voucher=EmployerSummerVoucherFactory())
    url = reverse("v1:handlernotes-list")

    data = {
        "target_type": "attachment",
        "target_id": attachment.id,
        "content": "External message for attachment",
        "note_type": "external_message",
    }

    response = staff_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "note_type" in response.data
    assert Note.objects.count() == 0


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_youth_application_timeline_permissions(api_client, user):
    app = YouthApplicationFactory()
    url = reverse("v1:youthapplication-timeline", kwargs={"pk": app.id})

    # Unauthenticated should fail
    response = api_client.get(url, HTTP_ACCEPT="application/json")
    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]

    # Authenticated but non-staff (non-handler) should fail
    api_client.force_authenticate(user=user)
    response = api_client.get(url, HTTP_ACCEPT="application/json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_employer_application_timeline_permissions(api_client, user):
    app = EmployerApplicationFactory()
    url = reverse("v1:employerapplication-timeline", kwargs={"pk": app.id})

    # Unauthenticated should fail
    response = api_client.get(url, HTTP_ACCEPT="application/json")
    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]

    # Authenticated but non-staff (non-handler) should fail
    api_client.force_authenticate(user=user)
    response = api_client.get(url, HTTP_ACCEPT="application/json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_update_note_author(staff_client, user):
    note = NoteFactory(author=user, content="Original content")
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    data = {"content": "Updated content"}
    response = staff_client.patch(url, data)
    assert response.status_code == status.HTTP_200_OK
    note.refresh_from_db()
    assert note.content == "Updated content"


@pytest.mark.django_db
def test_update_note_non_author(staff_client):
    other_user = UserFactory(is_staff=True)
    note = NoteFactory(author=other_user, content="Original content")
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    data = {"content": "Updated content"}
    response = staff_client.patch(url, data)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data["detail"] == "You can only modify your own notes."
    note.refresh_from_db()
    assert note.content == "Original content"


@pytest.mark.django_db
def test_delete_note_author(staff_client, user):
    note = NoteFactory(author=user)
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    response = staff_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Note.objects.count() == 0


@pytest.mark.django_db
def test_delete_note_non_author(staff_client):
    other_user = UserFactory(is_staff=True)
    note = NoteFactory(author=other_user)
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    response = staff_client.delete(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data["detail"] == "You can only delete your own notes."
    assert Note.objects.count() == 1


@pytest.mark.django_db
def test_note_serializer_fields(staff_client, user):
    note = NoteFactory(
        author=user,
        content="Serializer test note content",
        is_important=True,
    )
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})
    response = staff_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    # Strict snapshot/structure validation
    assert response.data == {
        "id": str(note.id),
        "content": "Serializer test note content",
        "author_username": user.username,
        "author_name": user.get_full_name(),
        "note_type": "internal",
        "is_important": True,
        "created_at": serializers.DateTimeField().to_representation(note.created_at),
        "modified_at": serializers.DateTimeField().to_representation(note.modified_at),
        "target_type": note.content_type.model,
        "target_id": str(note.object_id),
    }


@pytest.mark.django_db
def test_create_note_partial_target_type_fails(staff_client):
    url = reverse("v1:handlernotes-list")
    data = {
        "target_type": "youthapplication",
        "content": "API test note with partial target",
    }
    response = staff_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_type" in response.data


@pytest.mark.django_db
def test_create_note_partial_target_id_fails(staff_client):
    url = reverse("v1:handlernotes-list")
    data = {
        "target_id": uuid.uuid4(),
        "content": "API test note with partial target",
    }
    response = staff_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_type" in response.data


@pytest.mark.django_db
def test_note_serializer_no_author(staff_client):
    note = NoteFactory(
        author=None,
        content="No author test content",
        is_important=False,
    )
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})
    response = staff_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["author_username"] is None
    assert response.data["author_name"] == ""


@pytest.mark.django_db
def test_create_note_no_target_fails(staff_client):
    url = reverse("v1:handlernotes-list")
    data = {
        "content": "API test note with no target at all",
    }
    response = staff_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_type" in response.data


@pytest.mark.django_db
def test_list_notes_no_target_returns_empty(staff_client):
    NoteFactory()
    url = reverse("v1:handlernotes-list")
    response = staff_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_list_notes_partial_target_returns_empty(staff_client):
    app = YouthApplicationFactory()
    NoteFactory(content_object=app)
    url = reverse("v1:handlernotes-list")

    # Only target_type provided
    response = staff_client.get(f"{url}?target_type=youthapplication")
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []

    # Only target_id provided
    response = staff_client.get(f"{url}?target_id={app.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_detail_note_works_without_query_params(staff_client, user):
    note = NoteFactory(author=user)
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})
    response = staff_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == str(note.id)


@pytest.mark.django_db
def test_update_note_with_same_target_succeeds(staff_client, user):
    """
    Test that updating a note with the same target_type and target_id succeeds.
    This ensures that clients providing the original target during PUT/PATCH updates
    do not trigger validation errors.
    """
    app = YouthApplicationFactory()
    note = NoteFactory(author=user, content_object=app)
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    data = {
        "content": "Updated content with same target",
        "target_type": "youthapplication",
        "target_id": app.id,
    }
    response = staff_client.put(url, data)
    assert response.status_code == status.HTTP_200_OK
    note.refresh_from_db()
    assert note.content == "Updated content with same target"
    assert note.object_id == app.id


@pytest.mark.django_db
def test_update_note_with_different_target_fails(staff_client, user):
    """
    Security check: Test that attempting to change the note's target (target_type or target_id)
    on update fails with a validation error.
    This prevents unauthorized mutation or spoofing of a note's target after its creation.
    """
    app1 = YouthApplicationFactory()
    app2 = YouthApplicationFactory()
    note = NoteFactory(author=user, content_object=app1)
    url = reverse("v1:handlernotes-detail", kwargs={"pk": note.id})

    data = {
        "content": "Attempting to change target",
        "target_type": "youthapplication",
        "target_id": app2.id,
    }
    response = staff_client.put(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "target_type" in response.data
