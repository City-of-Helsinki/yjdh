import logging
import os
import zipfile
from collections import defaultdict
from io import BytesIO
from typing import List, Tuple

import jinja2
import pdfkit
from django.db.models import QuerySet
from django.utils import timezone

from applications.enums import ApplicationStatus, OrganizationType
from applications.models import Application
from companies.models import Company

PDF_PATH = os.path.join(os.path.dirname(__file__) + "/pdf_templates")
BENEFIT_TEMPLATE_FILENAME = "benefit_template.html"
TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID = "benefit_with_de_minimis_aid"
TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID = "benefit_without_de_minimis_aid"
TEMPLATE_ID_BENEFIT_DECLINED = "benefit_declined"
TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC = "composed_accepted_public"
TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC = "composed_declined_public"
TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE = "composed_accepted_private"
TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE = "composed_declined_private"

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
            "title": "Työllisyydenhoidon Helsinki-lisä työnantajille",
            "show_ahjo_rows": False,
            "show_de_minimis_aid_footer": False,
            "show_employee_names": False,
            "show_sums": False,
        },
    },
    TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE: {
        "path": BENEFIT_TEMPLATE_FILENAME,
        "file_name": "Helsinki-lisä hyväksytyt päätökset koontiliite salassa pidettävä.pdf",
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
        "file_name": "Helsinki-lisä kielteiset päätökset koontiliite salassa pidettävä.pdf",
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
        "file_name": "[{company_name}] Liite 2 hakijakohtainen de minimis "
        "yritykset.pdf",
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
        "file_name": "[{company_name}] Liite 3 hakijakohtainen ei de"
        "minimis yritykset.pdf",
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
        "file_name": "[{company_name}] Työllisyydenhoidon Helsinki-lisä, kielteiset päätökset yrityksille.pdf",
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


def prepare_pdf_files(apps: QuerySet[Application]) -> List[Tuple[str, bytes, str]]:
    pdf_files: List[Tuple[str, bytes, str]] = []
    # SINGLE COMPANY/ASSOCIATION PER DECISION PER FILE
    accepted_apps: List[Application] = [
        app for app in apps if app.status == ApplicationStatus.ACCEPTED
    ]
    rejected_apps: List[Application] = [
        app for app in apps if app.status == ApplicationStatus.REJECTED
    ]
    accepted_groups = defaultdict(list)
    for app in accepted_apps:
        accepted_groups[app.company].append(app)
    for group, grouped_accepted_apps in accepted_groups.items():
        pdf_files.append(generate_single_approved_file(group, grouped_accepted_apps))

    declined_groups = defaultdict(list)
    for app in rejected_apps:
        declined_groups[app.company].append(app)
    for group, grouped_rejected_apps in declined_groups.items():
        pdf_files.append(generate_single_declined_file(group, grouped_rejected_apps))

    # COMPOSED FILES
    pdf_files += generate_composed_files(accepted_apps, rejected_apps)

    return pdf_files


def generate_single_declined_file(
    company: Company, apps: List[Application]
) -> Tuple[str, bytes, str]:
    template_config = JINJA_TEMPLATES_SINGLE[TEMPLATE_ID_BENEFIT_DECLINED]
    file_name: str = template_config["file_name"].format(company_name=company.name)
    temp = _get_template(template_config["path"])
    html: str = temp.render(
        {
            **template_config["context"],
            "apps": apps,
        }
    )
    single_pdf: bytes = pdfkit.from_string(html, False)
    return file_name, single_pdf, html


def generate_single_approved_file(
    company: Company, apps: List[Application]
) -> Tuple[str, bytes, str]:
    # FIXME: Need to change the logic later when we have multiple benefit per application
    # Association without business activity
    if (
        OrganizationType.resolve_organization_type(company.company_form_code)
        == OrganizationType.ASSOCIATION
        and not apps[0].association_has_business_activities
    ):
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID
        ]
        file_name: str = template_config["file_name"].format(company_name=company.name)
        temp = _get_template(template_config["path"])
        html: str = temp.render(
            {
                **template_config["context"],
                "apps": apps,
            }
        )
    # Company and Association with business activity
    else:
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID
        ]
        file_name: str = template_config["file_name"].format(company_name=company.name)
        temp = _get_template(template_config["path"])
        html: str = temp.render(
            {
                **template_config["context"],
                "apps": apps,
            }
        )
    single_pdf: bytes = pdfkit.from_string(html, False)
    return file_name, single_pdf, html


def generate_composed_files(
    accepted_apps: List[Application] = [], rejected_apps: List[Application] = []
) -> List[Tuple[str, bytes, str]]:
    files: List[Tuple[str, bytes, str]] = []
    # Accepted applications
    if len(accepted_apps):
        template_config = JINJA_TEMPLATES_COMPOSED[TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC]
        public_accepted_template = _get_template(template_config["path"])
        file_name: str = template_config["file_name"]
        html: str = public_accepted_template.render(
            {
                **template_config["context"],
                "apps": accepted_apps,
                "year": timezone.now().year,
            }
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE
        ]
        private_accepted_template = _get_template(template_config["path"])
        file_name: str = template_config["file_name"]
        html: str = private_accepted_template.render(
            {
                **template_config["context"],
                "apps": accepted_apps,
                "year": timezone.now().year,
            }
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

    # Rejected applications
    if len(rejected_apps):

        template_config = JINJA_TEMPLATES_COMPOSED[TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC]
        public_declined_template = _get_template(template_config["path"])
        file_name: str = template_config["file_name"]
        html: str = public_declined_template.render(
            {
                **template_config["context"],
                "apps": rejected_apps,
                "year": timezone.now().year,
            }
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE
        ]
        private_declined_template = _get_template(template_config["path"])
        file_name: str = template_config["file_name"]
        html: str = private_declined_template.render(
            {
                **template_config["context"],
                "apps": rejected_apps,
                "year": timezone.now().year,
            }
        )
        files.append((file_name, pdfkit.from_string(html, False), html))
    return files


def generate_zip(files: List[Tuple[str, bytes, str]]) -> bytes:
    mem_zip = BytesIO()

    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.writestr(f[0], f[1])

    return mem_zip.getvalue()


def export_application_batch(batch) -> bytes:
    pdf_files: List[Tuple[str, bytes, str]] = prepare_pdf_files(
        batch.applications.select_related("company")
        .select_related("employee")
        .order_by("application_number")
        .all()
    )
    return generate_zip(pdf_files)
