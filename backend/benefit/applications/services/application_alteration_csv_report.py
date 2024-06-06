from dataclasses import dataclass
from typing import Union

from django.db.models.query import QuerySet

from applications.models import ApplicationAlteration
from applications.services.csv_export_base import CsvColumn, CsvExportBase


@dataclass
class AlterationCsvConfigurableFields:
    """Configuration for changeable fields of application alteration csv.
    These values can change and should be stored in the db or in the settings.py.
    """

    account_number: str
    billing_department: str = "1800 Kaupunginkanslia (Kansl)"


class ApplicationAlterationCsvService(CsvExportBase):
    def __init__(
        self,
        application_alterations: QuerySet[ApplicationAlteration],
        config: AlterationCsvConfigurableFields,
    ):
        self.application_alterations = application_alterations
        self.billing_department = config.billing_department
        self.account_number = config.account_number

    def get_recovery_period(
        self, alteration: ApplicationAlteration
    ) -> Union[str, None]:
        if alteration.recovery_start_date and alteration.recovery_end_date:
            start = alteration.recovery_start_date.strftime("%d.%m.%Y")
            end = alteration.recovery_end_date.strftime("%d.%m.%Y")
            return f"{start} - {end}"
        return None

    def get_title(self, alteration: ApplicationAlteration) -> str:
        return "Helsinki-lisä takaisinperintä"

    def get_billing_department(self, alteration: ApplicationAlteration) -> str:
        return self.billing_department

    def get_account_number(self, alteration: ApplicationAlteration) -> str:
        return self.account_number

    def get_handler_name(self, alteration: ApplicationAlteration) -> Union[str, None]:
        if alteration.handled_by:
            return f"{alteration.handled_by.get_full_name()}, {alteration.handled_by.email}"
        return ""

    def get_company_address(self, alteration: ApplicationAlteration) -> str:
        return alteration.application.company.get_full_address()

    def get_company_contact_person(self, alteration: ApplicationAlteration) -> str:
        application = alteration.application
        return f"{application.company_contact_person_first_name} {application.company_contact_person_last_name} \
            {application.company_contact_person_email} {application.company_contact_person_phone_number}"

    @property
    def CSV_COLUMNS(self):
        columns = [
            CsvColumn("Viitetiedot", "application.application_number"),
            CsvColumn(
                "Aikajakso, jolta tukea peritään takaisin", self.get_recovery_period
            ),
            CsvColumn("Summatieto", "recovery_amount"),
            CsvColumn("Laskutettavan virallinen nimi", "application.company.name"),
            CsvColumn("Laskutusosoite", self.get_company_address),
            CsvColumn("Y-tunnus", "application.company.business_id"),
            CsvColumn("Laskutettavan yhteyshenkilö", self.get_company_contact_person),
            CsvColumn("Verkkolaskuosoite/OVT-tunnus", "einvoice_address"),
            CsvColumn("Operaattori-/välittäjätunnus", "einvoice_provider_identifier"),
            CsvColumn("Tilitunniste", self.get_account_number),
            CsvColumn("Lisätietoja antaa", self.get_handler_name),
            CsvColumn("Otsikko", self.get_title),
            CsvColumn("Laskuttava yksikkö", self.get_billing_department),
        ]
        return columns

    def get_alterations(self):
        return self.application_alterations

    def get_row_items(self):
        for alteration in self.get_alterations():
            yield alteration

    def get_csv_cell_list_lines_generator(self):
        if self.get_alterations():
            yield from super().get_csv_cell_list_lines_generator()
        else:
            header_row = self._get_header_row()
            yield header_row
            yield ["Takaisinmaksuja ei löytynyt"] + [""] * (len(header_row) - 1)
