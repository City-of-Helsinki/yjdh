from applications.services.csv_export_base import (
    CsvColumn,
    CsvExportBase,
    get_organization_type,
    nested_queryset_attr,
)
from django.utils import translation
from django.utils.translation import gettext


def CsvDefaultColumn(*args, **kwargs):
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


def format_bool(value):
    if value is None:
        return "ei valintaa"
    elif value is True:
        return "kyllä"
    elif value is False:
        return "ei"
    else:
        raise ValueError(f"Invalid value: {value}")


class ApplicationsCsvService(CsvExportBase):
    """
    Export application data for further processing in Excel and other reporting software.

    For easier processing, if an application would need two Ahjo rows, the two rows are produced in the output.


    """

    def __init__(self, applications):
        self.applications = applications
        self.export_notes = []

    @property
    def CSV_COLUMNS(self):
        columns = [
            CsvColumn("Hakemusnumero", "application_number"),
            CsvColumn("Hakemusrivi", "application_row_idx"),
            CsvColumn("Hakemuksen tila", "status"),
            CsvDefaultColumn("Haettava lisä", "benefit_type", gettext),
            CsvDefaultColumn("Haettu alkupäivä", "start_date"),
            CsvDefaultColumn("Haettu päättymispäivä", "end_date"),
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
            CsvDefaultColumn(
                "Hyväksymisen/hylkäyksen/peruutuksen syy", "latest_decision_comment"
            ),
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
                "Yhdistys jolla yritystoimintaa?",
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
            CsvColumn("Palkkatuki myönnetty?", "pay_subsidy_granted", format_bool),
            CsvDefaultColumn("Palkkatukiprosentti", "pay_subsidy_percent"),
            CsvDefaultColumn(
                "Toinen palkkatukiprosentti", "additional_pay_subsidy_percent"
            ),
            CsvColumn("Oppisopimus?", "apprenticeship_program", format_bool),
            CsvColumn("Arkistoitu?", "archived", format_bool),
            CsvDefaultColumn("Hakemusvaihe(UI)", "application_step"),
            CsvColumn("Työntekijä-ID", "employee.id", str),
            CsvColumn("Työntekijän etunimi", "employee.first_name"),
            CsvColumn("Työntekijän sukunimi", "employee.last_name"),
            CsvColumn("Työntekijän puhelinnumero", "employee.phone_number", str),
            CsvColumn("Työntekijän sähköposti", "employee.email"),
            CsvColumn("Työntekijän kieli", "employee.employee_language"),
            CsvColumn("Työntekijän ammattinimike", "employee.job_title"),
            CsvDefaultColumn(
                "Työntekijän kuukausipalkka (hakijalta)", "employee.monthly_pay"
            ),
            CsvDefaultColumn(
                "Työntekijän lomaraha (hakijalta)", "employee.vacation_money"
            ),
            CsvDefaultColumn(
                "Työntekijän muut kulut (hakijalta)", "employee.other_expenses"
            ),
            CsvDefaultColumn("Työntekijän työtunnit", "employee.working_hours"),
            CsvColumn("Työntekijän TES", "employee.collective_bargaining_agreement"),
            CsvDefaultColumn("Työntekijän syntymäpäivä", "employee.birthday"),
            CsvColumn(
                "Työntekijä asuu Helsinkissä?",
                "employee.is_living_in_helsinki",
                format_bool,
            ),
            CsvDefaultColumn(
                "Helsinki-lisän määrä lopullinen", "calculation.benefit_amount"
            ),
            CsvDefaultColumn("Kuukausipalkka laskelmassa", "calculation.monthly_pay"),
            CsvDefaultColumn("Lomaraha laskelmassa", "calculation.vacation_money"),
            CsvDefaultColumn("Muut kulut laskelmassa", "calculation.other_expenses"),
            CsvDefaultColumn("Laskelman alkupäivä", "calculation.start_date"),
            CsvDefaultColumn("Laskelman päättymispäivä", "calculation.end_date"),
            CsvDefaultColumn(
                "Valtiotukimaksimi", "calculation.state_aid_max_percentage"
            ),
            CsvDefaultColumn(
                "Laskelman lopputulos", "calculation.calculated_benefit_amount"
            ),
            CsvDefaultColumn(
                "Manuaalinen syöttö", "calculation.override_monthly_benefit_amount"
            ),
            CsvColumn(
                "Manuaalinen syöttö kommentti",
                "calculation.override_monthly_benefit_amount_comment",
            ),
            CsvColumn(
                "Myönnetään de minimis -tukena?",
                "calculation.granted_as_de_minimis_aid",
                format_bool,
            ),
            CsvColumn(
                "Kohderyhmätarkistus", "calculation.target_group_check", format_bool
            ),
            CsvDefaultColumn("Päättäjän nimike", "batch.decision_maker_title"),
            CsvDefaultColumn("Päättäjän nimi", "batch.decision_maker_name"),
            CsvDefaultColumn("Päätöspykälä", "batch.section_of_the_law"),
            CsvDefaultColumn("Päätöspäivä", "batch.decision_date"),
            CsvDefaultColumn("Asiantarkastajan nimi", "batch.expert_inspector_name"),
            CsvDefaultColumn("Asiantarkastajan email", "batch.expert_inspector_email"),
        ]
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
                    CsvDefaultColumn(
                        f"Ahjo-rivi {idx + 1} / määrä eur yht",
                        nested_queryset_attr("ahjo_rows", idx, "amount"),
                    ),
                    CsvDefaultColumn(
                        f"Ahjo-rivi {idx + 1} / määrä eur kk",
                        nested_queryset_attr("ahjo_rows", idx, "monthly_amount"),
                    ),
                    CsvDefaultColumn(
                        f"Ahjo-rivi {idx + 1} / alkupäivä",
                        nested_queryset_attr("ahjo_rows", idx, "start_date"),
                    ),
                    CsvDefaultColumn(
                        f"Ahjo-rivi {idx + 1} / päättymispäivä",
                        nested_queryset_attr("ahjo_rows", idx, "end_date"),
                    ),
                ]
            )
        for idx in range(self.MAX_PAY_SUBSIDIES):
            columns.extend(
                [
                    CsvDefaultColumn(
                        f"Palkkatuki {idx + 1} / alkupäivä",
                        nested_queryset_attr("pay_subsidies", idx, "start_date"),
                    ),
                    CsvDefaultColumn(
                        f"Palkkatuki {idx + 1} / päättymispäivä",
                        nested_queryset_attr("pay_subsidies", idx, "end_date"),
                    ),
                    CsvDefaultColumn(
                        f"Palkkatuki {idx + 1} / palkkatukiprosentti",
                        nested_queryset_attr(
                            "pay_subsidies", idx, "pay_subsidy_percent"
                        ),
                    ),
                    CsvDefaultColumn(
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
                    CsvDefaultColumn(
                        f"De minimis {idx + 1} / määrä",
                        nested_queryset_attr("de_minimis_aid_set", idx, "amount"),
                    ),
                    CsvDefaultColumn(
                        f"De minimis {idx + 1} / myönnetty",
                        nested_queryset_attr("de_minimis_aid_set", idx, "granted_at"),
                    ),
                ]
            )

        columns.append(CsvColumn("Huom", get_export_notes))
        return columns

    MAX_AHJO_ROWS = 2
    MAX_PAY_SUBSIDIES = 2
    MAX_DE_MINIMIS_AIDS = 5

    def get_applications(self):
        return self.applications

    def get_row_items(self):
        with translation.override("fi"):
            for application in self.get_applications():
                # for applicatins with multiple ahjo rows, output the same number of rows.
                # If no Ahjo rows (calculation incomplete), always output just one row.
                for application_row_idx, unused in enumerate(
                    application.ahjo_rows or [None]
                ):
                    # The CSV output is easier to process for Ahjo output is easier to process
                    # if application is listed
                    application.application_row_idx = application_row_idx + 1
                    yield application

    def get_csv_lines(self):
        if self.get_applications():
            return super().get_csv_lines()
        else:
            header_row = self._get_header_row()
            return [
                header_row,
                ["Ei löytynyt ehdot täyttäviä hakemuksia"]
                + [""] * (len(header_row) - 1),
            ]
