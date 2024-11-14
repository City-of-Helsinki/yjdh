from dataclasses import dataclass, field
from datetime import datetime
from typing import List

from django.conf import settings
from django.urls import reverse

from applications.enums import AhjoRecordTitle, AhjoRecordType, AttachmentType
from applications.models import (
    AhjoDecisionText,
    Application,
    APPLICATION_LANGUAGE_CHOICES,
    Attachment,
)
from common.utils import hash_file
from users.models import User

MANNER_OF_RECEIPT = "sähköinen asiointi"


@dataclass
class AhjoTitle:
    """
    Base class for creating title strings for various record types related to an application.

    Attributes:
        application (Application): The application object that contains details
        like created or modified date, and application number.
        prefix (str): A string to be added before the date in the title.
        suffix (str): A string to be added after the date in the title.
    """

    application: Application = None
    prefix: str = ""
    suffix: str = ""

    def format_title_string(self, formatted_date: str, application_number: str) -> str:
        """
        Formats the title string using the provided date and application number.

        Args:
            formatted_date (str): A formatted string representing the date.
            application_number (str): The application number as a string.

        Returns:
            str: A formatted title string that includes the prefix, date, suffix, and application number.
        """
        return f"{AhjoRecordTitle.APPLICATION}{self.prefix} {formatted_date},{self.suffix} {application_number}"


@dataclass
class OpenCaseRecordTitle(AhjoTitle):
    """
    A class for creating the title of an open case record.

    Inherits from AhjoTitle. Uses the application's creation date and application number to format the title.

    Methods:
        __str__(): Returns the formatted string representation of the open case title.
    """

    def __str__(self):
        """
        Returns a formatted title string for an open case, using the application's creation date and application number.

        Returns:
            str: The formatted title string.
        """
        formatted_date = self.application.created_at.strftime("%d.%m.%Y")
        return self.format_title_string(
            formatted_date, self.application.application_number
        )


@dataclass
class UpdateRecordsRecordTitle(AhjoTitle):
    """
    A class for creating the title of an update record.

    Inherits from AhjoTitle. Uses the application's modification date and application number to format the title.
    The prefix is set to ", täydennys" by default.

    Attributes:
        prefix (str): A default string ", täydennys" that is used in the title of update records.
        attachment_created_at (datetime): The created_at date of the attachment that is being updated to Ahjo.

    Methods:
        __str__(): Returns the formatted string representation of the update record title.
    """

    prefix: str = field(default=", täydennys")
    attachment_created_at: datetime = None

    def __str__(self):
        """
        Returns a formatted title string for an update record,
        using the created_at date of the supplied attachment and application number.

        Returns:
            str: The formatted title string.
        """
        formatted_date = self.attachment_created_at.strftime("%d.%m.%Y")
        return self.format_title_string(
            formatted_date, self.application.application_number
        )


@dataclass
class AddRecordsRecordTitle(AhjoTitle):
    """
    A class for creating the title of an additional record sent after the initial open case request.

    Inherits from AhjoTitle. Uses the attachment's creation date and application number to format the title.
    The prefix is set to ", täydennys," by default.

    Attributes:
        prefix (str): A default string ", täydennys," that is used in the title of additional records.
        attachment_created_at (datetime): The created_at date of the attachment that is being updated to Ahjo.

    Methods:
        __str__(): Returns the formatted string representation of the additional record title.
    """

    prefix: str = field(default=", täydennys")
    attachment_created_at: datetime = None

    def __str__(self):
        """
        Returns a formatted title string for an additional record,
        using the application's creation date and application number.

        Returns:
            str: The formatted title string.
        """
        formatted_date = self.attachment_created_at.strftime("%d.%m.%Y")
        return self.format_title_string(
            formatted_date, self.application.application_number
        )


@dataclass
class AhjoBaseRecordTitle(AhjoTitle):
    """
    A class for creating the title of a basic attachment/record
    with a suffix indicating the current item and total items.

    Inherits from AhjoTitle.
    This class adds a suffix that indicates how many parts (e.g., "liite 1/5") are in the document.

    Attributes:
        current (int): The current item number in the list of records.
        total (int): The total number of items.

    Methods:
        set_suffix(): Updates the suffix to include the current and total numbers.
        __str__(): Returns the formatted string representation of the base record title.
    """

    current: int = 0
    total: int = 0

    def set_suffix(self):
        """
        Updates the suffix with the current and total items, forming a string like "liite 1/5".
        """
        self.suffix = f" liite {self.current}/{self.total},"

    def __str__(self):
        """
        Returns a formatted title string for a base record,
        using the application's modification date and application number.
        The suffix includes the current and total items.

        Returns:
            str: The formatted title string.
        """
        self.set_suffix()
        formatted_date = self.application.modified_at.strftime("%d.%m.%Y")
        return self.format_title_string(
            formatted_date, self.application.application_number
        )


def prepare_case_title(application: Application, company_name: str) -> str:
    """Prepare the case title for Ahjo"""
    full_title = f"Avustukset työnantajille, työllisyyspalvelut, \
Helsinki-lisä, {company_name}, \
hakemus {application.application_number}"
    return full_title


def prepare_final_case_title(application: Application, limit: int = 150) -> str:
    """Prepare the final case title for Ahjo, if the full title length is over the given limit, \
    truncate the company name to fit the limit."""
    full_case_title = prepare_case_title(application, application.company.name)
    length_of_full_title = len(full_case_title)

    if length_of_full_title <= limit:
        return full_case_title
    else:
        over_limit = length_of_full_title - limit
        truncated_company_name = truncate_string_to_limit(
            application.company.name, len(application.company.name) - over_limit
        )
        return prepare_case_title(application, truncated_company_name)


def truncate_string_to_limit(string_to_truncate: str, final_length: int) -> str:
    """Truncate the given string to the specified final length."""
    if len(string_to_truncate) > final_length:
        return string_to_truncate[:final_length]
    return string_to_truncate


def truncate_from_end_of_string(string_to_truncate: str, limit: int):
    """Truncate the given number of characters from the end of the string"""
    return string_to_truncate[-limit:]


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
    application: Application,
    case_records: List[dict],
    public_case_title: str,
    internal_case_title: str,
) -> dict:
    """Prepare the dictionary that is sent to Ahjo"""

    application_date = (
        application.submitted_at
        if hasattr(application, "submitted_at")
        else application.created_at
    )

    handler = application.calculation.handler
    case_dict = {
        "Title": public_case_title,
        "Acquired": application_date.isoformat("T", "seconds"),
        "ClassificationCode": "02 05 01 00",
        "ClassificationTitle": "Kunnan myöntämät avustukset",
        "Language": resolve_payload_language(application),
        "PublicityClass": "Julkinen",
        "InternalTitle": internal_case_title,
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
                "CorporateName": truncate_string_to_limit(
                    application.company.name, 100
                ),
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
        record_title=f"{OpenCaseRecordTitle(application)}",
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
            record_title=f"{AhjoBaseRecordTitle(application=application,  current=position, total=total_attachments)}",
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
    public_case_title = prepare_final_case_title(application=application, limit=512)
    internal_case_title = prepare_final_case_title(application=application, limit=150)

    payload = _prepare_top_level_dict(
        application=application,
        case_records=case_records,
        public_case_title=public_case_title,
        internal_case_title=internal_case_title,
    )
    return payload


def prepare_attachment_records_payload(
    attachments: List[Attachment],
    application: Application,
) -> dict[str, list[dict]]:
    """Prepare a payload for the new attachments of an application."""
    language = resolve_payload_language(application)

    attachment_list = []

    for attachment in attachments:
        title = AddRecordsRecordTitle(
            application=application, attachment_created_at=attachment.created_at
        )
        attachment_list.append(
            _prepare_record(
                record_title=f"{title}",
                record_type=AhjoRecordType.ATTACHMENT,
                acquired=attachment.created_at.isoformat("T", "seconds"),
                documents=[_prepare_record_document_dict(attachment)],
                handler=application.calculation.handler,
                language=language,
            )
        )

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
    title = UpdateRecordsRecordTitle(
        application=application, attachment_created_at=pdf_summary.created_at
    )
    return {
        "records": [
            _prepare_record(
                record_title=f"{title}",
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
    application: Application,
    decision_xml: Attachment,
    decision_text: AhjoDecisionText,
    secret_xml: Attachment,
) -> dict:
    """Prepare the payload that is sent to Ahjo when a decision proposal is created"""
    handler = application.calculation.handler

    decision_maker_dict = {
        "Role": "decisionMaker",
        "ID": decision_text.decision_maker_id,
    }

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
