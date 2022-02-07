from applications.models import Application
from applications.services.csv_export_base import (
    CsvColumn,
    CsvExportBase,
    get_organization_type,
)


class TalpaService(CsvExportBase):
    def __init__(self, application_batches):
        self.application_batches = application_batches

    CSV_COLUMNS = [
        CsvColumn("Application number", "application_number"),
        CsvColumn("Organization type", get_organization_type),
        CsvColumn("Bank account", "company_bank_account_number"),
        CsvColumn("Name of Employer", "company_name"),
        CsvColumn("Business ID", "company.business_id"),
        CsvColumn("Address of the employer", "effective_company_street_address"),
        CsvColumn("Postal code of the employer", "effective_company_postcode"),
        CsvColumn("City of the employer", "effective_company_city"),
        CsvColumn("Amount of benefit", "calculation.calculated_benefit_amount"),
        CsvColumn("Title of decision maker", "batch.decision_maker_title"),
        CsvColumn("Section of the law", "batch.section_of_the_law"),
        CsvColumn("Date of the decision", "batch.decision_date"),
        CsvColumn("Name of the decision maker", "batch.decision_maker_name"),
        CsvColumn("Expert inspector", "batch.expert_inspector_name"),
        CsvColumn("Email of the expert inspector", "batch.expert_inspector_email"),
    ]

    def get_applications(self):
        return Application.objects.filter(batch__in=self.application_batches).order_by(
            "company__name", "application_number"
        )

    def get_row_items(self):
        return self.get_applications()
