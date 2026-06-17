from datetime import date

import pdfkit
from django.template import loader
from django.utils import translation


def get_context_for_summary_context(application):
    def count_version_number(number_of_versions):
        # Minimum version 1.0, increase by 0.1 for each version
        version = max(number_of_versions + 1, 10) / 10.0
        return str(version).replace(",", ".")

    def total_de_minimis_amount(application):
        de_minimis_amount = 0
        if application.de_minimis_aid_set.count():
            for aid in application.de_minimis_aid_set.all():
                de_minimis_amount = de_minimis_amount + float(aid.amount)
            return (
                "{:20,.2f}".format(de_minimis_amount)
                .replace(",", " ")
                .replace(".", ",")
            )
        return de_minimis_amount

    return {
        "application": application,
        "today": date.today(),
        "attachments": application.attachments.all(),
        "de_minimis_amount": total_de_minimis_amount(application),
        "de_minimis_aid_set": application.de_minimis_aid_set.all(),
        "versions": {
            "application": count_version_number(len(application.history.all()))
        },
    }


def generate_application_summary_file(application, request=None) -> bytes | None:
    def generate_summary_pdf(context) -> bytes:
        template = loader.get_template("application.html")
        rendered_template = template.render(context, request)
        return pdfkit.from_string(rendered_template, False, None)

    try:
        context = get_context_for_summary_context(application)
        return generate_summary_pdf(context)
    except Exception as e:
        print(  # noqa: T201
            f"Cannot generate application summary PDF for application {application.id}",
            e,
        )
        return None


def get_handler_context_for_summary(application):
    context = get_context_for_summary_context(application)
    batch = getattr(application, "batch", None)
    calculation = getattr(application, "calculation", None)
    context["batch"] = batch
    context["calculation"] = calculation
    context["calculation_rows"] = (
        calculation.rows.all().order_by("ordering") if calculation else []
    )
    context["benefit_total_row"] = (
        calculation.rows.filter(row_type="helsinki_benefit_total_eur").first()
        if calculation
        else None
    )
    context["instalments"] = (
        list(calculation.instalments.order_by("instalment_number"))
        if calculation
        else []
    )
    context["alterations"] = list(
        application.alteration_set.exclude(state="cancelled").order_by("created_at")
    )
    # Pages 1-4 always; page 5 (Laskelma) only when calculation exists
    context["total_pages"] = 5 if calculation else 4
    return context


def generate_handler_application_pdf(application, request=None) -> bytes | None:
    def generate_pdf(context) -> bytes:
        template = loader.get_template("application_handler.html")
        rendered_template = template.render(context, request)
        return pdfkit.from_string(rendered_template, False, None)

    try:
        context = get_handler_context_for_summary(application)
        with translation.override("fi"):
            return generate_pdf(context)
    except Exception as e:
        print(  # noqa: T201
            f"Cannot generate handler PDF for application {application.id}",
            e,
        )
        return None
