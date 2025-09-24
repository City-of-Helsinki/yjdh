import uuid
from datetime import datetime
from unittest.mock import Mock

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse

from applications.enums import (
    AhjoRecordTitle,
    AhjoRecordType,
    AhjoRequestType,
    AttachmentType,
)
from applications.models import AhjoDecisionText, Application, Attachment
from applications.services.ahjo_payload import (
    _prepare_case_records,
    _prepare_record,
    _prepare_record_document_dict,
    _prepare_top_level_dict,
    AddRecordsRecordTitle,
    AhjoBaseRecordTitle,
    AhjoTitle,
    OpenCaseRecordTitle,
    prepare_case_title,
    prepare_decision_proposal_payload,
    prepare_final_case_title,
    prepare_update_application_payload,
    resolve_payload_language,
    truncate_string_to_limit,
    UpdateRecordsRecordTitle,
)
from common.utils import hash_file


# Test the AhjoTitle format_title_string method
def test_format_title_string():
    mock_app = Mock(spec=Application)
    mock_app.created_at = datetime(2023, 1, 15)
    mock_app.application_number = "12345"

    ahjo_title = AhjoTitle(
        application=mock_app, prefix=" Test Prefix", suffix=" Test Suffix"
    )
    formatted_date = "15.01.2023"
    application_number = "12345"

    result = ahjo_title.format_title_string(formatted_date, application_number)
    expected = (
        f"{AhjoRecordTitle.APPLICATION} Test Prefix 15.01.2023, Test Suffix 12345"
    )
    assert result == expected


# Test OpenCaseRecordTitle class
def test_open_case_record_title_str():
    mock_app = Mock(spec=Application)
    mock_app.created_at = datetime(2023, 1, 15)
    mock_app.application_number = "12345"

    open_case_title = OpenCaseRecordTitle(application=mock_app)
    result = str(open_case_title)
    expected = f"{AhjoRecordTitle.APPLICATION} 15.01.2023, 12345"
    assert result == expected


# Test UpdateRecordsRecordTitle class
def test_update_records_record_title_str():
    mock_app = Mock(spec=Application)
    mock_app.created_at = datetime(2023, 3, 10)
    attachment_created_at = datetime(2023, 2, 25)
    mock_app.application_number = "67890"

    update_records_title = UpdateRecordsRecordTitle(
        application=mock_app, attachment_created_at=attachment_created_at
    )
    result = str(update_records_title)
    expected = f"{AhjoRecordTitle.APPLICATION}, täydennys 25.02.2023, 67890"
    assert result == expected


# Test AddRecordsRecordTitle class
def test_add_records_record_title_str():
    mock_app = Mock(spec=Application)
    mock_app.created_at = datetime(2023, 3, 10)
    attachment_created_at = datetime(2023, 3, 10)
    mock_app.application_number = "54321"

    add_records_title = AddRecordsRecordTitle(
        application=mock_app, attachment_created_at=attachment_created_at
    )
    result = str(add_records_title)
    expected = f"{AhjoRecordTitle.APPLICATION}, täydennys 10.03.2023, 54321"
    assert result == expected


# Test AhjoBaseRecordTitle class
def test_ahjo_base_record_title_str():
    mock_app = Mock(spec=Application)
    mock_app.modified_at = datetime(2023, 4, 5)
    mock_app.application_number = "98765"

    base_record_title = AhjoBaseRecordTitle(application=mock_app, current=1, total=5)
    result = str(base_record_title)
    expected = f"{AhjoRecordTitle.APPLICATION} 05.04.2023, liite 1/5, 98765"
    assert result == expected


def test_prepare_case_title(decided_application):
    application = decided_application
    wanted_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {application.company.name}, \
hakemus {application.application_number}"
    got = prepare_case_title(application, decided_application.company.name)
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
        # 256 characters is the maximun length for the company name in the database
        ("a" * 256, 512, 512),
    ],
)
def test_prepare_final_case_title_truncate(
    decided_application, company_name, limit, expected_length
):
    application = decided_application
    application.company.name = company_name
    application.company.save()
    assert len(prepare_final_case_title(application, limit)) <= expected_length


@pytest.mark.parametrize(
    "title_class, record_title, record_type, request_type, wanted_title_addition, part, total",
    [
        (
            OpenCaseRecordTitle,
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.APPLICATION,
            AhjoRequestType.OPEN_CASE,
            "",
            0,
            0,
        ),
        (
            UpdateRecordsRecordTitle,
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.APPLICATION,
            AhjoRequestType.UPDATE_APPLICATION,
            ", täydennys",
            0,
            0,
        ),
        (
            AddRecordsRecordTitle,
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.ATTACHMENT,
            AhjoRequestType.ADD_RECORDS,
            ", täydennys",
            0,
            0,
        ),
        (
            AhjoBaseRecordTitle,
            AhjoRecordTitle.APPLICATION,
            AhjoRecordType.ATTACHMENT,
            AhjoRequestType.OPEN_CASE,
            "",
            1,
            3,
        ),
    ],
)
def test_prepare_record_title(
    title_class,
    decided_application,
    record_title,
    record_type,
    request_type,
    wanted_title_addition,
    part,
    total,
):
    application = Application.objects.get(pk=decided_application.pk)

    formatted_date = application.submitted_at.strftime("%d.%m.%Y")

    if part and total:
        wanted_title = f"{record_title}{wanted_title_addition} {formatted_date},\
 liite {part}/{total}, {application.application_number}"
    else:
        wanted_title = f"{record_title}{wanted_title_addition} {formatted_date}, {application.application_number}"
    if (
        record_type == AhjoRecordType.ATTACHMENT
        and request_type == AhjoRequestType.OPEN_CASE
    ):
        got = f"{title_class(application, current=part, total=total)}"
    elif title_class in [UpdateRecordsRecordTitle, AddRecordsRecordTitle]:
        got = f"{title_class(application=application, attachment_created_at=application.submitted_at)}"
    else:
        got = f"{title_class(application=application)}"
    assert wanted_title == got


def test_prepare_record_title_for_attachment(decided_application):
    application = Application.objects.get(pk=decided_application.pk)

    formatted_date = application.created_at.strftime("%d.%m.%Y")
    wanted_title = f"{AhjoRecordTitle.APPLICATION} {formatted_date}, liite 1/3, {application.application_number}"
    got = f"{AhjoBaseRecordTitle(application=application, current=1, total=3)}"
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
    application = Application.objects.get(pk=decided_application.pk)

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
            "Title": f"{OpenCaseRecordTitle(application=application)}",
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
            f"{AhjoBaseRecordTitle(application=application, current=pos, total=total_attachments)}",
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
    application = Application.objects.get(pk=decided_application.pk)
    long_title = "a" * 512
    short_title = "a" * 150

    got = _prepare_top_level_dict(
        application, [], public_case_title=long_title, internal_case_title=short_title
    )

    assert ahjo_open_case_top_level_dict == got


def test_prepare_update_application_payload(decided_application):
    application = Application.objects.get(pk=decided_application.pk)

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
    title = UpdateRecordsRecordTitle(
        application=application, attachment_created_at=fake_summary.created_at
    )
    want = {
        "records": [
            {
                "Title": f"{title}",
                "Type": AhjoRecordType.APPLICATION,
                "Acquired": application.submitted_at.isoformat(),
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


def test_prepare_decision_proposal_payload(application_with_ahjo_decision):
    application = application_with_ahjo_decision
    handler = application.calculation.handler
    handler.ad_username = "test_user"
    handler.save()
    handler_name = f"{handler.last_name}, {handler.first_name}"
    handler_id = handler.ad_username
    language = resolve_payload_language(application)
    decision = AhjoDecisionText.objects.get(application=application)

    attachment_for_testing = application.attachments.first()

    want = {
        "records": [
            {
                "Title": AhjoRecordTitle.DECISION_PROPOSAL,
                "Type": AhjoRecordType.DECISION_PROPOSAL,
                "PublicityClass": "Julkinen",
                "Language": language,
                "PersonalData": "Sisältää henkilötietoja",
                "Documents": [_prepare_record_document_dict(attachment_for_testing)],
                "Agents": [
                    {
                        "Role": "mainCreator",
                        "Name": handler_name,
                        "ID": handler_id,
                    },
                    {
                        "Role": "decisionMaker",
                        "ID": decision.decision_maker_id,
                    },
                    {
                        "Role": "signer",
                        "ID": decision.signer_id,
                        "Name": decision.signer_name,
                    },
                ],
            },
            {
                "Title": AhjoRecordTitle.SECRET_ATTACHMENT,
                "Type": AhjoRecordType.SECRET_ATTACHMENT,
                "PublicityClass": "Salassa pidettävä",
                "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
                "Language": language,
                "PersonalData": "Sisältää erityisiä henkilötietoja",
                "Documents": [_prepare_record_document_dict(attachment_for_testing)],
                "Agents": [
                    {
                        "Role": "mainCreator",
                        "Name": handler_name,
                        "ID": handler_id,
                    }
                ],
            },
        ]
    }

    got = prepare_decision_proposal_payload(
        application=application,
        decision_xml=attachment_for_testing,
        decision_text=decision,
        secret_xml=attachment_for_testing,
    )

    assert want == got
