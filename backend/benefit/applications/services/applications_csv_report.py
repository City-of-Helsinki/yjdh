import decimal
import logging
from datetime import date, datetime
from typing import List

from django.conf import settings
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.utils import translation

from applications.enums import ApplicationBatchStatus, ApplicationOrigin, BenefitType
from applications.models import Application
from applications.services.csv_export_base import (
    CsvColumn,
    CsvExportBase,
    get_organization_type,
    nested_queryset_attr,
)
from calculator.models import Instalment

LOGGER = logging.getLogger(__name__)


def csv_default_column(*args, **kwargs):
    # define a default value, as the application csv export needs to be able to handle
    # also applications with missing data
    # Not defined as a subclass of CsvColumn due to the way Python dataclasses work
    kwargs.setdefault("default_value", "")
    return CsvColumn(*args, **kwargs)


def get_export_notes(application):
    """
    Report situations where the data does not fit in the fixed number of CSV columns.
    These cases should not happen, but if they do, then it's important to have some kind of notification about it.
    """
    notes = []
    if (
        application.de_minimis_aid_set.count()
        > ApplicationsCsvService.MAX_DE_MINIMIS_AIDS
    ):
        notes.append("osa de minimis -tuista puuttuu raportilta")
    if application.pay_subsidies.count() > ApplicationsCsvService.MAX_PAY_SUBSIDIES:
        notes.append("osa palkkatuista puuttuu raportilta")
    if application.ahjo_rows.count() > ApplicationsCsvService.MAX_AHJO_ROWS:
        notes.append("osa Ahjo-riveistä puuttuu raportilta")
    return ", ".join(notes)


def format_datetime(value):
    if value:
        return value.strftime("%Y-%m-%d")
    else:
        return ""


def format_bool(value):
    if value is None:
        return "ei valintaa"
    elif value is True:
        return "kyllä"
    elif value is False:
        return "ei"
    else:
        raise ValueError(f"Invalid value: {value}")


def current_ahjo_row_field_getter(field_name):
    def getter(item):
        if rows := list(item.ahjo_rows):
            if item.application_row_idx - 1 < len(rows):
                # application_row_idx is 1-based
                return getattr(rows[item.application_row_idx - 1], field_name)
        return ""

    return getter


def get_benefit_type_label(benefit_type) -> str:
    return str(BenefitType(benefit_type).label)


def get_batch_status_label(batch_status: str) -> str:
    if batch_status == "":
        return ""
    return str(ApplicationBatchStatus(batch_status).label)


def get_application_origin_label(application_origin: str) -> str:
    return str(ApplicationOrigin(application_origin).label)


def get_submitted_at_date(application) -> datetime:
    if hasattr(application, "submitted_at") and application.submitted_at:
        return application.submitted_at
    else:
        return application.created_at


class ApplicationsCsvService(CsvExportBase):
    """
    Export application data for further processing in Excel and other reporting software.

    For easier processing, if an application would need two Ahjo rows, the two rows are produced in the output.

    """

    def __init__(self, applications, prune_sensitive_data=False):
        self.applications = applications
        self.export_notes = []
        self.prune_sensitive_data = prune_sensitive_data

    def query_instalment_by_number(
        self, application: Application, number: int
    ) -> Instalment:
        """Return the actual payable amount of the currently accepted and due instalment"""
        try:
            instalment = application.calculation.instalments.get(
                instalment_number=number,
            )
            return instalment
        except ObjectDoesNotExist:
            LOGGER.info(
                f"Valid payable Instalment not found for application {application.application_number}"
            )
        except MultipleObjectsReturned:
            LOGGER.error(
                f"Multiple payable Instalments found for application \
    {application.application_number}, there should be only one"
            )

    def get_instalment_1_amount(self, application: Application) -> decimal.Decimal:
        """
        Return the amount that was granted for the first instalment.
        """
        instalment = self.query_instalment_by_number(application, 1)
        if instalment and instalment.amount:
            return instalment.amount
        else:
            return None

    def get_instalment_2_amount_after_recoveries(
        self, application: Application
    ) -> decimal.Decimal:
        """
        Return the actual amount that is payable on the second instalment,
        after possible alterations have been deductet.
        """
        instalment = self.query_instalment_by_number(application, 2)
        if instalment and instalment.amount_after_recoveries:
            return instalment.amount_after_recoveries
        else:
            return None

    def get_instalment_2_amount(self, application: Application) -> decimal.Decimal:
        """
        Return the amount that was granted for the second instalment.
        """
        instalment = self.query_instalment_by_number(application, 2)
        if instalment and instalment.amount:
            return instalment.amount
        else:
            return None

    def get_instalment_2_due_date(self, application: Application) -> date:
        """
        Return the due date of the second instalment.
        """
        instalment = self.query_instalment_by_number(application, 2)
        if instalment:
            return instalment.due_date
        else:
            return ""

    @property
    def CSV_COLUMNS(self) -> List[CsvColumn]:
        calculated_benefit_amount = "calculation.calculated_benefit_amount"

        columns = [
            CsvColumn("Hakemusnumero", "application_number"),
            CsvColumn("Hakemus saapunut", get_submitted_at_date, format_datetime),
            CsvColumn("Hakemusrivi", "application_row_idx"),
            CsvColumn("Hakemuksen tila", "status"),
            CsvColumn(
                "Hakemuksen tyyppi", "application_origin", get_application_origin_label
            ),
            csv_default_column(
                "Koonnin status", "batch.status", get_batch_status_label
            ),
            csv_default_column(
                "Koonnin statuksen päivämäärä", "batch.modified_at", format_datetime
            ),
            csv_default_column("Haettava lisä", "benefit_type", get_benefit_type_label),
            csv_default_column("Haettu alkupäivä", "start_date"),
            csv_default_column("Haettu päättymispäivä", "end_date"),
            CsvColumn("Työnantajan tyyppi", get_organization_type),
            CsvColumn("Työnantajan tilinumero", "company_bank_account_number"),
            CsvColumn("Työnantajan nimi", "company_name"),
            CsvColumn("Työnantajan Y-tunnus", "company.business_id"),
            CsvColumn("Työnantajan katuosoite", "effective_company_street_address"),
            CsvColumn("Työnantajan postinumero", "effective_company_postcode"),
            CsvColumn("Työnantajan postitoimipaikka", "effective_company_city"),
            CsvColumn(
                "Työnantajan katuosoite (YTJ)", "official_company_street_address"
            ),
            CsvColumn("Työnantajan postinumero (YTJ)", "official_company_postcode"),
            CsvColumn("Työnantajan postitoimipaikka (YTJ)", "official_company_city"),
            CsvColumn(
                "Työnantajan osoite hakijalta?", "use_alternative_address", format_bool
            ),
            CsvColumn(
                "Työnantajan katuosoite (hakijalta)",
                "alternative_company_street_address",
            ),
            CsvColumn(
                "Työnantajan postinumero (hakijalta)", "alternative_company_postcode"
            ),
            CsvColumn(
                "Työnantajan postitoimipaikka (hakijalta)", "alternative_company_city"
            ),
            CsvColumn("Työnantajan osasto", "company_department"),
            CsvColumn("Työnantajan yhtiömuoto", "company_form"),
            CsvColumn("Työnantajan yhtiömuoto (YTJ-numero)", "company_form_code"),
            CsvColumn(
                "Työnantajan yhteyshenkilön etunimi",
                "company_contact_person_first_name",
            ),
            CsvColumn(
                "Työnantajan yhteyshenkilön sukunimi",
                "company_contact_person_last_name",
            ),
            CsvColumn(
                "Työnantajan yhteyshenkilön sähköpostiosoite",
                "company_contact_person_email",
            ),
            CsvColumn(
                "Työnantajan yhteyshenkilön puhelin",
                "company_contact_person_phone_number",
                str,
            ),
            CsvColumn(
                "Yhdistys jolla taloudellista toimintaa?",
                "association_has_business_activities",
                format_bool,
            ),
            CsvColumn("Hakijan kieli", "applicant_language"),
            CsvColumn(
                "Lähiesihenkilö-ruksi",
                "association_immediate_manager_check",
                format_bool,
            ),
            CsvColumn("YT-neuvottelut?", "co_operation_negotiations", format_bool),
            CsvColumn("YT-neuvottelut/tiedot", "co_operation_negotiations_description"),
            CsvColumn("Palkkatuki myönnetty?", "pay_subsidy_granted", str),
            csv_default_column("Palkkatukiprosentti", "pay_subsidy_percent"),
            csv_default_column(
                "Toinen palkkatukiprosentti", "additional_pay_subsidy_percent"
            ),
            CsvColumn("Oppisopimus?", "apprenticeship_program", format_bool),
            CsvColumn("Arkistoitu?", "archived", format_bool),
            csv_default_column("Hakemusvaihe(UI)", "application_step"),
            CsvColumn("Työntekijä-ID", "employee.id", str),
            CsvColumn("Työntekijän etunimi", "employee.first_name"),
            CsvColumn("Työntekijän sukunimi", "employee.last_name"),
            CsvColumn("Työntekijän puhelinnumero", "employee.phone_number", str),
            CsvColumn("Työntekijän sähköposti", "employee.email"),
            CsvColumn("Työntekijän kieli", "employee.employee_language"),
            CsvColumn("Työntekijän ammattinimike", "employee.job_title"),
            csv_default_column(
                "Työntekijän kuukausipalkka (hakijalta)", "employee.monthly_pay"
            ),
            csv_default_column(
                "Työntekijän lomaraha (hakijalta)", "employee.vacation_money"
            ),
            csv_default_column(
                "Työntekijän muut kulut (hakijalta)", "employee.other_expenses"
            ),
            csv_default_column("Työntekijän työtunnit", "employee.working_hours"),
            CsvColumn("Työntekijän TES", "employee.collective_bargaining_agreement"),
            csv_default_column("Työntekijän syntymäpäivä", "employee.birthday"),
            CsvColumn(
                "Työntekijä asuu Helsinkissä?",
                "employee.is_living_in_helsinki",
                format_bool,
            ),
            csv_default_column(
                "Helsinki-lisän määrä lopullinen", calculated_benefit_amount
            ),
            csv_default_column("Kuukausipalkka laskelmassa", "calculation.monthly_pay"),
            csv_default_column("Lomaraha laskelmassa", "calculation.vacation_money"),
            csv_default_column("Muut kulut laskelmassa", "calculation.other_expenses"),
            csv_default_column("Laskelman alkupäivä", "calculation.start_date"),
            csv_default_column("Laskelman päättymispäivä", "calculation.end_date"),
            csv_default_column("Käsittelypäivä", "handled_at", format_datetime),
            csv_default_column(
                "Valtiotukimaksimi", "calculation.state_aid_max_percentage"
            ),
            csv_default_column("Laskelman lopputulos", calculated_benefit_amount),
            csv_default_column(
                "Manuaalinen syöttö", "calculation.override_monthly_benefit_amount"
            ),
            csv_default_column(
                "Manuaalinen syöttö kommentti",
                "calculation.override_monthly_benefit_amount_comment",
            ),
            csv_default_column(
                "Myönnetään de minimis -tukena?",
                "calculation.granted_as_de_minimis_aid",
                format_bool,
                default_value=None,
            ),
            csv_default_column(
                "Kohderyhmätarkistus",
                "calculation.target_group_check",
                format_bool,
                default_value=None,
            ),
            csv_default_column(
                "Hyväksymisen/hylkäyksen/peruutuksen syy", "latest_decision_comment"
            ),
            csv_default_column("Päättäjän nimike", "batch.decision_maker_title"),
            csv_default_column("Päättäjän nimi", "batch.decision_maker_name"),
            csv_default_column("Päätöspykälä", "batch.section_of_the_law"),
            csv_default_column("Päätöspäivä", "batch.decision_date"),
            csv_default_column(
                "Asiantarkastajan nimi Ahjo", "batch.expert_inspector_name"
            ),
            csv_default_column(
                "Asiantarkastajan titteli Ahjo", "batch.expert_inspector_title"
            ),
            csv_default_column("Tarkastajan nimi, P2P", "batch.p2p_inspector_name"),
            csv_default_column(
                "Tarkastajan sähköposti, P2P", "batch.p2p_inspector_email"
            ),
            csv_default_column("Hyväksyjän nimi P2P", "batch.p2p_checker_name"),
            # In case there are multiple rows per application, always have the nth ahjo row
            # in the same column.
            # The row data here comes from calculation.ahjo_rows[application_row_idx - 1]
            CsvColumn(
                "Siirrettävä Ahjo-rivi / tyyppi",
                current_ahjo_row_field_getter("row_type"),
            ),
            CsvColumn(
                "Siirrettävä Ahjo-rivi / teksti",
                current_ahjo_row_field_getter("description_fi"),
            ),
            csv_default_column(
                "Siirrettävä Ahjo-rivi / määrä eur yht",
                current_ahjo_row_field_getter("amount"),
            ),
            csv_default_column(
                "Siirrettävä Ahjo-rivi / määrä eur kk",
                current_ahjo_row_field_getter("monthly_amount"),
            ),
            csv_default_column(
                "Siirrettävä Ahjo-rivi / alkupäivä",
                current_ahjo_row_field_getter("start_date"),
            ),
            csv_default_column(
                "Siirrettävä Ahjo-rivi / päättymispäivä",
                current_ahjo_row_field_getter("end_date"),
            ),
        ]

        if settings.PAYMENT_INSTALMENTS_ENABLED:
            columns.append(
                csv_default_column(
                    "Myönnetty maksuerä 1", self.get_instalment_1_amount
                ),
            )
            columns.append(
                csv_default_column(
                    "Myönnetty maksuerä 2", self.get_instalment_2_amount
                ),
            )
            columns.append(
                csv_default_column(
                    "Maksettava maksuerä 2",
                    self.get_instalment_2_amount_after_recoveries,
                ),
            )
            columns.append(
                csv_default_column(
                    "Maksuerän 2 maksupäivä", self.get_instalment_2_due_date
                ),
            )
        # Include all the application rows in the same line for easier processing
        for idx in range(self.MAX_AHJO_ROWS):
            columns.extend(
                [
                    CsvColumn(
                        f"Ahjo-rivi {idx + 1} / tyyppi",
                        nested_queryset_attr("ahjo_rows", idx, "row_type"),
                    ),
                    CsvColumn(
                        f"Ahjo-rivi {idx + 1} / teksti",
                        nested_queryset_attr("ahjo_rows", idx, "description_fi"),
                    ),
                    csv_default_column(
                        f"Ahjo-rivi {idx + 1} / määrä eur yht",
                        nested_queryset_attr("ahjo_rows", idx, "amount"),
                    ),
                    csv_default_column(
                        f"Ahjo-rivi {idx + 1} / määrä eur kk",
                        nested_queryset_attr("ahjo_rows", idx, "monthly_amount"),
                    ),
                    csv_default_column(
                        f"Ahjo-rivi {idx + 1} / alkupäivä",
                        nested_queryset_attr("ahjo_rows", idx, "start_date"),
                    ),
                    csv_default_column(
                        f"Ahjo-rivi {idx + 1} / päättymispäivä",
                        nested_queryset_attr("ahjo_rows", idx, "end_date"),
                    ),
                ]
            )
        for idx in range(self.MAX_PAY_SUBSIDIES):
            columns.extend(
                [
                    csv_default_column(
                        f"Palkkatuki {idx + 1} / alkupäivä",
                        nested_queryset_attr("pay_subsidies", idx, "start_date"),
                    ),
                    csv_default_column(
                        f"Palkkatuki {idx + 1} / päättymispäivä",
                        nested_queryset_attr("pay_subsidies", idx, "end_date"),
                    ),
                    csv_default_column(
                        f"Palkkatuki {idx + 1} / palkkatukiprosentti",
                        nested_queryset_attr(
                            "pay_subsidies", idx, "pay_subsidy_percent"
                        ),
                    ),
                    csv_default_column(
                        f"Palkkatuki {idx + 1} / työaikaprosentti",
                        nested_queryset_attr("pay_subsidies", idx, "work_time_percent"),
                    ),
                    CsvColumn(
                        f"Palkkatuki {idx + 1} / vamma tai sairaus?",
                        nested_queryset_attr(
                            "pay_subsidies", idx, "disability_or_illness", None
                        ),
                        format_bool,
                    ),
                ]
            )

        for idx in range(self.MAX_DE_MINIMIS_AIDS):
            columns.extend(
                [
                    CsvColumn(
                        f"De minimis {idx + 1} / myöntäjä",
                        nested_queryset_attr("de_minimis_aid_set", idx, "granter"),
                    ),
                    csv_default_column(
                        f"De minimis {idx + 1} / määrä",
                        nested_queryset_attr("de_minimis_aid_set", idx, "amount"),
                    ),
                    csv_default_column(
                        f"De minimis {idx + 1} / myönnetty",
                        nested_queryset_attr("de_minimis_aid_set", idx, "granted_at"),
                    ),
                ]
            )

        columns.append(CsvColumn("Huom", get_export_notes))

        if self.prune_sensitive_data:
            return self._remove_sensitive_columns(columns)

        return columns

    MAX_AHJO_ROWS = 2
    MAX_PAY_SUBSIDIES = 2
    MAX_DE_MINIMIS_AIDS = 5

    def _remove_sensitive_columns(self, columns: List[CsvColumn]) -> List[CsvColumn]:
        """Remove sensitive employee data from the CsvColumns list"""
        sensitive_col_headings = [
            "Työntekijän etunimi",
            "Työntekijän sukunimi",
            "Työntekijän puhelinnumero",
            "Työntekijän sähköposti",
        ]
        return [col for col in columns if col.heading not in sensitive_col_headings]

    def get_applications(self):
        return self.applications

    def get_row_items(self):
        with translation.override("fi"):
            for application in self.get_applications():
                for application_row_idx, unused in enumerate(
                    application.ahjo_rows or [None]
                ):
                    # The CSV output is easier to process in PowerBI
                    # if the rows belonging to the same application are numbered.
                    # application_row_idx is also used for storing the "current" ahjo row.
                    # application_row_idx starts at 1, which must be taken into account
                    # when indexing application.ahjo_rows
                    application.application_row_idx = application_row_idx + 1
                    yield application

    def get_csv_cell_list_lines_generator(self):
        if self.get_applications():
            yield from super().get_csv_cell_list_lines_generator()
        else:
            header_row = self._get_header_row()
            yield header_row
            yield ["Ei löytynyt ehdot täyttäviä hakemuksia"] + [""] * (
                len(header_row) - 1
            )
