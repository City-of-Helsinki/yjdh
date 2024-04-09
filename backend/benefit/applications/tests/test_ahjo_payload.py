from django.core.files.base import ContentFile
from django.urls import reverse

from applications.enums import AttachmentType
from applications.models import Attachment
from applications.services.ahjo_payload import (
    _prepare_case_records,
    _prepare_case_title,
    _prepare_record,
    _prepare_record_document_dict,
    _prepare_top_level_dict,
)
from common.utils import hash_file


def test_prepare_case_title(decided_application):
    application = decided_application
    wanted_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {application.company_name}, \
hakemus {application.application_number}"
    got = _prepare_case_title(application)
    assert wanted_title == got


def test_prepare_application_record(
    decided_application, ahjo_payload_record_for_application
):
    application = decided_application

    record = _prepare_record(
        ahjo_payload_record_for_application["Title"],
        ahjo_payload_record_for_application["Type"],
        application.created_at.isoformat(),
        [],
        application.calculation.handler,
    )

    assert ahjo_payload_record_for_application == record


def test_prepare_attachment_record(
    decided_application, ahjo_payload_record_for_attachment
):
    application = decided_application

    record = _prepare_record(
        ahjo_payload_record_for_attachment["Title"],
        ahjo_payload_record_for_attachment["Type"],
        application.created_at.isoformat(),
        [],
        application.calculation.handler,
    )

    assert ahjo_payload_record_for_attachment == record


def test_prepare_attachment_update_record(
    decided_application,
    ahjo_payload_record_for_attachment_update,
    dummy_version_series_id,
):
    application = decided_application

    record = _prepare_record(
        ahjo_payload_record_for_attachment_update["Title"],
        ahjo_payload_record_for_attachment_update["Type"],
        application.created_at.isoformat(),
        [],
        application.calculation.handler,
        ahjo_version_series_id=dummy_version_series_id,
    )

    assert ahjo_payload_record_for_attachment_update == record


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
            "MannerOfReceipt": "sähköinen asiointi",
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
            "Hakemuksen liite",
            "hakemuksen liite",
            attachment.created_at.isoformat(),
            [_prepare_record_document_dict(attachment)],
            handler,
        )

        want.append(document_record)

    got = _prepare_case_records(application, fake_summary)

    assert want == got


def test_prepare_top_level_dict(decided_application, ahjo_open_case_top_level_dict):
    application = decided_application

    got = _prepare_top_level_dict(application, [], "message title")

    assert ahjo_open_case_top_level_dict == got
