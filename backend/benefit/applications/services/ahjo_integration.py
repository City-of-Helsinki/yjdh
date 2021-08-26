import os
import zipfile
from io import BytesIO

import jinja2
import pdfkit
from applications.enums import ApplicationStatus, OrganizationType
from django.utils import timezone

PDF_PATH = os.path.join(os.path.dirname(__file__) + "/pdf_templates")
TEMPLATE_ID_ASSOCIATION = "associations"
TEMPLATE_ID_COMPANIES_BENEFIT_WITH_DE_MINIMIS_AID = (
    "companies_benefit_with_de_minimis_aid"
)
TEMPLATE_ID_COMPANIES_BENEFIT_WITHOUT_DE_MINIMIS_AID = (
    "companies_benefit_without_de_minimis_aid"
)
TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC = "composed_accepted_public"
TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE = "composed_accepted_private"
TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC = "composed_declined_public"
TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE = "composed_declined_private"

JINJA_TEMPLATES_COMPOSED = {
    TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC: {
        "path": "composed_accepted_public.html",
        "file_name": "Liite 1 Helsinki-lisä 2021 koontiliite yhteisöille "
        "mallipohja julkinen.pdf",
    },
    TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE: {
        "path": "composed_accepted_private.html",
        "file_name": "Helsinki-lisä 2021 koontiliite yhteisöille mallipohja "
        "salassa pidettävä.pdf",
    },
    TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC: {
        "path": "composed_declined_public.html",
        "file_name": "Helsinki-lisä 2021 kielteiset päätökset hakijakohtainen "
        "mallipohja {start_number}-{end_number} salassa "
        "pidettävä.pdf",
    },
    TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE: {
        "path": "composed_declined_private.html",
        "file_name": "Helsinki-lisä 2021 kielteiset päätökset koontiliite "
        "yrityksille {start_number}-{end_number} mallipohja salassa "
        "pidettävä.pdf",
    },
}

JINJA_TEMPLATES_SINGLE = {
    TEMPLATE_ID_ASSOCIATION: {
        "path": "associations.html",
        "file_name": "Liite 2 hakijakohtainen mallipohja yhteisöt {app_number}.pdf",
    },
    TEMPLATE_ID_COMPANIES_BENEFIT_WITH_DE_MINIMIS_AID: {
        "path": "companies_benefit_with_de_minimis_aid.html",
        "file_name": "Liite 2 hakijakohtainen mallipohja de minimis "
        "yritykset {app_number}.pdf",
    },
    TEMPLATE_ID_COMPANIES_BENEFIT_WITHOUT_DE_MINIMIS_AID: {
        "path": "companies_benefit_without_de_minimis_aid.html",
        "file_name": "Liite 3 hakijakohtainen mallipohja ei de "
        "minimis yritykset {app_number}.pdf",
    },
}


def _get_template(path):
    template_loader = jinja2.FileSystemLoader(searchpath=PDF_PATH)
    env = jinja2.Environment(loader=template_loader, autoescape=True)
    return env.get_template(path)


def prepare_pdf_files(apps):
    pdf_files = []
    # SINGLE FILE PER APP
    for app in apps:
        pdf_files.append(generate_single_file(app))

    # COMPOSED FILES
    pdf_files += generate_composed_files(apps)

    return pdf_files


def generate_single_file(app):
    # Association
    if (
        OrganizationType.resolve_organization_type(app.company.company_form)
        == OrganizationType.ASSOCIATION
    ):
        template_config = JINJA_TEMPLATES_SINGLE[TEMPLATE_ID_ASSOCIATION]
        file_name = template_config["file_name"].format(
            app_number=app.ahjo_application_number
        )
        temp = _get_template(template_config["path"])
        html = temp.render(app=app, year=timezone.now().year)
    # Company application
    elif app.de_minimis_aid:
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_COMPANIES_BENEFIT_WITH_DE_MINIMIS_AID
        ]
        file_name = template_config["file_name"].format(
            app_number=app.ahjo_application_number
        )
        temp = _get_template(template_config["path"])
        html = temp.render(app=app, year=timezone.now().year)
    # Company application without de minimis aid
    else:
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_COMPANIES_BENEFIT_WITHOUT_DE_MINIMIS_AID
        ]
        file_name = template_config["file_name"].format(
            app_number=app.ahjo_application_number
        )
        temp = _get_template(template_config["path"])
        html = temp.render(app=app, year=timezone.now().year)
    single_pdf = pdfkit.from_string(html, False)
    return file_name, single_pdf, html


def generate_composed_files(apps):
    files = []
    # Accepted applications
    accepted_apps = [app for app in apps if app.status == ApplicationStatus.ACCEPTED]
    if len(accepted_apps):
        start_number = accepted_apps[0].application_number
        end_number = accepted_apps[-1].application_number

        template_config = JINJA_TEMPLATES_COMPOSED[TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC]
        public_accepted_template = _get_template(template_config["path"])
        file_name = template_config["file_name"].format(
            start_number=start_number, end_number=end_number
        )
        html = public_accepted_template.render(
            apps=accepted_apps,
            year=timezone.now().year,
            start_number=start_number,
            end_number=end_number,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE
        ]
        private_accepted_template = _get_template(template_config["path"])
        file_name = template_config["file_name"].format(
            start_number=start_number, end_number=end_number
        )
        html = private_accepted_template.render(
            apps=accepted_apps,
            year=timezone.now().year,
            start_number=start_number,
            end_number=end_number,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

    # Rejected applications
    rejected_apps = [app for app in apps if app.status == ApplicationStatus.REJECTED]
    if len(rejected_apps):
        start_number = rejected_apps[0].application_number
        end_number = rejected_apps[-1].application_number

        template_config = JINJA_TEMPLATES_COMPOSED[TEMPLATE_ID_COMPOSED_DECLINED_PUBLIC]
        public_declined_template = _get_template(template_config["path"])
        file_name = template_config["file_name"].format(
            start_number=start_number, end_number=end_number
        )
        html = public_declined_template.render(
            apps=rejected_apps,
            year=timezone.now().year,
            start_number=start_number,
            end_number=end_number,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE
        ]
        private_declined_template = _get_template(template_config["path"])
        file_name = template_config["file_name"].format(
            start_number=start_number, end_number=end_number
        )
        html = private_declined_template.render(
            apps=rejected_apps,
            year=timezone.now().year,
            start_number=start_number,
            end_number=end_number,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))
    return files


def generate_zip(files):
    mem_zip = BytesIO()

    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.writestr(f[0], f[1])

    return mem_zip.getvalue()


def export_application_batch(batch):
    pdf_files = prepare_pdf_files(
        batch.applications.select_related("company")
        .select_related("employee")
        .order_by("application_number")
        .all()
    )
    return generate_zip(pdf_files)
