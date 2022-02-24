import json
import os
import re
import tempfile
import uuid

import pytest
from django.conf import settings
from PIL import Image
from rest_framework.reverse import reverse

from applications.api.v1.serializers import AttachmentSerializer
from applications.enums import EmployerApplicationStatus, AttachmentType
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
@pytest.mark.parametrize("extension", ["pdf", "jpg"])
def test_attachment_upload(request, api_client, summer_voucher, extension):
    response = _upload_file(
        request,
        api_client,
        summer_voucher,
        extension,
        AttachmentType.EMPLOYMENT_CONTRACT,
    )
    assert response.status_code == 201
    assert len(summer_voucher.attachments.all()) == 1
    attachment = summer_voucher.attachments.all().first()
    assert attachment.attachment_file.name.endswith(f".{extension}")


@pytest.mark.django_db
@pytest.mark.parametrize("extension", ["pdf", "png", "jpg"])
def test_invalid_attachment_upload(
    api_client, summer_voucher: EmployerSummerVoucher, extension
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

    assert re.match("Not a valid.*file", str(response.data["non_field_errors"][0]))
    assert response.status_code == 400
    assert len(summer_voucher.attachments.all()) == 0


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
    assert str(settings.MAX_UPLOAD_SIZE) in json.dumps(
        response.json()
    )  # To avoid false positive
    assert len(summer_voucher.attachments.all()) == 0


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
    for idx, _ in enumerate(range(AttachmentSerializer.MAX_ATTACHMENTS_PER_TYPE)):
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


@pytest.mark.django_db
def test_get_attachment_with_invalid_uuid(
    api_client, summer_voucher: EmployerSummerVoucher
):
    attachment_url = handle_attachment_url(summer_voucher, attachment_pk=uuid.uuid4())
    response = api_client.get(attachment_url)

    assert response.status_code == 404


@pytest.mark.django_db
@pytest.mark.parametrize(
    "attachment_type", [attachment_type for attachment_type in AttachmentType.values]
)
def test_delete_attachment(request, api_client, summer_voucher, attachment_type):
    _upload_file(request, api_client, summer_voucher, "pdf", attachment_type)
    attachment = Attachment.objects.first()
    attachment_delete_url = handle_attachment_url(summer_voucher, attachment.pk)

    response = api_client.delete(attachment_delete_url)

    assert response.status_code == 204


@pytest.mark.django_db
def test_delete_attachment_when_not_saved(
    api_client, summer_voucher: EmployerSummerVoucher
):
    employment_contract_url = handle_attachment_url(
        summer_voucher, attachment_pk=uuid.uuid4()
    )
    response = api_client.delete(employment_contract_url)

    assert response.status_code == 404


@pytest.mark.django_db
def test_delete_attachment_for_submitted_application(
    api_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    attachment_delete_url = handle_attachment_url(
        submitted_summer_voucher, submitted_employment_contract_attachment.pk
    )

    response = api_client.delete(attachment_delete_url)

    assert response.status_code == 400
    assert "Attachments can be deleted only for DRAFT applications" in response.data
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
