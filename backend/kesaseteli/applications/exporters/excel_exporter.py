import io
from typing import List, NamedTuple

from django.db.models import QuerySet
from django.shortcuts import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from xlsxwriter import Workbook

from applications.enums import ExcelColumns
from applications.models import EmployerSummerVoucher
from common.utils import getattr_nested


class ExcelField(NamedTuple):
    title: str
    value: str
    model_fields: List[str]
    width: int
    background_color: str


APPLICATION_LANGUAGE_FIELD_TITLE = _("Hakemuksen kieli")
BANK_ACCOUNT_NUMBER_FIELD_TITLE = _("Tilinumero")
EMPLOYMENT_END_DATE_FIELD_TITLE = _("Työsuhteen päättymispäivämäärä")
EMPLOYMENT_START_DATE_FIELD_TITLE = _("Työsuhteen aloituspäivämäärä")
HIRED_WITHOUT_VOUCHER_ASSESSMENT_FIELD_TITLE = _("Olisitko palkannut?")
ORDER_FIELD_TITLE = _("Järjestys")
RECEIVED_DATE_FIELD_TITLE = _("Saatu pvm")
SALARY_PAID_FIELD_TITLE = _("Maksettu palkka")
SPECIAL_CASE_FIELD_TITLE = _("Erikoistapaus (esim yhdeksäsluokkalainen)")
SUM_FIELD_TITLE = _("Summa")
WORK_HOURS_FIELD_TITLE = _("Työtunnit")

REMOVABLE_REPORTING_FIELD_TITLES = [
    _("Y-tunnus"),
    _("Yhdyshenkilö"),
    _("Yhdyshenkilön sähköposti"),
    _("Yhdyshenkilön Puhelin"),
    _("Erillinen laskuttaja"),
    _("Laskuttajan nimi"),
    _("Laskuttajan sähköposti"),
    _("Laskuttajan Puhelin"),
    _("Raporttiin luokittelu"),
    _("Liite: Työsopimus 1"),
    _("Liite: Työsopimus 2"),
    _("Liite: Työsopimus 3"),
    _("Liite: Työsopimus 4"),
    _("Liite: Työsopimus 5"),
    _("Liite: Palkkalaskelma 1"),
    _("Liite: Palkkalaskelma 2"),
    _("Liite: Palkkalaskelma 3"),
    _("Liite: Palkkalaskelma 4"),
    _("Liite: Palkkalaskelma 5"),
    BANK_ACCOUNT_NUMBER_FIELD_TITLE,
    SUM_FIELD_TITLE,
    _("Tarkastaja etunimi"),
    _("Tarkastaja sukunimi"),
    _("Hyväksyjä etunimi"),
    _("Hyväksyjä sukunimi"),
]


REMOVABLE_TALPA_FIELD_TITLES = [
    _("Henkilötunnus"),
    _("Koulu"),
    _("Kotipostinumero"),
    _("Puhelin"),
    _("Kotikaupunki"),
    _("Työnantaja muoto"),
    _("Yhdyshenkilö"),
    _("Yhdyshenkilön sähköposti"),
    _("Yhdyshenkilön Puhelin"),
    _("Erillinen laskuttaja"),
    _("Laskuttajan nimi"),
    _("Laskuttajan sähköposti"),
    _("Laskuttajan Puhelin"),
    _("Yrityksen toimiala"),
    _("Työn suorituspaikan postinumero"),
    EMPLOYMENT_START_DATE_FIELD_TITLE,
    EMPLOYMENT_END_DATE_FIELD_TITLE,
    WORK_HOURS_FIELD_TITLE,
    SALARY_PAID_FIELD_TITLE,
    _("Muut edut"),
    _("Raporttiin luokittelu"),
    _("Työtehtävät"),
    HIRED_WITHOUT_VOUCHER_ASSESSMENT_FIELD_TITLE,
    _("Työnantajan kokemus"),
    _("Muuta"),
    _("Liite: Työsopimus 1"),
    _("Liite: Työsopimus 2"),
    _("Liite: Työsopimus 3"),
    _("Liite: Työsopimus 4"),
    _("Liite: Työsopimus 5"),
    _("Liite: Palkkalaskelma 1"),
    _("Liite: Palkkalaskelma 2"),
    _("Liite: Palkkalaskelma 3"),
    _("Liite: Palkkalaskelma 4"),
    _("Liite: Palkkalaskelma 5"),
]


FIELDS = [
    # Field title, field value, field names in summer voucher model, column width, background color
    ExcelField(ORDER_FIELD_TITLE, "", [], 15, "white"),  # Specially handled
    ExcelField(
        RECEIVED_DATE_FIELD_TITLE, "%s", ["submitted_at"], 15, "white"
    ),  # Specially handled
    ExcelField(
        APPLICATION_LANGUAGE_FIELD_TITLE, "%s", ["application__language"], 15, "white"
    ),
    ExcelField(
        _("Setelin numero"), "%s", ["summer_voucher_serial_number"], 30, "white"
    ),
    ExcelField(
        SPECIAL_CASE_FIELD_TITLE,
        "%s",
        ["summer_voucher_exception_reason"],
        30,
        "white",
    ),
    ExcelField("", "", [], 5, "#7F7F7F"),
    ExcelField(_("Nuoren nimi"), "%s", ["employee_name"], 30, "#DCEDF8"),
    ExcelField(_("Henkilötunnus"), "%s", ["employee_ssn"], 30, "#DCEDF8"),
    ExcelField(_("Koulu"), "%s", ["employee_school"], 30, "#DCEDF8"),
    ExcelField(_("Kotipostinumero"), "%s", ["employee_postcode"], 15, "#DCEDF8"),
    ExcelField(_("Puhelin"), "%s", ["employee_phone_number"], 30, "#DCEDF8"),
    ExcelField(_("Kotikaupunki"), "%s", ["employee_home_city"], 30, "#DCEDF8"),
    ExcelField("", "", [], 5, "#7F7F7F"),
    ExcelField(
        _("Työnantaja muoto"),
        "%s",
        ["application__company__company_form"],
        15,
        "#E7E3F9",
    ),
    ExcelField(_("Työnantaja"), "%s", ["application__company__name"], 30, "#E7E3F9"),
    ExcelField(
        _("Y-tunnus"), "%s", ["application__company__business_id"], 15, "#E7E3F9"
    ),
    ExcelField(
        _("Työnantajan lähiosoite"),
        "%s",
        ["application__company__street_address"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Työnantajan postinumero"),
        "%s",
        ["application__company__postcode"],
        15,
        "#E7E3F9",
    ),
    ExcelField(
        _("Työnantajan kunta"), "%s", ["application__company__city"], 15, "#E7E3F9"
    ),
    ExcelField(
        _("Yhdyshenkilö"), "%s", ["application__contact_person_name"], 30, "#E7E3F9"
    ),
    ExcelField(
        _("Yhdyshenkilön sähköposti"),
        "%s",
        ["application__contact_person_email"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Yhdyshenkilön Puhelin"),
        "%s",
        ["application__contact_person_phone_number"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Erillinen laskuttaja"),
        "%s",
        ["application__is_separate_invoicer"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Laskuttajan nimi"), "%s", ["application__invoicer_name"], 30, "#E7E3F9"
    ),
    ExcelField(
        _("Laskuttajan sähköposti"),
        "%s",
        ["application__invoicer_email"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Laskuttajan Puhelin"),
        "%s",
        ["application__invoicer_phone_number"],
        30,
        "#E7E3F9",
    ),
    ExcelField(
        _("Yrityksen toimiala"), "%s", ["application__company__industry"], 30, "#E7E3F9"
    ),
    ExcelField("", "", [], 5, "#7F7F7F"),
    ExcelField(
        _("Työn suorituspaikan postinumero"),
        "%s",
        ["employment_postcode"],
        15,
        "#F7DAE3",
    ),
    ExcelField(
        EMPLOYMENT_START_DATE_FIELD_TITLE,
        "%s",
        ["employment_start_date"],
        30,
        "#F7DAE3",
    ),
    ExcelField(
        EMPLOYMENT_END_DATE_FIELD_TITLE,
        "%s",
        ["employment_end_date"],
        30,
        "#F7DAE3",
    ),
    ExcelField(WORK_HOURS_FIELD_TITLE, "%s", ["employment_work_hours"], 15, "#F7DAE3"),
    ExcelField(
        SALARY_PAID_FIELD_TITLE, "%s", ["employment_salary_paid"], 15, "#F7DAE3"
    ),
    ExcelField(_("Muut edut"), "", [], 15, "#F7DAE3"),
    ExcelField(_("Raporttiin luokittelu"), "", [], 15, "#F7DAE3"),
    ExcelField(_("Työtehtävät"), "%s", ["employment_description"], 30, "#F7DAE3"),
    ExcelField(
        HIRED_WITHOUT_VOUCHER_ASSESSMENT_FIELD_TITLE,
        "%s",
        ["hired_without_voucher_assessment"],
        15,
        "#F7DAE3",
    ),
    ExcelField(_("Työnantajan kokemus"), "", [], 30, "#F7DAE3"),
    ExcelField(_("Muuta"), "", [], 30, "#F7DAE3"),
    ExcelField(_("Liite: Työsopimus 1"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Työsopimus 2"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Työsopimus 3"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Työsopimus 4"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Työsopimus 5"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Palkkalaskelma 1"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Palkkalaskelma 2"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Palkkalaskelma 3"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Palkkalaskelma 4"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(_("Liite: Palkkalaskelma 5"), "%s", ["attachments"], 120, "#F7DAE3"),
    ExcelField(
        BANK_ACCOUNT_NUMBER_FIELD_TITLE,
        "%s",
        ["application__bank_account_number"],
        30,
        "#F7DAE3",
    ),
    ExcelField(SUM_FIELD_TITLE, "325", [], 15, "#F7DAE3"),
    ExcelField(_("Tarkastaja etunimi"), "", [], 30, "#F7DAE3"),
    ExcelField(_("Tarkastaja sukunimi"), "", [], 30, "#F7DAE3"),
    ExcelField(_("Hyväksyjä etunimi"), "", [], 30, "#F7DAE3"),
    ExcelField(_("Hyväksyjä sukunimi"), "", [], 30, "#F7DAE3"),
]


def get_reporting_columns():
    return [
        field for field in FIELDS if field.title not in REMOVABLE_REPORTING_FIELD_TITLES
    ]


def get_talpa_columns():
    return [
        field for field in FIELDS if field.title not in REMOVABLE_TALPA_FIELD_TITLES
    ]


def get_exportable_fields(columns: ExcelColumns):
    return {
        ExcelColumns.REPORTING.value: get_reporting_columns,
        ExcelColumns.TALPA.value: get_talpa_columns,
    }[columns]()


def get_xlsx_filename(columns: ExcelColumns) -> str:
    """
    Get the name of the excel file. Example filename:
    talpa-kesasetelihakemukset_2021-01-01_23-59-59.xlsx
    """
    local_datetime_now_as_str = timezone.localtime(timezone.now()).strftime(
        "%Y-%m-%d_%H-%M-%S"
    )
    filename = f"{columns}-kesasetelihakemukset_{local_datetime_now_as_str}.xlsx"
    return filename


def set_header_and_formatting(wb, ws, column, field: ExcelField, header_format):
    ws.write(0, column, str(_(field.title)), header_format)

    cell_format = wb.add_format()
    cell_format.set_border(1)
    cell_format.set_bg_color(field.background_color)
    ws.set_column(column, column, field.width, cell_format)


def get_attachment_uri(
    summer_voucher: EmployerSummerVoucher, field: ExcelField, value, request
):
    field_name = field.title
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
        "v1:employersummervoucher-handle-attachment",
        kwargs={"pk": summer_voucher.id, "attachment_pk": attachment.id},
    )
    return request.build_absolute_uri(path)


def handle_special_cases(value, attr_str, summer_voucher, field: ExcelField, request):
    if isinstance(value, bool):
        value = str(_("Kyllä")) if value else str(_("Ei"))
    elif attr_str == "attachments":
        value = get_attachment_uri(summer_voucher, field, value, request)
    elif "application__invoicer" in attr_str and getattr(
        summer_voucher, "application", None
    ):
        value = value if summer_voucher.application.is_separate_invoicer else ""
    return value


def write_data_row(
    ws,
    row_number,
    summer_voucher,
    fields: List[ExcelField],
    request,
):
    for column_number, field in enumerate(fields):
        if field.title == ORDER_FIELD_TITLE:
            cell_value = row_number
        elif field.title == RECEIVED_DATE_FIELD_TITLE:
            cell_value = summer_voucher.submitted_at.astimezone().strftime("%d/%m/%Y")
        else:
            attr_names = field.model_fields
            values = []
            for attr_str in attr_names:
                value = getattr_nested(summer_voucher, attr_str.split("__"))
                value = handle_special_cases(
                    value, attr_str, summer_voucher, field, request
                )
                values.append(value)

            cell_value = field.value % tuple(values)

        ws.write(row_number, column_number, cell_value)


def populate_workbook(
    wb: Workbook,
    summer_vouchers: QuerySet[EmployerSummerVoucher],
    columns: ExcelColumns,
    request,
):
    """
    Fill the workbook with information from the summer vouchers queryset. Field names and values are
    fetched from the FIELDS tuple.
    """
    ws = wb.add_worksheet(name=str(_("Setelit")))
    wrapped_cell_format = wb.add_format()
    wrapped_cell_format.set_text_wrap()

    header_format = wb.add_format({"bold": True})
    exportable_fields = get_exportable_fields(columns)
    for column, field in enumerate(exportable_fields):
        set_header_and_formatting(wb, ws, column, field, header_format)
    for row_number, summer_voucher in enumerate(summer_vouchers, 1):
        write_data_row(ws, row_number, summer_voucher, exportable_fields, request)
    wb.close()


def export_applications_as_xlsx_output(
    summer_vouchers: QuerySet[EmployerSummerVoucher], columns: ExcelColumns, request
) -> bytes:
    """
    Creates an xlsx file in memory, without saving it on the disk. Return the output value as bytes.
    """
    output = io.BytesIO()

    wb = Workbook(output)
    populate_workbook(wb, summer_vouchers, columns, request)

    return output.getvalue()
