from django.utils import translation

from applications.services.applications_csv_report import (
    ApplicationsCsvService,
    csv_default_column,
)
from applications.services.csv_export_base import CsvColumn, get_organization_type


class TalpaCsvService(ApplicationsCsvService):
    """Return only columns that are needed for Talpa"""

    @property
    def CSV_COLUMNS(self):
        calculated_benefit_amount = "calculation.calculated_benefit_amount"

        columns = [
            CsvColumn("Hakemusnumero", "application_number"),
            CsvColumn("Työnantajan tyyppi", get_organization_type),
            CsvColumn("Työnantajan tilinumero", "company_bank_account_number"),
            CsvColumn("Työnantajan nimi", "company_name"),
            CsvColumn("Työnantajan Y-tunnus", "company.business_id"),
            CsvColumn("Työnantajan katuosoite", "effective_company_street_address"),
            CsvColumn("Työnantajan postinumero", "effective_company_postcode"),
            CsvColumn("Työnantajan postitoimipaikka", "effective_company_city"),
            csv_default_column(
                "Helsinki-lisän määrä lopullinen", calculated_benefit_amount
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
        ]
        return columns

    def get_row_items(self):
        with translation.override("fi"):
            for application in self.get_applications():
                application.application_row_idx = 1
                yield application
