from datetime import datetime
from typing import List

from django.conf import settings
from django.urls import reverse

from applications.enums import (
    AhjoRecordTitle,
    AhjoRecordType,
    AhjoRequestType,
    AttachmentType,
)
from applications.models import Application, APPLICATION_LANGUAGE_CHOICES, Attachment
from common.utils import hash_file
from users.models import User

MANNER_OF_RECEIPT = "sähköinen asiointi"
IS_UPDATE_TITLE_PART = " täydennys,"


def _prepare_record_title(
    application: Application,
    record_type: AhjoRecordType,
    request_type: AhjoRequestType,
    current: int = 0,
    total: int = 0,
) -> str:
    """Prepare the title for the application record in Ahjo in the format:
    Hakemus 11.4.2024, 128123
    or for an attachment:
    Hakemus 11.4.2024, liite 1/3, 128123
    If the request type is an update, add the word "täydennys" to the title.
    """
    formatted_date = application.created_at.strftime("%d.%m.%Y")
    title_part = (
        IS_UPDATE_TITLE_PART
        if request_type == AhjoRequestType.UPDATE_APPLICATION
        else ""
    )

    if record_type == AhjoRecordType.APPLICATION:
        return f"{AhjoRecordTitle.APPLICATION},{title_part} {formatted_date}, {application.application_number}"
    return f"{AhjoRecordTitle.APPLICATION} {formatted_date}, liite {current}/{total}, {application.application_number}"


def prepare_case_title(application: Application, company_name: str) -> str:
    """Prepare the case title for Ahjo"""
    full_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {company_name}, \
hakemus {application.application_number}"
    return full_title


def prepare_final_case_title(application: Application) -> str:
    """Prepare the final case title for Ahjo, if the full title is over 100 characters, \
    truncate the company name to fit the limit."""
    limit = 100
    full_case_title = prepare_case_title(application, application.company_name)
    length_of_full_title = len(full_case_title)

    if length_of_full_title <= limit:
        return full_case_title
    else:
        over_limit = length_of_full_title - limit
        truncated_company_name = truncate_company_name(
            application.company_name, over_limit
        )
        return prepare_case_title(application, truncated_company_name)


def truncate_company_name(company_name: str, chars_to_truncate: int) -> str:
    """Truncate the company name to a number of characters, \
    because Ahjo has a technical limitation of 100 characters for the company name."""
    return company_name[:-chars_to_truncate]


def resolve_payload_language(application: Application) -> str:
    """Ahjo cannot at the moment handle en and sv language cases, so if the language is en or sv we use fi"""
    if application.applicant_language in [
        APPLICATION_LANGUAGE_CHOICES[1][0],
        APPLICATION_LANGUAGE_CHOICES[2][0],
    ]:
        language = APPLICATION_LANGUAGE_CHOICES[0][0]
    else:
        language = application.applicant_language
    return language


def _prepare_top_level_dict(
    application: Application, case_records: List[dict], case_title: str
) -> dict:
    """Prepare the dictionary that is sent to Ahjo"""
    application_date = application.created_at.isoformat("T", "seconds")

    handler = application.calculation.handler
    case_dict = {
        "Title": case_title,
        "Acquired": application_date,
        "ClassificationCode": "02 05 01 00",
        "ClassificationTitle": "Kunnan myöntämät avustukset",
        "Language": resolve_payload_language(application),
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
                "CorporateName": truncate_company_name(application.company.name, 100),
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
    record_title: str,
    record_type: AhjoRecordType,
    acquired: datetime,
    documents: List[dict],
    handler: User,
    publicity_class: str = "Salassa pidettävä",
    ahjo_version_series_id: str = None,
    language: str = "fi",  # TODO refactor so all these parameters are passes as a dataclass
):
    """Prepare a single record dict for Ahjo."""

    record_dict = {
        "Title": record_title,
        "Type": record_type,
        "Acquired": acquired,
        "PublicityClass": publicity_class,
        "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
        "Language": language,
        "PersonalData": "Sisältää erityisiä henkilötietoja",
    }
    if ahjo_version_series_id is not None:
        record_dict["VersionSeriesId"] = ahjo_version_series_id

    elif ahjo_version_series_id is None and record_type == AhjoRecordType.APPLICATION:
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
    language = resolve_payload_language(application)

    pdf_summary_version_series_id = (
        pdf_summary.ahjo_version_series_id if is_update else None
    )

    main_document_record = _prepare_record(
        record_title=_prepare_record_title(
            application, AhjoRecordType.APPLICATION, AhjoRequestType.OPEN_CASE
        ),
        record_type=AhjoRecordType.APPLICATION,
        acquired=application.created_at.isoformat("T", "seconds"),
        documents=[_prepare_record_document_dict(pdf_summary)],
        handler=handler,
        ahjo_version_series_id=pdf_summary_version_series_id,
        language=language,
    )

    case_records.append(main_document_record)

    open_case_attachments = application.attachments.exclude(
        attachment_type__in=[
            AttachmentType.PDF_SUMMARY,  # The main document is already added
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ]
    )
    total_attachments = open_case_attachments.count()
    position = 1
    for attachment in open_case_attachments:
        attachment_version_series_id = (
            pdf_summary.ahjo_version_series_id if is_update else None
        )

        document_record = _prepare_record(
            record_title=_prepare_record_title(
                application,
                AhjoRecordType.ATTACHMENT,
                AhjoRequestType.OPEN_CASE,
                position,
                total_attachments,
            ),
            record_type=AhjoRecordType.ATTACHMENT,
            acquired=attachment.created_at.isoformat("T", "seconds"),
            documents=[_prepare_record_document_dict(attachment)],
            handler=handler,
            ahjo_version_series_id=attachment_version_series_id,
            language=language,
        )
        case_records.append(document_record)
        position += 1

    return case_records


def prepare_open_case_payload(
    application: Application, pdf_summary: Attachment
) -> dict:
    "Prepare the complete dictionary payload that is sent to Ahjo"
    case_records = _prepare_case_records(application, pdf_summary)
    case_title = prepare_final_case_title(application)
    payload = _prepare_top_level_dict(application, case_records, case_title)
    return payload


def prepare_attachment_records_payload(
    attachments: List[Attachment],
    application: Application,
) -> dict[str, list[dict]]:
    """Prepare a payload for the new attachments of an application."""
    language = resolve_payload_language(application)

    attachment_list = []
    position = 1
    total_attachments = len(attachments)
    for attachment in attachments:
        attachment_list.append(
            _prepare_record(
                record_title=_prepare_record_title(
                    application,
                    AhjoRecordType.ATTACHMENT,
                    AhjoRequestType.ADD_RECORDS,
                    position,
                    total_attachments,
                ),
                record_type=AhjoRecordType.ATTACHMENT,
                acquired=attachment.created_at.isoformat("T", "seconds"),
                documents=[_prepare_record_document_dict(attachment)],
                handler=application.calculation.handler,
                language=language,
            )
        )
        position += 1

    return {"records": attachment_list}


def prepare_update_application_payload(
    pdf_summary: Attachment, application: Application
) -> dict:
    """Prepare the payload that is sent to Ahjo when an application is updated, \
          in this case it only contains a Records dict"""
    if not pdf_summary.ahjo_version_series_id:
        raise ValueError(
            f"Attachment for {application.application_number} must have a ahjo_version_series_id for update."
        )
    language = resolve_payload_language(application)
    return {
        "records": [
            _prepare_record(
                record_title=_prepare_record_title(
                    application,
                    AhjoRecordType.APPLICATION,
                    AhjoRequestType.UPDATE_APPLICATION,
                ),
                record_type=AhjoRecordType.APPLICATION,
                acquired=pdf_summary.created_at.isoformat("T", "seconds"),
                documents=[_prepare_record_document_dict(pdf_summary)],
                handler=application.calculation.handler,
                ahjo_version_series_id=pdf_summary.ahjo_version_series_id,
                language=language,
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
    language = resolve_payload_language(application)

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
