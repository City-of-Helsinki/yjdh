from django.core.files.base import ContentFile
from django.urls import reverse

from applications.enums import AttachmentType
from applications.models import Attachment
from applications.services.ahjo_payload import (
    _prepare_case_records,
    _prepare_record,
    _prepare_record_document_dict,
    _prepare_top_level_dict,
)
from common.utils import hash_file


def test_prepare_record(decided_application, ahjo_payload_record):
    application = decided_application

    record = _prepare_record(
        ahjo_payload_record["Title"],
        ahjo_payload_record["Type"],
        application.created_at.isoformat(),
        application.application_number,
        [],
        application.calculation.handler,
    )

    assert ahjo_payload_record == record


def test_prepare_record_document_dict(decided_application, settings):
    settings.DEBUG = True
    settings.API_BASE_URL = "http://test.com"
    attachment = decided_application.attachments.first()
    hash_value = hash_file(attachment.attachment_file)
    file_url = reverse("ahjo_attachment_url", kwargs={"uuid": attachment.id})

    want = {
        "FileName": attachment.attachment_file.name,
        "FormatName": attachment.content_type,
        "HashAlgorithm": "sha256",
        "HashValue": hash_value,
        "FileURI": f"{settings.API_BASE_URL}{file_url}",
    }

    got = _prepare_record_document_dict(attachment)

    assert want == got


def test_prepare_case_records(decided_application, settings):
    settings.DEBUG = True
    application = decided_application

    fake_file = ContentFile(
        b"fake file content",
        f"application_summary_{application.application_number}.pdf",
    )

    fake_summary = Attachment.objects.create(
        application=application,
        attachment_file=fake_file,
        content_type="application/pdf",
        attachment_type=AttachmentType.PDF_SUMMARY,
    )
    handler = application.calculation.handler
    handler_name = f"{handler.last_name}, {handler.first_name}"
    want = [
        {
            "Title": "Hakemus",
            "Type": "hakemus",
            "Acquired": application.created_at.isoformat(),
            "PublicityClass": "Salassa pidettävä",
            "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
            "Language": "fi",
            "PersonalData": "Sisältää erityisiä henkilötietoja",
            "Reference": str(application.application_number),
            "Documents": [_prepare_record_document_dict(fake_summary)],
            "Agents": [
                {
                    "Role": "mainCreator",
                    "Name": handler_name,
                    "ID": handler.ad_username,
                }
            ],
        }
    ]

    for attachment in application.attachments.exclude(
        attachment_type=AttachmentType.PDF_SUMMARY
    ):
        document_record = _prepare_record(
            "Hakemuksen Liite",
            "liite",
            attachment.created_at.isoformat(),
            attachment.id,
            [_prepare_record_document_dict(attachment)],
            handler,
        )

        want.append(document_record)

    got = _prepare_case_records(application, fake_summary)

    assert want == got


def test_prepare_top_level_dict(decided_application, ahjo_open_case_top_level_dict):
    application = decided_application

    got = _prepare_top_level_dict(application, [])

    assert ahjo_open_case_top_level_dict == got
