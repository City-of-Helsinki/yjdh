import uuid

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse

from applications.enums import (
    AhjoRecordTitle,
    AhjoRecordType,
    AhjoRequestType,
    AttachmentType,
)
from applications.models import Attachment
from applications.services.ahjo_payload import (
    _prepare_case_records,
    _prepare_record,
    _prepare_record_document_dict,
    _prepare_record_title,
    _prepare_top_level_dict,
    prepare_case_title,
    prepare_final_case_title,
    prepare_update_application_payload,
    resolve_payload_language,
    truncate_string_to_limit,
)
from common.utils import hash_file


def test_prepare_case_title(decided_application):
    application = decided_application
    wanted_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {application.company_name}, \
hakemus {application.application_number}"
    got = prepare_case_title(application, decided_application.company_name)
    assert wanted_title == got


@pytest.mark.parametrize(
    "input_string, limit, expected_length, resulting_string",
    [
        # ("a" * 200, 100, 100),
        ("a" * 100 + "b" * 5, 100, 100, "a" * 100),
        ("a" * 100, 100, 100, "a" * 100),
        ("a" * 50, 100, 50, "a" * 50),
        ("1234567890AB", 10, 10, "1234567890"),
    ],
)
def test_truncate_string_to_limit(
    input_string, limit, expected_length, resulting_string
):
    result = truncate_string_to_limit(input_string, limit)
    assert len(result) == expected_length
    assert result == resulting_string


@pytest.mark.parametrize(
    "company_name, limit, expected_length",
    [
        ("a" * 100 + "b" * 100, 100, 150),
        ("a" * 100 + "b" * 5, 100, 150),
        ("a" * 100, 100, 150),
        ("a" * 50, 100, 150),
        ("1234567890AB", 10, 150),
    ],
)
def test_prepare_final_case_title_truncate(
    decided_application, company_name, limit, expected_length
):
    application = decided_application
    application.company_name = company_name
    assert len(prepare_final_case_title(application, limit)) <= expected_length


@pytest.mark.parametrize(
    "record_title, record_type, request_type, wanted_title_addition",
    [
        (
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.APPLICATION,
            AhjoRequestType.OPEN_CASE,
            "",
        ),
        (
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.APPLICATION,
            AhjoRequestType.UPDATE_APPLICATION,
            " täydennys,",
        ),
    ],
)
def test_prepare_record_title(
    decided_application, record_title, record_type, request_type, wanted_title_addition
):
    application = decided_application
    formatted_date = application.created_at.strftime("%d.%m.%Y")

    wanted_title = f"{record_title},{wanted_title_addition} {formatted_date}, {application.application_number}"
    got = _prepare_record_title(application, record_type, request_type)
    assert wanted_title == got


def test_prepare_record_title_for_attachment(decided_application):
    application = decided_application
    formatted_date = application.created_at.strftime("%d.%m.%Y")
    wanted_title = f"{AhjoRecordTitle.APPLICATION} {formatted_date}, liite 1/3, {application.application_number}"
    got = _prepare_record_title(
        application, AhjoRecordType.ATTACHMENT, AhjoRequestType.OPEN_CASE, 1, 3
    )
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
            "Title": _prepare_record_title(
                application, AhjoRecordType.APPLICATION, AhjoRequestType.OPEN_CASE
            ),
            "Type": AhjoRecordType.APPLICATION,
            "Acquired": application.created_at.isoformat("T", "seconds"),
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
    open_case_attachments = application.attachments.exclude(
        attachment_type__in=[
            AttachmentType.PDF_SUMMARY,
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ]
    )
    total_attachments = open_case_attachments.count()
    pos = 1

    for attachment in open_case_attachments:
        document_record = _prepare_record(
            _prepare_record_title(
                application,
                AhjoRecordType.ATTACHMENT,
                AhjoRequestType.OPEN_CASE,
                pos,
                total_attachments,
            ),
            AhjoRecordType.ATTACHMENT,
            attachment.created_at.isoformat("T", "seconds"),
            [_prepare_record_document_dict(attachment)],
            handler,
        )

        want.append(document_record)
        pos += 1

    got = _prepare_case_records(application, fake_summary)

    assert want == got


def test_prepare_top_level_dict(decided_application, ahjo_open_case_top_level_dict):
    application = decided_application

    got = _prepare_top_level_dict(application, [], "message title")

    assert ahjo_open_case_top_level_dict == got


def test_prepare_update_application_payload(decided_application):
    application = decided_application
    handler = application.calculation.handler
    handler_name = f"{handler.last_name}, {handler.first_name}"
    handler_id = handler.ad_username

    fake_file = ContentFile(
        b"fake file content",
        f"application_summary_{application.application_number}.pdf",
    )

    fake_summary = Attachment.objects.create(
        application=application,
        attachment_file=fake_file,
        content_type="application/pdf",
        attachment_type=AttachmentType.PDF_SUMMARY,
        ahjo_version_series_id=str(uuid.uuid4()),
    )

    want = {
        "records": [
            {
                "Title": _prepare_record_title(
                    application,
                    AhjoRecordType.APPLICATION,
                    AhjoRequestType.UPDATE_APPLICATION,
                ),
                "Type": AhjoRecordType.APPLICATION,
                "Acquired": application.created_at.isoformat(),
                "PublicityClass": "Salassa pidettävä",
                "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
                "Language": "fi",
                "PersonalData": "Sisältää erityisiä henkilötietoja",
                "VersionSeriesId": str(fake_summary.ahjo_version_series_id),
                "Documents": [_prepare_record_document_dict(fake_summary)],
                "Agents": [
                    {
                        "Role": "mainCreator",
                        "Name": handler_name,
                        "ID": handler_id,
                    }
                ],
            }
        ]
    }

    got = prepare_update_application_payload(fake_summary, decided_application)

    assert want == got


@pytest.mark.parametrize(
    [
        "applicant_language",
        "expected_payload_language",
    ],
    [
        ("fi", "fi"),
        ("sv", "fi"),
        ("en", "fi"),
    ],
)
def test_resolve_payload_language(
    decided_application, applicant_language, expected_payload_language
):
    decided_application.applicant_language = applicant_language

    got = resolve_payload_language(decided_application)

    assert expected_payload_language == got
