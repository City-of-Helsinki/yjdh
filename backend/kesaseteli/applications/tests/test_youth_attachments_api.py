import os
import uuid
from unittest import mock

import pytest
from django.test import override_settings
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


def _upload_file(request, unauthenticated_api_client, youth_application, extension):
    with open(
        os.path.join(
            request.fspath.dirname, "data", f"valid_{extension}_file.{extension}"
        ),
        "rb",
    ) as valid_file:
        return unauthenticated_api_client.post(
            post_attachment_url(youth_application),
            {
                "attachment_file": valid_file,
            },
            format="multipart",
        )


@pytest.mark.django_db
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
    assert not youth_application.attachments.exists()

    with mock.patch(
        "applications.models.YouthApplication.can_set_additional_info",
        new_callable=mock.PropertyMock,
    ) as mock_can_set:
        mock_can_set.return_value = True
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

    assert response.data.keys() == {
        "id",
        "youth_application",
        "attachment_type",
        "attachment_file_name",
        "content_type",
        "created_at",
        "notes_count",
        "author_name",
        "summer_voucher",
    }
    assert response.data["attachment_type"] == AttachmentType.UNCLASSIFIED


@pytest.mark.django_db
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
    assert response.data["id"] == str(youth_attachment.pk)


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
