from datetime import datetime
from typing import List

from django.conf import settings
from django.urls import reverse

from applications.enums import AhjoRecordTitle, AhjoRecordType, AttachmentType
from applications.models import Application, Attachment
from common.utils import hash_file
from users.models import User

MANNER_OF_RECEIPT = "sähköinen asiointi"


def _prepare_case_title(application: Application) -> str:
    full_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {application.company_name}, \
hakemus {application.application_number}"
    return full_title


def _prepare_top_level_dict(
    application: Application, case_records: List[dict], case_title: str
) -> dict:
    """Prepare the dictionary that is sent to Ahjo"""
    application_date = application.created_at.isoformat("T", "seconds")
    language = application.applicant_language

    handler = application.calculation.handler
    case_dict = {
        "Title": case_title,
        "Acquired": application_date,
        "ClassificationCode": "02 05 01 00",
        "ClassificationTitle": "Kunnan myöntämät avustukset",
        "Language": language,
        "PublicityClass": "Julkinen",
        "InternalTitle": case_title,
        "Subjects": [
            {"Subject": "Helsinki-lisät", "Scheme": "hki-yhpa"},
            {"Subject": "kunnan myöntämät avustukset", "Scheme": "hki-yhpa"},
            {"Subject": "työnantajat", "Scheme": "hki-yhpa"},
            {"Subject": "työllisyydenhoito"},
        ],
        "PersonalData": "Sisältää erityisiä henkilötietoja",
        "Reference": f"{application.application_number}",
        "Records": case_records,
        "Agents": [
            {
                "Role": "sender_initiator",
                "CorporateName": application.company.name,
                "ContactPerson": application.contact_person,
                "Type": "External",
                "Email": application.company_contact_person_email,
                "AddressStreet": application.company.street_address,
                "AddressPostalCode": application.company.postcode,
                "AddressCity": application.company.city,
            },
            {
                "Role": "draftsman",
                "Name": f"{handler.last_name}, {handler.first_name}",
                "ID": handler.ad_username,
            },
        ],
    }
    return case_dict


def _prepare_record_document_dict(attachment: Attachment) -> dict:
    """Prepare a documents dict for a record"""
    # If were running in mock mode, use the local file URI
    file_url = reverse("ahjo_attachment_url", kwargs={"uuid": attachment.id})
    hash_value = hash_file(attachment.attachment_file)
    attachment.ahjo_hash_value = hash_value
    attachment.save()
    return {
        "FileName": f"{attachment.attachment_file.name}",
        "FormatName": f"{attachment.content_type}",
        "HashAlgorithm": "sha256",
        "HashValue": hash_value,
        "FileURI": f"{settings.API_BASE_URL}{file_url}",
    }


def _prepare_record(
    record_title: AhjoRecordTitle,
    record_type: AhjoRecordType,
    acquired: datetime,
    documents: List[dict],
    handler: User,
    publicity_class: str = "Salassa pidettävä",
    ahjo_version_series_id: str = None,
):
    """Prepare a single record dict for Ahjo."""

    record_dict = {
        "Title": record_title,
        "Type": record_type,
        "Acquired": acquired,
        "PublicityClass": publicity_class,
        "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
        "Language": "fi",
        "PersonalData": "Sisältää erityisiä henkilötietoja",
    }
    if ahjo_version_series_id is not None:
        record_dict["VersionSeriesId"] = ahjo_version_series_id

    elif ahjo_version_series_id is None and record_title == AhjoRecordTitle.APPLICATION:
        record_dict["MannerOfReceipt"] = MANNER_OF_RECEIPT

    record_dict["Documents"] = documents
    record_dict["Agents"] = [
        {
            "Role": "mainCreator",
            "Name": f"{handler.last_name}, {handler.first_name}",
            "ID": handler.ad_username,
        }
    ]

    return record_dict


def _prepare_case_records(
    application: Application, pdf_summary: Attachment, is_update: bool = False
) -> List[dict]:
    """Prepare the list of case records from  application's attachments,
    including the pdf summary of the application."""
    case_records = []
    handler = application.calculation.handler

    pdf_summary_version_series_id = (
        pdf_summary.ahjo_version_series_id if is_update else None
    )

    main_document_record = _prepare_record(
        AhjoRecordTitle.APPLICATION,
        AhjoRecordType.APPLICATION,
        application.created_at.isoformat("T", "seconds"),
        [_prepare_record_document_dict(pdf_summary)],
        handler,
        ahjo_version_series_id=pdf_summary_version_series_id,
    )

    case_records.append(main_document_record)

    for attachment in application.attachments.exclude(
        attachment_type__in=[
            AttachmentType.PDF_SUMMARY,
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ]
    ):
        attachment_version_series_id = (
            pdf_summary.ahjo_version_series_id if is_update else None
        )

        document_record = _prepare_record(
            AhjoRecordTitle.ATTACHMENT,
            AhjoRecordType.ATTACHMENT,
            attachment.created_at.isoformat("T", "seconds"),
            [_prepare_record_document_dict(attachment)],
            handler,
            ahjo_version_series_id=attachment_version_series_id,
        )
        case_records.append(document_record)

    return case_records


def prepare_open_case_payload(
    application: Application, pdf_summary: Attachment
) -> dict:
    "Prepare the complete dictionary payload that is sent to Ahjo"
    case_records = _prepare_case_records(application, pdf_summary)
    case_title = _prepare_case_title(application)
    payload = _prepare_top_level_dict(application, case_records, case_title)
    return payload


def prepare_attachment_records_payload(
    attachments: List[Attachment],
    handler: User,
) -> dict[str, list[dict]]:
    """Prepare a payload for the new attachments of an application."""

    attachment_list = []

    for attachment in attachments:
        attachment_list.append(
            _prepare_record(
                AhjoRecordTitle.ATTACHMENT,
                AhjoRecordType.ATTACHMENT,
                attachment.created_at.isoformat("T", "seconds"),
                [_prepare_record_document_dict(attachment)],
                handler,
            )
        )

    return {"records": attachment_list}


def prepare_update_application_payload(pdf_summary: Attachment, handler: User) -> dict:
    """Prepare the payload that is sent to Ahjo when an application is updated, \
          in this case it only contains a Records dict"""
    return {
        "records": [
            _prepare_record(
                AhjoRecordTitle.APPLICATION,
                AhjoRecordType.APPLICATION,
                pdf_summary.created_at.isoformat("T", "seconds"),
                [_prepare_record_document_dict(pdf_summary)],
                handler,
            )
        ]
    }


def prepare_decision_proposal_payload(
    application: Application, decision_xml: Attachment, secret_xml: Attachment
) -> dict:
    """Prepare the payload that is sent to Ahjo when a decision proposal is created"""
    handler = application.calculation.handler
    inspector_dict = {"Role": "inspector", "Name": "Tarkastaja, Tero", "ID": "terot"}
    # TODO remove hard coded decision maker
    decision_maker_dict = {"Role": "decisionMaker", "ID": "U02120013070VH2"}
    language = application.applicant_language

    main_creator_dict = {
        "Role": "mainCreator",
        "Name": f"{handler.last_name}, {handler.first_name}",
        "ID": handler.ad_username,
    }

    proposal_dict = {
        "records": [
            {
                "Title": AhjoRecordTitle.DECISION_PROPOSAL,
                "Type": AhjoRecordType.DECISION_PROPOSAL,
                "PublicityClass": "Julkinen",
                "Language": language,
                "PersonalData": "Sisältää henkilötietoja",
                "Documents": [_prepare_record_document_dict(decision_xml)],
                "Agents": [
                    main_creator_dict,
                    inspector_dict,
                    decision_maker_dict,
                ],
            },
            {
                "Title": AhjoRecordTitle.SECRET_ATTACHMENT,
                "Type": AhjoRecordType.SECRET_ATTACHMENT,
                "PublicityClass": "Salassa pidettävä",
                "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
                "Language": language,
                "PersonalData": "Sisältää erityisiä henkilötietoja",
                "Documents": [_prepare_record_document_dict(secret_xml)],
                "Agents": [main_creator_dict],
            },
        ]
    }

    return proposal_dict
