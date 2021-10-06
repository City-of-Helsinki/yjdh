import os
import zipfile
from io import BytesIO

import jinja2
import pdfkit
from applications.enums import ApplicationStatus, OrganizationType
from django.utils import timezone

PDF_PATH = os.path.join(os.path.dirname(__file__) + "/pdf_templates")
TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID = "benefit_with_de_minimis_aid"
TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID = "benefit_without_de_minimis_aid"
TEMPLATE_ID_BENEFIT_DECLINED = "benefit_declined"
TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC = "composed_accepted_public"
TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE = "composed_accepted_private"
TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE = "composed_declined_private"

JINJA_TEMPLATES_COMPOSED = {
    TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC: {
        "path": "composed_accepted_public.html",
        "file_name": "Liite 1 Helsinki-lisä 2021 koontiliite yhteisöille "
        "julkinen.pdf",
    },
    TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE: {
        "path": "composed_accepted_private.html",
        "file_name": "Helsinki-lisä 2021 koontiliite yhteisöille "
        "salassa pidettävä.pdf",
    },
    TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE: {
        "path": "benefit_declined.html",  # Composed decline template reuse single company decline template
        "file_name": "Helsinki-lisä 2021 kielteiset päätökset koontiliite "
        "yrityksille salassa pidettävä.pdf",
    },
}

JINJA_TEMPLATES_SINGLE = {
    TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID: {
        "path": "benefit_with_de_minimis_aid.html",
        "file_name": "[{company_name}] Liite 2 hakijakohtainen de minimis "
        "yritykset.pdf",
    },
    TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID: {
        "path": "benefit_without_de_minimis_aid.html",
        "file_name": "[{company_name}] Liite 3 hakijakohtainen ei de"
        "minimis yritykset.pdf",
    },
    TEMPLATE_ID_BENEFIT_DECLINED: {
        "path": "benefit_declined.html",
        "file_name": "[{company_name}] Työllisyydenhoidon Helsinki-lisä, kielteiset päätökset yrityksille.pdf",
    },
}


def _get_template(path):
    template_loader = jinja2.FileSystemLoader(searchpath=PDF_PATH)
    env = jinja2.Environment(loader=template_loader, autoescape=True)
    return env.get_template(path)


def prepare_pdf_files(apps):
    pdf_files = []
    # SINGLE COMPANY/ASSOCIATION PER DECISION PER FILE
    accepted_apps = [app for app in apps if app.status == ApplicationStatus.ACCEPTED]
    rejected_apps = [app for app in apps if app.status == ApplicationStatus.REJECTED]
    accepted_groups = {}
    for app in accepted_apps:
        accepted_groups.setdefault(app.company, []).append(app)
    for group, grouped_accepted_apps in accepted_groups.items():
        pdf_files.append(generate_single_approved_file(group, grouped_accepted_apps))

    declined_groups = {}
    for app in rejected_apps:
        declined_groups.setdefault(app.company, []).append(app)
    for group, grouped_rejected_apps in declined_groups.items():
        pdf_files.append(generate_single_declined_file(group, grouped_rejected_apps))

    # COMPOSED FILES
    pdf_files += generate_composed_files(accepted_apps, rejected_apps)

    return pdf_files


def generate_single_declined_file(company, apps):
    template_config = JINJA_TEMPLATES_SINGLE[TEMPLATE_ID_BENEFIT_DECLINED]
    file_name = template_config["file_name"].format(company_name=company.name)
    temp = _get_template(template_config["path"])
    html = temp.render(apps=apps)
    single_pdf = pdfkit.from_string(html, False)
    return file_name, single_pdf, html


def generate_single_approved_file(company, apps):
    # FIXME: Need to change the logic later when we have multiple benefit per application
    # Association without business activity
    if (
        OrganizationType.resolve_organization_type(company.company_form)
        == OrganizationType.ASSOCIATION
        and not apps[0].association_has_business_activities
    ):
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_BENEFIT_WITHOUT_DE_MINIMIS_AID
        ]
        file_name = template_config["file_name"].format(company_name=company.name)
        temp = _get_template(template_config["path"])
        html = temp.render(apps=apps)
    # Company and Association with business activity
    else:
        template_config = JINJA_TEMPLATES_SINGLE[
            TEMPLATE_ID_BENEFIT_WITH_DE_MINIMIS_AID
        ]
        file_name = template_config["file_name"].format(company_name=company.name)
        temp = _get_template(template_config["path"])
        html = temp.render(apps=apps)
    single_pdf = pdfkit.from_string(html, False)
    return file_name, single_pdf, html


def generate_composed_files(accepted_apps=[], rejected_apps=[]):
    files = []
    # Accepted applications
    if len(accepted_apps):
        template_config = JINJA_TEMPLATES_COMPOSED[TEMPLATE_ID_COMPOSED_ACCEPTED_PUBLIC]
        public_accepted_template = _get_template(template_config["path"])
        file_name = template_config["file_name"]
        html = public_accepted_template.render(
            apps=accepted_apps,
            year=timezone.now().year,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_ACCEPTED_PRIVATE
        ]
        private_accepted_template = _get_template(template_config["path"])
        file_name = template_config["file_name"]
        html = private_accepted_template.render(
            apps=accepted_apps,
            year=timezone.now().year,
        )
        files.append((file_name, pdfkit.from_string(html, False), html))

    # Rejected applications
    if len(rejected_apps):
        template_config = JINJA_TEMPLATES_COMPOSED[
            TEMPLATE_ID_COMPOSED_DECLINED_PRIVATE
        ]
        private_declined_template = _get_template(template_config["path"])
        file_name = template_config["file_name"]
        html = private_declined_template.render(
            apps=rejected_apps,
            year=timezone.now().year,
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
