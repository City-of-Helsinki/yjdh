import os
import re
import tempfile
import uuid
from datetime import datetime

import pytest
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.files.utils import validate_file_name
from django.http import FileResponse
from django.utils import timezone
from freezegun import freeze_time
from PIL import Image
from rest_framework.exceptions import ErrorDetail, ValidationError
from rest_framework.reverse import reverse

from applications.api.v1.serializers import AttachmentSerializer
from applications.enums import AttachmentType, EmployerApplicationStatus
from applications.models import Attachment, EmployerSummerVoucher


def handle_attachment_url(
    summer_voucher: EmployerSummerVoucher, attachment_pk: uuid.UUID
):
    return reverse(
        "v1:employersummervoucher-handle-attachment",
        kwargs={"pk": summer_voucher.pk, "attachment_pk": attachment_pk},
    )


def post_attachment_url(summer_voucher: EmployerSummerVoucher):
    return reverse(
        "v1:employersummervoucher-post-attachment",
        kwargs={"pk": summer_voucher.pk},
    )


def _upload_file(
    request, api_client, summer_voucher, extension, attachment_type: AttachmentType
):
    with open(
        os.path.join(
            request.fspath.dirname, "data", f"valid_{extension}_file.{extension}"
        ),
        "rb",
    ) as valid_file:
        return api_client.post(
            post_attachment_url(summer_voucher),
            {
                "attachment_file": valid_file,
                "attachment_type": str(attachment_type),
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
def test_attachment_upload(
    request, api_client, summer_voucher, extension, expected_content_type
):
    """
    Test that uploading an attachment to an employer summer voucher works
    and returns expected data.
    """
    assert not summer_voucher.attachments.exists()
    upload_time = timezone.now()
    with freeze_time(upload_time):
        response = _upload_file(
            request,
            api_client,
            summer_voucher,
            extension,
            AttachmentType.EMPLOYMENT_CONTRACT,
        )
    assert response.status_code == 201
    assert summer_voucher.attachments.count() == 1
    attachment = summer_voucher.attachments.first()

    assert isinstance(response.data, dict)
    assert response.data.keys() == {
        "id",
        "summer_voucher",
        "attachment_type",
        "attachment_file_name",
        "content_type",
        "created_at",
    }
    assert response.data["id"] == str(attachment.pk)
    assert response.data["summer_voucher"] == summer_voucher.pk
    assert response.data["attachment_type"] == "employment_contract"
    # Should not raise SuspiciousFileOperation:
    validate_file_name(response.data["attachment_file_name"])
    assert response.data["attachment_file_name"].endswith(f".{extension}")
    assert response.data["content_type"] == expected_content_type
    assert datetime.fromisoformat(response.data["created_at"]) == upload_time


@pytest.mark.django_db
@pytest.mark.parametrize(
    "extension, expected_content_type",
    [
        ("pdf", "application/pdf"),
        ("jpg", "image/jpeg"),
    ],
)
def test_attachment_upload_writes_audit_log(
    request, api_client, summer_voucher, extension, expected_content_type
):
    """
    Test that uploading an attachment to an employer summer voucher
    writes an audit log entry.
    """
    response = _upload_file(
        request,
        api_client,
        summer_voucher,
        extension,
        AttachmentType.EMPLOYMENT_CONTRACT,
    )

    audit_event = LogEntry.objects.first()
    assert audit_event.action == LogEntry.Action.CREATE
    assert audit_event.object_pk == response.data["id"]
    assert audit_event.content_type == ContentType.objects.get_for_model(Attachment)
    assert audit_event.actor_id == response.wsgi_request.user.id
    assert audit_event.actor_email == response.wsgi_request.user.email
    assert audit_event.changes["attachment_file"] == [
        "None",
        response.data["attachment_file_name"],
    ]
    assert audit_event.changes["content_type"] == [
        "None",
        response.data["content_type"],
    ]
    assert audit_event.changes["attachment_type"] == [
        "None",
        response.data["attachment_type"],
    ]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "extension, expected_error_string",
    [
        ("pdf", "Not a valid pdf file"),
        ("png", "Not a valid image file"),
        ("jpg", "Not a valid image file"),
    ],
)
def test_invalid_attachment_upload(
    api_client, summer_voucher: EmployerSummerVoucher, extension, expected_error_string
):
    tmp_file = tempfile.NamedTemporaryFile(suffix=f".{extension}")
    tmp_file.write(b"invalid data " * 100)
    tmp_file.seek(0)

    response = api_client.post(
        post_attachment_url(summer_voucher),
        {
            "attachment_file": tmp_file,
            "attachment_type": "employment_contract",
        },
        format="multipart",
    )

    assert response.data == {
        "non_field_errors": [
            ErrorDetail(string=expected_error_string, code=ValidationError.default_code)
        ]
    }
    assert response.status_code == 400
    assert not summer_voucher.attachments.exists()


@pytest.mark.django_db
def test_attachment_upload_too_big(api_client, summer_voucher: EmployerSummerVoucher):
    image = Image.new("RGB", (100, 100))
    tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg")
    tmp_file.seek(settings.MAX_UPLOAD_SIZE + 1)
    image.save(tmp_file)
    tmp_file.seek(0)

    response = api_client.post(
        post_attachment_url(summer_voucher),
        {
            "attachment_file": tmp_file,
            "attachment_type": "employment_contract",
        },
        format="multipart",
    )

    assert response.status_code == 400
    assert response.data == {
        "non_field_errors": [
            ErrorDetail(
                string=f"Upload file size cannot be greater than {settings.MAX_UPLOAD_SIZE} bytes",
                code=ValidationError.default_code,
            )
        ]
    }
    assert not summer_voucher.attachments.exists()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "status, response_code",
    [
        (EmployerApplicationStatus.SUBMITTED, 400),
        (EmployerApplicationStatus.ACCEPTED, 404),
        (EmployerApplicationStatus.DELETED_BY_CUSTOMER, 404),
        (EmployerApplicationStatus.REJECTED, 404),
    ],
)
def test_attachment_upload_invalid_status(
    request, api_client, application, summer_voucher, status, response_code
):
    application.status = status
    application.save()
    response = _upload_file(
        request, api_client, summer_voucher, "pdf", AttachmentType.EMPLOYMENT_CONTRACT
    )
    assert response.status_code == response_code
    assert len(summer_voucher.attachments.all()) == 0


@pytest.mark.django_db
def test_too_many_attachments(request, api_client, summer_voucher):
    for _ in range(AttachmentSerializer.MAX_ATTACHMENTS_PER_TYPE):
        response = _upload_file(
            request,
            api_client,
            summer_voucher,
            "pdf",
            AttachmentType.EMPLOYMENT_CONTRACT,
        )
        assert response.status_code == 201

    response = _upload_file(
        request, api_client, summer_voucher, "pdf", AttachmentType.EMPLOYMENT_CONTRACT
    )
    assert response.status_code == 400
    assert (
        summer_voucher.attachments.count()
        == AttachmentSerializer.MAX_ATTACHMENTS_PER_TYPE
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "attachment_type", [attachment_type for attachment_type in AttachmentType.values]
)
def test_get_attachment(request, api_client, summer_voucher, attachment_type):
    _upload_file(request, api_client, summer_voucher, "pdf", attachment_type)
    attachment = Attachment.objects.first()
    attachment_url = handle_attachment_url(summer_voucher, attachment.pk)

    response = api_client.get(attachment_url)

    assert response.status_code == 200
    assert isinstance(response, FileResponse)

    # No filename in response.filename
    assert not response.filename

    # But has a valid filename in Content-Disposition header
    filename_match = re.match(
        '^inline; filename="([^"]+)"$', response.headers["Content-Disposition"]
    )
    assert filename_match is not None
    assert len(filename_match.groups()) == 1
    filename = filename_match.groups()[0]
    assert filename.endswith(".pdf")
    # Should not raise SuspiciousFileOperation:
    validate_file_name(filename)


@pytest.mark.django_db
def test_get_attachment_with_invalid_uuid(
    api_client, summer_voucher: EmployerSummerVoucher
):
    attachment_url = handle_attachment_url(summer_voucher, attachment_pk=uuid.uuid4())
    response = api_client.get(attachment_url)

    assert response.status_code == 404
    assert response.data == {"detail": "File not found."}


@pytest.mark.django_db
@pytest.mark.parametrize(
    "attachment_type", [attachment_type for attachment_type in AttachmentType.values]
)
def test_delete_attachment(request, api_client, summer_voucher, attachment_type):
    """
    Test that deleting an attachment from an employer summer voucher works.
    """
    _upload_file(request, api_client, summer_voucher, "pdf", attachment_type)
    attachment = Attachment.objects.first()
    attachment_delete_url = handle_attachment_url(summer_voucher, attachment.pk)

    response = api_client.delete(attachment_delete_url)

    assert response.status_code == 204
    assert response.data is None

    with pytest.raises(Attachment.DoesNotExist):
        attachment.refresh_from_db()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "attachment_type",
    [attachment_type for attachment_type in AttachmentType.values],
)
def test_delete_attachment_writes_audit_log(
    request, api_client, summer_voucher, attachment_type
):
    """
    Test that deleting an attachment from an employer summer voucher
    writes an audit log entry.
    """
    _upload_file(request, api_client, summer_voucher, "pdf", attachment_type)
    attachment = Attachment.objects.first()
    attachment_delete_url = handle_attachment_url(summer_voucher, attachment.pk)

    response = api_client.delete(attachment_delete_url)

    audit_event = LogEntry.objects.first()
    assert audit_event.action == LogEntry.Action.DELETE
    assert audit_event.object_pk == str(attachment.id)
    assert audit_event.content_type == ContentType.objects.get_for_model(Attachment)
    assert audit_event.actor_id == response.wsgi_request.user.id
    assert audit_event.actor_email == response.wsgi_request.user.email


@pytest.mark.django_db
def test_delete_attachment_that_does_not_exist(
    api_client, summer_voucher: EmployerSummerVoucher
):
    inexistent_attachment_pk = uuid.uuid4()
    employment_contract_url = handle_attachment_url(
        summer_voucher, attachment_pk=inexistent_attachment_pk
    )
    response = api_client.delete(employment_contract_url)

    assert response.status_code == 404
    assert response.data == {"detail": "File not found."}


@pytest.mark.django_db
def test_delete_attachment_for_submitted_application(
    api_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    attachment_delete_url = handle_attachment_url(
        submitted_summer_voucher, submitted_employment_contract_attachment.pk
    )

    response = api_client.delete(attachment_delete_url)

    assert response.status_code == 403
    assert "Operation not allowed for this application status." in str(response.data)
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.attachments.count() == 1


@pytest.mark.django_db
def test_get_attachment_for_submitted_application(
    api_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    attachment_url = handle_attachment_url(
        submitted_summer_voucher, submitted_employment_contract_attachment.pk
    )

    response = api_client.get(attachment_url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_get_attachment_for_staff_user(
    staff_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    attachment_url = handle_attachment_url(
        submitted_summer_voucher, submitted_employment_contract_attachment.pk
    )

    response = staff_client.get(attachment_url)

    assert response.status_code == 200


@pytest.mark.django_db
def test_get_attachment_for_other_user(
    api_client2, submitted_summer_voucher, submitted_employment_contract_attachment
):
    attachment_url = handle_attachment_url(
        submitted_summer_voucher, submitted_employment_contract_attachment.pk
    )

    response = api_client2.get(attachment_url)

    assert response.status_code == 404


@pytest.mark.django_db
def test_upload_attachment_for_submitted_application(
    request, api_client, submitted_summer_voucher
):
    response = _upload_file(
        request,
        api_client,
        submitted_summer_voucher,
        "pdf",
        AttachmentType.EMPLOYMENT_CONTRACT,
    )
    assert response.status_code == 400
    assert "Attachments can be uploaded only for DRAFT applications" in response.data
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.attachments.count() == 0
