from django.utils import translation

from applications.services.applications_csv_report import (
    ApplicationsCsvService,
    csv_default_column,
)
from applications.services.csv_export_base import CsvColumn


class ApplicationsDeminimisCsvService(ApplicationsCsvService):
    """
    This subclass customizes the csv_columns for a de Minimis export format.
    """

    @property
    def csv_columns(self):

        columns = [
            CsvColumn("Hakemusnumero", "application_number"),
            CsvColumn("Työnantajan nimi", "company.name"),
            CsvColumn("Työnantajan Y-tunnus", "company.business_id"),
            csv_default_column("TOL-koodi", "company.industry_code"),
            csv_default_column("Päätöspäivä", "batch.decision_date"),
            csv_default_column(
                    "HL-erä-1", self.get_instalment_1_amount
                ),
            csv_default_column(
                    "HL-erä-2", self.get_instalment_2_amount
                ),
        ]

        return columns

    def get_row_items(self):
        with translation.override("fi"):
            for application in self.get_applications():
                application.application_row_idx = 1
                yield application
