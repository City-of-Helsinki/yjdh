import logging
import os
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from io import BytesIO
from typing import List, Optional

import jinja2
import pdfkit
import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import QuerySet

from applications.enums import ApplicationStatus
from applications.models import AhjoSetting, Application
from applications.services.ahjo_authentication import AhjoConnector
from applications.services.applications_csv_report import ApplicationsCsvService
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


def dummy_ahjo_request():
    """Dummy function for preliminary testing of Ahjo integration"""
    ahjo_api_url = settings.AHJO_REST_API_URL
    try:
        ahjo_auth_code = AhjoSetting.objects.get(name="ahjo_code").data
        LOGGER.info(f"Retrieved auth code: {ahjo_auth_code}")
    except ObjectDoesNotExist:
        LOGGER.error(
            "Error: Ahjo auth code not found in database. Please set the 'ahjo_code' setting."
        )
        return

    connector = AhjoConnector(requests)

    if not connector.is_configured():
        LOGGER.warning("AHJO connector is not configured")
        return
    try:
        ahjo_token = connector.get_access_token(ahjo_auth_code["code"])
    except Exception as e:
        LOGGER.warning(f"Error retrieving access token: {e}")
        return
    headers = {
        "Authorization": f"Bearer {ahjo_token.access_token}",
    }
    print(headers)
    try:
        response = requests.get(
            f"{ahjo_api_url}/cases", headers=headers, timeout=connector.timout
        )
        response.raise_for_status()
        print(response.json())
    except requests.exceptions.HTTPError as e:
        # Handle the HTTP error
        LOGGER.error(f"HTTP error occurred: {e}")
    except requests.exceptions.RequestException as e:
        # Handle the network error
        LOGGER.errror(f"Network error occurred: {e}")
    except Exception as e:
        # Handle any other error
        LOGGER.error(f"Error occurred: {e}")
