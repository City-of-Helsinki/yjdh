import os
import uuid
from unittest import mock

import pytest
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse

from applications.enums import AttachmentType
from applications.models import Attachment, YouthApplication


def handle_attachment_url(
    youth_application: YouthApplication, attachment_pk: uuid.UUID
):
    return reverse(
        "v1:youthapplication-handle-attachment",
        kwargs={"pk": youth_application.pk, "attachment_pk": attachment_pk},
    )


def post_attachment_url(youth_application: YouthApplication):
    return reverse(
        "v1:youthapplication-post-attachment",
        kwargs={"pk": youth_application.pk},
    )


def _upload_file(request, api_client, youth_application, extension):
    with open(
        os.path.join(
            request.fspath.dirname, "data", f"valid_{extension}_file.{extension}"
        ),
        "rb",
    ) as valid_file:
        return api_client.post(
            post_attachment_url(youth_application),
            {
                "attachment_file": valid_file,
            },
            format="multipart",
        )


@pytest.mark.django_db
@override_settings(ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS=True)
@pytest.mark.parametrize(
    "extension, expected_content_type",
    [
        ("pdf", "application/pdf"),
        ("jpg", "image/jpeg"),
    ],
)
def test_youth_attachment_upload(
    request,
    unauthenticated_api_client,
    youth_application,
    extension,
    expected_content_type,
):
    """
    Test that an anonymous user can successfully upload an attachment to their
    youth application. Verifies that the correct fields and content types are returned.
    """
    youth_application.receipt_confirmed_at = timezone.now()
    youth_application.save()
    assert not youth_application.attachments.exists()

    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = True
        with freeze_time("2026-06-12"):
            response = _upload_file(
                request,
                unauthenticated_api_client,
                youth_application,
                extension,
            )

    assert response.status_code == status.HTTP_201_CREATED
    assert youth_application.attachments.count() == 1
    attachment = youth_application.attachments.first()

    assert attachment.attachment_type == AttachmentType.UNCLASSIFIED
    assert attachment.content_type == expected_content_type

    assert response.data == {
        "id": str(attachment.pk),
        "youth_application": youth_application.pk,
        "attachment_type": AttachmentType.UNCLASSIFIED.value,
        "attachment_file_name": attachment.attachment_file.name,
        "content_type": expected_content_type,
        "created_at": "2026-06-12T03:00:00+03:00",
        "notes_count": 0,
        "author_name": "",
        "summer_voucher": None,
    }


@pytest.mark.django_db
@override_settings(ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS=True)
def test_youth_attachment_upload_size_limit(
    request, unauthenticated_api_client, youth_application
):
    """
    Test that uploading an attachment exceeding the maximum file size limit
    results in a 400 Bad Request and returns an appropriate error message.
    """
    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = True
        youth_application.receipt_confirmed_at = timezone.now()
        youth_application.save()
        with override_settings(MAX_UPLOAD_SIZE=1):
            response = _upload_file(
                request,
                unauthenticated_api_client,
                youth_application,
                "pdf",
            )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "non_field_errors" in response.data


@pytest.mark.django_db
@override_settings(ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS=False)
def test_youth_attachment_upload_disabled(
    request, unauthenticated_api_client, youth_application
):
    """
    Test that uploading an attachment fails with 403 Forbidden when the
    ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS setting is False.
    """
    youth_application.receipt_confirmed_at = timezone.now()
    youth_application.save()

    response = _upload_file(
        request,
        unauthenticated_api_client,
        youth_application,
        "pdf",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "detail" in response.data


@pytest.mark.django_db
@override_settings(ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS=True)
def test_youth_attachment_upload_fails_if_cannot_set_additional_info(
    request, unauthenticated_api_client, youth_application
):
    """
    Test that an anonymous user cannot upload attachments if the youth application
    is in a state where it no longer accepts additional information.
    """
    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = False
        youth_application.receipt_confirmed_at = timezone.now()
        youth_application.save()
        response = _upload_file(
            request,
            unauthenticated_api_client,
            youth_application,
            "pdf",
        )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "detail" in response.data


@pytest.mark.django_db
@override_settings(ENABLE_ANONYMOUS_YOUTH_ATTACHMENT_UPLOADS=True)
def test_youth_attachment_upload_fails_if_inactive(
    request, unauthenticated_api_client, youth_application
):
    """
    Test that an anonymous user cannot upload attachments if the youth application
    is not active yet (email receipt not confirmed).
    """
    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = True

        youth_application.receipt_confirmed_at = None
        youth_application.save()
        assert not youth_application.is_active

        response = _upload_file(
            request,
            unauthenticated_api_client,
            youth_application,
            "pdf",
        )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "detail" in response.data


@pytest.mark.django_db
def test_youth_attachment_handler_can_read(staff_client, youth_attachment):
    """
    Test that an authenticated handler (staff client) can read and access
    youth attachments.
    """
    response = staff_client.get(
        handle_attachment_url(youth_attachment.youth_application, youth_attachment.pk)
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.get("Content-Disposition")
    assert "attachment; filename=" in response.get("Content-Disposition")


@pytest.mark.django_db
def test_youth_attachment_handler_can_delete(staff_client, youth_attachment):
    """
    Test that an authenticated handler (staff client) is able to delete
    youth attachments.
    """
    response = staff_client.delete(
        handle_attachment_url(youth_attachment.youth_application, youth_attachment.pk)
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Attachment.objects.filter(pk=youth_attachment.pk).exists()


@pytest.mark.django_db
def test_youth_attachment_handler_cannot_delete_from_handled_application(
    staff_client, youth_attachment
):
    """
    Test that an authenticated handler cannot delete youth attachments if the
    application is already fully handled.
    """
    youth_attachment.youth_application.status = (
        "handled"  # assuming this satisfies is_handled
    )
    youth_attachment.youth_application.save()

    with mock.patch(
        "applications.models.YouthApplication.is_handled",
        new_callable=mock.PropertyMock,
    ) as mock_is_handled:
        mock_is_handled.return_value = True
        response = staff_client.delete(
            handle_attachment_url(
                youth_attachment.youth_application, youth_attachment.pk
            )
        )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_youth_attachment_handler_can_upload_regardless_of_status(
    request, staff_client, youth_application
):
    """
    Test that an authenticated handler can upload attachments even if the youth application
    is in a state where it no longer accepts additional information.
    """
    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = False
        response = _upload_file(
            request,
            staff_client,
            youth_application,
            "pdf",
        )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_youth_attachment_unauthenticated_cannot_read(
    unauthenticated_api_client, youth_attachment
):
    """
    Test that an anonymous, unauthenticated user cannot read attachments
    directly. They should be redirected to the authentication provider.
    """
    response = unauthenticated_api_client.get(
        handle_attachment_url(youth_attachment.youth_application, youth_attachment.pk)
    )
    assert response.status_code == status.HTTP_302_FOUND


@pytest.mark.django_db
def test_youth_attachment_unauthenticated_cannot_delete(
    unauthenticated_api_client, youth_attachment
):
    """
    Test that an anonymous, unauthenticated user cannot delete attachments
    directly. They should be redirected to the authentication provider.
    """
    response = unauthenticated_api_client.delete(
        handle_attachment_url(youth_attachment.youth_application, youth_attachment.pk)
    )
    assert response.status_code == status.HTTP_302_FOUND
