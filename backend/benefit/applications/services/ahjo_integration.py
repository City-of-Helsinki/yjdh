import logging
import os
import uuid
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from io import BytesIO
from typing import List, Optional, Tuple, Union

import jinja2
import pdfkit
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.db.models import QuerySet
from django.urls import reverse

from applications.enums import (
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationStatus,
    AttachmentType,
)
from applications.models import (
    AhjoDecisionText,
    AhjoSetting,
    AhjoStatus,
    Application,
    Attachment,
)
from applications.services.ahjo_authentication import AhjoConnector, AhjoToken
from applications.services.ahjo_client import (
    AhjoAddRecordsRequest,
    AhjoApiClient,
    AhjoDecisionDetailsRequest,
    AhjoDecisionMakerRequest,
    AhjoDecisionProposalRequest,
    AhjoDeleteCaseRequest,
    AhjoOpenCaseRequest,
    AhjoRequest,
    AhjoSubscribeDecisionRequest,
    AhjoUpdateRecordsRequest,
)
from applications.services.ahjo_payload import (
    prepare_attachment_records_payload,
    prepare_decision_proposal_payload,
    prepare_open_case_payload,
    prepare_update_application_payload,
)
from applications.services.ahjo_xml_builder import (
    AhjoPublicXMLBuilder,
    AhjoSecretXMLBuilder,
)
from applications.services.applications_csv_report import ApplicationsCsvService
from applications.services.generate_application_summary import (
    generate_application_summary_file,
)
from companies.models import Company


@dataclass
class ExportFileInfo:
    filename: str
    file_content: bytes
    html_content: str


PDF_PATH = os.path.join(os.path.dirname(__file__) + "/pdf_templates")
BENEFIT_TEMPLATE_FILENAME = "benefit_template.html"
TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID = "benefit_with_de_minimis_aid"
TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID = "benefit_without_de_minimis_aid"
TEMPLATE_ID_BENEFIT_DECLINED = "benefit_declined"
TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC = "composed_accepted_public"
TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC = "composed_declined_public"
TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE = "composed_accepted_private"
TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE = "composed_declined_private"

COMPOSED_ACCEPTED_TEMPLATE_IDS = [
    TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC,
    TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE,
]

COMPOSED_DECLINED_TEMPLATE_IDS = [
    TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC,
    TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE,
]


ACCEPTED_TITLE = "Työllisyydenhoidon Helsinki-lisän myöntäminen työnantajille"
REJECTED_TITLE = (
    "Työllisyydenhoidon Helsinki-lisä, kielteiset päätökset työnantajille"
)


JINJA_TEMPLATES_COMPOSED = {
    TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite 1 Helsinki-lisä hyväksytyt päätökset koontiliite julkinen.pdf",
        "context": {
            "title": ACCEPTED_TITLE,
            "show_ahjo_rows": True,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": False,
            "show_sums": True,
        },
    },
    TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite 1 Helsinki-lisä kielteiset päätökset koontiliite julkinen.pdf",
        "context": {
            "title": REJECTED_TITLE,
            "show_ahjo_rows": False,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": False,
            "show_sums": False,
        },
    },
    TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite 2 Helsinki-lisä hyväksytyt päätökset "
        "koontiliite salassa pidettävä.pdf",
        "context": {
            "title": ACCEPTED_TITLE,
            "show_ahjo_rows": True,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": True,
            "show_sums": True,
            "is_private": True,
        },
    },
    TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite 2 Helsinki-lisä kielteiset päätökset "
        "koontiliite salassa pidettävä.pdf",
        "context": {
            "title": REJECTED_TITLE,
            "show_ahjo_rows": False,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": True,
            "show_sums": False,
            "is_private": True,
        },
    },
}

JINJA_TEMPLATES_SINGLE = {
    TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite {attachment_number} [{company_name}] hakemukset (de minimis).pdf",
        "context": {
            "title": ACCEPTED_TITLE,
            "show_ahjo_rows": True,
            "show_de_minimis_aid_footer": True,
            "show_employee_names": True,
            "show_sums": True,
        },
    },
    TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite {attachment_number} [{company_name}] hakemukset.pdf",
        "context": {
            "title": ACCEPTED_TITLE,
            "show_ahjo_rows": True,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": True,
            "show_sums": True,
        },
    },
    TEMPLATE_ID_BENEFIT_DECLINED: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Liite {attachment_number} [{company_name}] Työllisyydenhoidon Helsinki-lisä, "
        "kielteiset päätökset.pdf",
        "context": {
            "title": REJECTED_TITLE,
            "show_ahjo_rows": False,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": True,
            "show_sums": False,
        },
    },
}
LOGGER = logging.getLogger(__name__)


def _get_template(path):
    template_loader = jinja2.FileSystemLoader(searchpath=PDF_PATH)
    env = jinja2.Environment(loader=template_loader, autoescape=True)
    return env.get_template(path)


def _get_granted_as_de_minimis_aid(app):
    if app.calculation:
        return app.calculation.granted_as_de_minimis_aid
    return False


def gather_accepted_files(accepted_apps, accepted_groups, attachment_number):
    accepted_files: List[ExportFileInfo] = []
    for app in accepted_apps:
        accepted_groups[app.company].append(app)
    for group, grouped_accepted_apps in accepted_groups.items():
        apps_pay_as_de_minimis = list(
            filter(
                lambda app: _get_granted_as_de_minimis_aid(app),
                grouped_accepted_apps,
            )
        )
        apps_pay_as_default = list(
            filter(
                lambda app: not _get_granted_as_de_minimis_aid(app),
                grouped_accepted_apps,
            )
        )

        if apps_pay_as_default:
            accepted_files.append(
                generate_single_approved_file(
                    group, apps_pay_as_default, attachment_number
                )
            )
            attachment_number += 1
        if apps_pay_as_de_minimis:
            accepted_files.append(
                generate_single_approved_file(
                    group, apps_pay_as_de_minimis, attachment_number
                )
            )
            attachment_number += 1
    return accepted_files, attachment_number


def gather_rejected_files(rejected_apps, rejected_groups, attachment_number):
    rejected_files: List[ExportFileInfo] = []
    for app in rejected_apps:
        rejected_groups[app.company].append(app)
    for group, grouped_rejected_apps in rejected_groups.items():
        rejected_files.append(
            generate_single_declined_file(
                group, grouped_rejected_apps, attachment_number
            )
        )
        attachment_number += 1
    return rejected_files, attachment_number


def prepare_pdf_files(apps: QuerySet[Application]) -> List[ExportFileInfo]:
    pdf_files: List[ExportFileInfo] = []

    # SINGLE COMPANY/ASSOCIATION PER DECISION PER FILE
    accepted_apps: List[Application] = [
        app for app in apps if app.status == ApplicationStatus.ACCEPTED
    ]
    rejected_apps: List[Application] = [
        app for app in apps if app.status == ApplicationStatus.REJECTED
    ]

    # COMPOSED FILES
    pdf_files += generate_composed_files(
        accepted_apps,
        rejected_apps,
        1,
    )

    # Start with three as Liite 1 and 2 is fixed for public/secret record
    attachment_number = 3

    if accepted_apps:
        app_files, attachment_number = gather_accepted_files(
            accepted_apps, defaultdict(list), attachment_number
        )
        pdf_files += app_files
    if rejected_apps:
        app_files, attachment_number = gather_rejected_files(
            rejected_apps, defaultdict(list), attachment_number
        )
        pdf_files += app_files

    return pdf_files


def prepare_csv_file(
    ordered_queryset: QuerySet[Application],
    prune_data_for_talpa: bool = False,
    export_filename: str = "",
) -> ExportFileInfo:
    csv_service = ApplicationsCsvService(ordered_queryset, prune_data_for_talpa)
    csv_file_content: bytes = csv_service.get_csv_string(prune_data_for_talpa).encode(
        "utf-8"
    )
    csv_filename = f"{export_filename}.csv"
    csv_file_info: ExportFileInfo = ExportFileInfo(
        filename=csv_filename,
        file_content=csv_file_content,
        html_content="",  # No HTML content
    )

    return csv_file_info


def generate_pdf(
    apps: List[Application],
    template_config: dict,
    attachment_number: int,
    company: Optional[Company] = None,
) -> ExportFileInfo:
    template = _get_template(template_config["path"])
    file_name: str = template_config["file_name"]

    if company:
        file_name = file_name.format(
            company_name=company.name, attachment_number=attachment_number
        )
    else:
        file_name = file_name.format(
            company_name="", attachment_number=attachment_number
        )
    html: str = template.render({**template_config["context"], "apps": apps})
    return ExportFileInfo(
        filename=file_name,
        file_content=pdfkit.from_string(html, False),
        html_content=html,
    )


def generate_single_declined_file(
    company: Company, apps: List[Application], attachment_number: int
) -> ExportFileInfo:
    return generate_pdf(
        apps=apps,
        template_config=JINJA_TEMPLATES_SINGLE[TEMPLATE_ID_BENEFIT_DECLINED],
        company=company,
        attachment_number=attachment_number,
    )


def generate_single_approved_file(
    company: Company, apps: List[Application], attachment_number: int
) -> ExportFileInfo:
    return generate_pdf(
        apps=apps,
        template_config=JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID
            if any(filter(_get_granted_as_de_minimis_aid, apps))
            else TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID
        ],
        company=company,
        attachment_number=attachment_number,
    )


def generate_composed_files(
    accepted_apps: List[Application],
    rejected_apps: List[Application],
    attachment_number: int,
) -> List[ExportFileInfo]:
    return [
        generate_pdf(
            apps=accepted_apps,
            template_config=JINJA_TEMPLATES_COMPOSED[template_id],
            company=None,
            attachment_number=attachment_number,
        )
        for template_id in COMPOSED_ACCEPTED_TEMPLATE_IDS
        if accepted_apps
    ] + [
        generate_pdf(
            apps=rejected_apps,
            template_config=JINJA_TEMPLATES_COMPOSED[template_id],
            company=None,
            attachment_number=attachment_number,
        )
        for template_id in COMPOSED_DECLINED_TEMPLATE_IDS
        if rejected_apps
    ]


def generate_zip(files: List[ExportFileInfo]) -> bytes:
    mem_zip = BytesIO()

    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.writestr(f.filename, f.file_content)

    return mem_zip.getvalue()


def export_application_batch(batch) -> bytes:
    apps = (
        batch.applications.select_related("company")
        .select_related("employee")
        .order_by("application_number")
        .all()
    )

    pdf_files: List[ExportFileInfo] = prepare_pdf_files(apps)
    return generate_zip(pdf_files)


# Constants
PDF_CONTENT_TYPE = "application/pdf"


def generate_application_attachment(
    application: Application, type: AttachmentType, decision: AhjoDecisionText = None
) -> Attachment:
    """Generate and save an Attachment of the requested type for the given application"""
    if type == AttachmentType.PDF_SUMMARY:
        attachment_data = generate_application_summary_file(application)
        attachment_filename = (
            f"application_summary_{application.application_number}.pdf"
        )
        content_type = PDF_CONTENT_TYPE
    elif type == AttachmentType.DECISION_TEXT_XML:
        xml_builder = AhjoPublicXMLBuilder(application, decision)
        xml_string = xml_builder.generate_xml()

        attachment_data = xml_string.encode("utf-8")
        attachment_filename = xml_builder.generate_xml_file_name()
        content_type = xml_builder.content_type
    elif type == AttachmentType.DECISION_TEXT_SECRET_XML:
        xml_builder = AhjoSecretXMLBuilder(application)
        xml_string = xml_builder.generate_xml()

        attachment_data = xml_string.encode("utf-8")
        attachment_filename = xml_builder.generate_xml_file_name()
        content_type = xml_builder.content_type
    else:
        raise ValueError(f"Invalid attachment type {type}")

    attachment_file = ContentFile(attachment_data, attachment_filename)
    if type == AttachmentType.PDF_SUMMARY:
        # As there should only exist one pdf summary, update or create the attachment if it is one
        attachment, _ = Attachment.objects.update_or_create(
            application=application,
            attachment_type=type,
            defaults={"attachment_file": attachment_file, "content_type": content_type},
        )
    else:
        attachment = Attachment.objects.create(
            application=application,
            attachment_file=attachment_file,
            content_type=content_type,
            attachment_type=type,
        )
    return attachment


def get_token() -> Union[AhjoToken, None]:
    """Get the access token from Ahjo Service."""
    connector = AhjoConnector()

    if not connector.is_configured():
        raise ImproperlyConfigured("AHJO connector is not configured")
    return connector.get_token_from_db()


def get_application_for_ahjo(id: uuid.UUID) -> Optional[Application]:
    """Get the application with calculation, company and employee."""
    application = Application.objects.select_related(
        "calculation", "company", "employee"
    ).get(pk=id)
    if not application:
        raise ObjectDoesNotExist("No applications found for Ahjo request.")
    # Check that the handler has an ad_username set, if not, ImproperlyConfigured
    if not application.calculation.handler.ad_username:
        raise ImproperlyConfigured(
            "No ad_username set for the handler for Ahjo request."
        )
    return application


def create_status_for_application(application: Application, status: AhjoStatusEnum):
    """Create a new AhjoStatus for the application."""
    AhjoStatus.objects.create(application=application, status=status)


def send_open_case_request_to_ahjo(
    application: Application, ahjo_token: AhjoToken
) -> Union[Tuple[Application, str], Tuple[None, None]]:
    """Open a case in Ahjo."""

    ahjo_request = AhjoOpenCaseRequest(application)
    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)

    pdf_summary = generate_application_attachment(
        application, AttachmentType.PDF_SUMMARY
    )
    data = prepare_open_case_payload(application, pdf_summary)

    result, response_text = ahjo_client.send_request_to_ahjo(data)
    return result, response_text


def delete_application_in_ahjo(
    application: Application, ahjo_token: AhjoToken
) -> Union[Tuple[Application, str], None]:
    """Delete/cancel an application in Ahjo."""

    ahjo_request = AhjoDeleteCaseRequest(application)
    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)

    result, response_text = ahjo_client.send_request_to_ahjo(None)

    return result, response_text


def update_application_summary_record_in_ahjo(
    application: Application, ahjo_token: AhjoToken
) -> Union[Tuple[Application, str], None]:
    """Update the application summary pdf in Ahjo.
    Should be done about the same time proposal is sent.
    """
    ahjo_request = AhjoUpdateRecordsRequest(application)
    if application.ahjo_status.latest().error_from_ahjo:
        # If there are errors from Ahjo, do not send the update request
        raise ValueError(
            f"Application {application.id} has errors \
in Ahjo status {application.ahjo_status.latest().status}, not sending {ahjo_request}."
        )

    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)

    pdf_summary = generate_application_attachment(
        application, AttachmentType.PDF_SUMMARY
    )
    data = prepare_update_application_payload(pdf_summary, application)

    result, response_text = ahjo_client.send_request_to_ahjo(data)

    return result, response_text


def send_new_attachment_records_to_ahjo(
    application: Application,
    ahjo_token: AhjoToken,
) -> Union[Tuple[Application, str], None]:
    """Send any new attachments, that have been added after opening a case, to Ahjo."""

    # TODO add a check for application status,
    # so that only applications in the correct status have their attachments sent
    ahjo_request = AhjoAddRecordsRequest(application)
    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)

    attachments = application.attachments.all()

    data = prepare_attachment_records_payload(attachments, application)

    result, response_text = ahjo_client.send_request_to_ahjo(data)

    return result, response_text


def send_decision_proposal_to_ahjo(
    application: Application, ahjo_token: AhjoToken
) -> Union[Tuple[Application, str], None]:
    """Send a decision proposal and it's XML attachments to Ahjo."""

    ahjo_request = AhjoDecisionProposalRequest(application=application)
    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)
    decision = AhjoDecisionText.objects.get(application=application)

    delete_existing_xml_attachments(application)

    decision_xml = generate_application_attachment(
        application, AttachmentType.DECISION_TEXT_XML, decision
    )
    secret_xml = generate_application_attachment(
        application, AttachmentType.DECISION_TEXT_SECRET_XML
    )

    data = prepare_decision_proposal_payload(
        application=application,
        decision_xml=decision_xml,
        decision_text=decision,
        secret_xml=secret_xml,
    )
    response, response_text = ahjo_client.send_request_to_ahjo(data)
    return response, response_text


def delete_existing_xml_attachments(application: Application):
    """Delete any existing decision text attachments from the application."""
    # TODO delete files from disk also
    Attachment.objects.filter(
        application=application,
        attachment_type__in=[
            AttachmentType.DECISION_TEXT_XML,
            AttachmentType.DECISION_TEXT_SECRET_XML,
        ],
    ).delete()
    LOGGER.info(
        f"Deleted existing decision text attachments for application {application.id}"
    )


def send_subscription_request_to_ahjo(
    ahjo_auth_token: AhjoToken,
) -> Union[Tuple[None, str], None]:
    """Send a subscription request to Ahjo."""
    try:
        ahjo_request = AhjoSubscribeDecisionRequest()
        ahjo_client = AhjoApiClient(ahjo_auth_token, ahjo_request)
        url = reverse("ahjo_decision_callback_url")
        data = {"callbackUrl": f"{settings.API_BASE_URL}{url}"}
        return ahjo_client.send_request_to_ahjo(data)
    except ObjectDoesNotExist as e:
        LOGGER.error(f"Object not found: {e}")
    except ImproperlyConfigured as e:
        LOGGER.error(f"Improperly configured: {e}")


def get_decision_details_from_ahjo(
    application: Application, ahjo_token: AhjoToken
) -> Union[List, None]:
    ahjo_request = AhjoDecisionDetailsRequest(application)
    ahjo_client = AhjoApiClient(ahjo_token, ahjo_request)
    return ahjo_client.send_request_to_ahjo()


class AhjoRequestHandler:
    def __init__(self, ahjo_token: AhjoToken, ahjo_request_type: AhjoRequest):
        self.ahjo_token = ahjo_token
        self.ahjo_request_type = ahjo_request_type

    def handle_request_without_application(self):
        if self.ahjo_request_type == AhjoRequestType.GET_DECISION_MAKER:
            self.get_decision_maker_from_ahjo()
        else:
            raise ValueError("Invalid request type")

    def get_decision_maker_from_ahjo(self) -> Union[List, None]:
        ahjo_client = AhjoApiClient(self.ahjo_token, AhjoDecisionMakerRequest())
        result = ahjo_client.send_request_to_ahjo()
        AhjoResponseHandler.handle_decisionmaker_response(result)


class AhjoResponseHandler:
    @staticmethod
    def handle_decisionmaker_response(response: tuple[None, dict]) -> None:
        filtered_data = AhjoResponseHandler.filter_decision_makers(response[1])
        if filtered_data:
            AhjoSetting.objects.update_or_create(
                name="ahjo_decision_maker", defaults={"data": filtered_data}
            )

    @staticmethod
    def filter_decision_makers(data: dict) -> List[dict]:
        """Filter the decision makers Name and ID from the Ahjo response."""
        result = []
        for item in data["decisionMakers"]:
            organization = item.get("Organization")
            if organization and organization.get("IsDecisionMaker"):
                result.append(
                    {"Name": organization.get("Name"), "ID": organization.get("ID")}
                )
        return result
