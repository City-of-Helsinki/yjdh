import io

from django.db.models import QuerySet
from django.shortcuts import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from xlsxwriter import Workbook

from applications.models import SummerVoucher
from common.utils import getattr_nested

FIELDS = (
    # Field title, field value, field names in summer voucher model, column width
    (_("Järjestys"), "", [], 15, "white"),
    (_("Saatu pvm"), "%s", ["submitted_at"], 15, "white"),
    (_("Hakemuksen kieli"), "%s", ["application__language"], 15, "white"),
    (_("Setelin numero"), "%s", ["summer_voucher_serial_number"], 30, "white"),
    (
        _("Erikoistapaus (esim yhdeksäsluokkalainen)"),
        "%s",
        ["summer_voucher_exception_reason"],
        30,
        "white",
    ),
    ("", "", [], 5, "#7F7F7F"),
    (_("Nuoren nimi"), "%s", ["employee_name"], 30, "#DCEDF8"),
    (_("Henkilötunnus"), "%s", ["employee_ssn"], 30, "#DCEDF8"),
    (_("Koulu"), "%s", ["employee_school"], 30, "#DCEDF8"),
    (_("Kotipostinumero"), "%s", ["employee_postcode"], 15, "#DCEDF8"),
    (_("Puhelin"), "%s", ["employee_phone_number"], 30, "#DCEDF8"),
    (_("Kotikaupunki"), "%s", ["employee_home_city"], 30, "#DCEDF8"),
    ("", "", [], 5, "#7F7F7F"),
    (
        _("Työnantaja muoto"),
        "%s",
        ["application__company__company_form"],
        15,
        "#E7E3F9",
    ),
    (_("Työnantaja"), "%s", ["application__company__name"], 30, "#E7E3F9"),
    (_("Y-tunnus"), "%s", ["application__company__business_id"], 15, "#E7E3F9"),
    (
        _("Työnantajan lähiosoite"),
        "%s",
        ["application__company__street_address"],
        30,
        "#E7E3F9",
    ),
    (
        _("Työnantajan postinumero"),
        "%s",
        ["application__company__postcode"],
        15,
        "#E7E3F9",
    ),
    (_("Työnantajan kunta"), "%s", ["application__company__city"], 15, "#E7E3F9"),
    (_("Yhdyshenkilö"), "%s", ["application__contact_person_name"], 30, "#E7E3F9"),
    (
        _("Yhdyshenkilön sähköposti"),
        "%s",
        ["application__contact_person_email"],
        30,
        "#E7E3F9",
    ),
    (
        _("Yhdyshenkilön Puhelin"),
        "%s",
        ["application__contact_person_phone_number"],
        30,
        "#E7E3F9",
    ),
    (
        _("Erillinen laskuttaja"),
        "%s",
        ["application__is_separate_invoicer"],
        30,
        "#E7E3F9",
    ),
    (_("Laskuttajan nimi"), "%s", ["application__invoicer_name"], 30, "#E7E3F9"),
    (
        _("Laskuttajan sähköposti"),
        "%s",
        ["application__invoicer_email"],
        30,
        "#E7E3F9",
    ),
    (
        _("Laskuttajan Puhelin"),
        "%s",
        ["application__invoicer_phone_number"],
        30,
        "#E7E3F9",
    ),
    (_("Yrityksen toimiala"), "%s", ["application__company__industry"], 30, "#E7E3F9"),
    ("", "", [], 5, "#7F7F7F"),
    (
        _("Työn suorituspaikan postinumero"),
        "%s",
        ["employment_postcode"],
        15,
        "#F7DAE3",
    ),
    (
        _("Työsuhteen aloituspäivämäärä"),
        "%s",
        ["employment_start_date"],
        30,
        "#F7DAE3",
    ),
    (
        _("Työsuhteen päättymispäivämäärä"),
        "%s",
        ["employment_end_date"],
        30,
        "#F7DAE3",
    ),
    (_("Työtunnit"), "%s", ["employment_work_hours"], 15, "#F7DAE3"),
    (_("Maksettu palkka"), "%s", ["employment_salary_paid"], 15, "#F7DAE3"),
    (_("Muut edut"), "%s", [""], 15, "#F7DAE3"),
    (_("Raporttiin luokittelu"), "%s", [""], 15, "#F7DAE3"),
    (_("Työtehtävät"), "%s", ["employment_description"], 30, "#F7DAE3"),
    (
        _("Olisitko palkannut?"),
        "%s",
        ["hired_without_voucher_assessment"],
        15,
        "#F7DAE3",
    ),
    (_("Työnantajan kokemus"), "%s", [""], 30, "#F7DAE3"),
    (_("Muuta"), "%s", [""], 30, "#F7DAE3"),
    (_("Liite: Työsopimus 1"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Työsopimus 2"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Työsopimus 3"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Työsopimus 4"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Työsopimus 5"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Palkkalaskelma 1"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Palkkalaskelma 2"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Palkkalaskelma 3"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Palkkalaskelma 4"), "%s", ["attachments"], 120, "#F7DAE3"),
    (_("Liite: Palkkalaskelma 5"), "%s", ["attachments"], 120, "#F7DAE3"),
)


def get_xlsx_filename() -> str:
    """
    Get the name of the excel file. Example filename:
    kesasetelihakemukset_2021-01-01_23-59-59.xlsx
    """
    local_datetime_now_as_str = timezone.localtime(timezone.now()).strftime(
        "%Y-%m-%d_%H-%M-%S"
    )
    filename = f"kesasetelihakemukset_{local_datetime_now_as_str}.xlsx"
    return filename


def set_header_and_formatting(wb, ws, column, field, header_format):
    ws.write(0, column, str(_(field[0])), header_format)

    cell_format = wb.add_format()
    cell_format.set_border(1)
    cell_format.set_bg_color(field[4])
    ws.set_column(column, column, field[3], cell_format)


def get_attachment_uri(summer_voucher: SummerVoucher, field: tuple, value, request):
    field_name = field[0]
    attachment_number = int(field_name.split(" ")[-1])
    attachment_type = field_name.split(" ")[1]

    if attachment_type == "Työsopimus":
        attachment_type = "employment_contract"
    elif attachment_type == "Palkkalaskelma":
        attachment_type = "payslip"

    # Get attachment of type `attachment_type` and use the OFFSET and LIMIT to get only the n'th entry
    # where n is `attachment_number`.
    attachment = (
        value.filter(attachment_type=attachment_type)
        .order_by("created_at")[attachment_number - 1 : attachment_number]  # noqa
        .first()
    )
    if not attachment:
        return ""

    path = reverse(
        "v1:summervoucher-handle-attachment",
        kwargs={"pk": summer_voucher.id, "attachment_pk": attachment.id},
    )
    return request.build_absolute_uri(path)


def handle_special_cases(value, attr_str, summer_voucher, field, request):
    if isinstance(value, bool):
        value = str(_("Kyllä")) if value else str(_("Ei"))
    elif attr_str == "attachments":
        value = get_attachment_uri(summer_voucher, field, value, request)
    elif "application__invoicer" in attr_str and getattr(
        summer_voucher, "application", None
    ):
        value = value if summer_voucher.application.is_separate_invoicer else ""
    return value


def write_data_row(ws, row_number, summer_voucher, request):
    ws.write(row_number, 0, row_number)

    timestamp = summer_voucher.created_at.astimezone().strftime("%d/%m/%Y")
    ws.write(row_number, 1, timestamp)

    for column_number, field in enumerate(FIELDS[2:], 2):
        attr_names = field[2]
        values = []
        for attr_str in attr_names:
            value = getattr_nested(summer_voucher, attr_str.split("__"))
            value = handle_special_cases(
                value, attr_str, summer_voucher, field, request
            )
            values.append(value)

        cell_value = field[1] % tuple(values)
        ws.write(row_number, column_number, cell_value)


def populate_workbook(wb: Workbook, summer_vouchers: QuerySet[SummerVoucher], request):
    """
    Fill the workbook with information from the summer vouchers queryset. Field names and values are
    fetched from the FIELDS tuple.
    """
    ws = wb.add_worksheet(name=str(_("Setelit")))
    wrapped_cell_format = wb.add_format()
    wrapped_cell_format.set_text_wrap()

    header_format = wb.add_format({"bold": True})
    for column, field in enumerate(FIELDS):
        set_header_and_formatting(wb, ws, column, field, header_format)
    for row_number, summer_voucher in enumerate(summer_vouchers, 1):
        write_data_row(ws, row_number, summer_voucher, request)
    wb.close()


def export_applications_as_xlsx_output(
    summer_vouchers: QuerySet[SummerVoucher], request
) -> bytes:
    """
    Creates an xlsx file in memory, without saving it on the disk. Return the output value as bytes.
    """
    output = io.BytesIO()

    wb = Workbook(output)
    populate_workbook(wb, summer_vouchers, request)

    return output.getvalue()
