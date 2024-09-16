from applications.services.applications_csv_report import (  # csv_default_column,
    ApplicationsCsvService,
)

# from applications.services.csv_export_base import CsvColumn


class ApplicationsPowerBiCsvService(ApplicationsCsvService):
    """
    This subclass customizes the CSV_COLUMNS for a different export format.
    """

    @property
    def CSV_COLUMNS(self):
        """
        Customize the CSV columns but also return the parent class's columns.
        """
        # Get the parent class CSV_COLUMNS
        parent_columns = super().CSV_COLUMNS

        # Define custom columns to add to or modify the parent columns
        custom_columns = [
            #    CsvColumn("Custom Column 1", "custom_field_1"),
            #    CsvColumn("Custom Column 2", "custom_field_2"),
        ]

        return parent_columns + custom_columns
