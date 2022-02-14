import csv
import datetime
import decimal
import operator
from dataclasses import dataclass
from io import StringIO
from typing import Callable, Union

from applications.enums import OrganizationType


@dataclass
class TalpaColumn:
    heading: str
    cell_data_source: str
    formatter: Union[Callable, None] = None


def get_organization_type(application):
    return str(
        OrganizationType.resolve_organization_type(application.company.company_form)
    )


class TalpaService:

    CSV_DELIMITER = ";"
    FILE_ENCODING = "utf-8"

    TALPA_COLUMNS = [
        TalpaColumn("Application number", "application_number"),
        TalpaColumn("Organization type", get_organization_type),
        TalpaColumn("Bank account", "company_bank_account_number"),
        TalpaColumn("Name of Employer", "company_name"),
        TalpaColumn("Business ID", "company.business_id"),
        TalpaColumn("Address of the employer", "effective_company_street_address"),
        TalpaColumn("Postal code of the employer", "effective_company_postcode"),
        TalpaColumn("City of the employer", "effective_company_city"),
        TalpaColumn("Amount of benefit", "calculation.calculated_benefit_amount"),
        TalpaColumn("Title of decision maker", "batch.decision_maker_title"),
        TalpaColumn("Section of the law", "batch.section_of_the_law"),
        TalpaColumn("Date of the decision", "batch.decision_date"),
        TalpaColumn("Name of the decision maker", "batch.decision_maker_name"),
        TalpaColumn("Expert inspector", "batch.expert_inspector_name"),
        TalpaColumn("Email of the expert inspector", "batch.expert_inspector_email"),
    ]

    def _get_header_row(self):
        return [col.heading for col in self.TALPA_COLUMNS]

    def __init__(self, application_batches):
        self.application_batches = application_batches

    def write_talpa_csv_file(self, path):
        csv_string = self.get_talpa_csv_string()
        with open(path, encoding=self.FILE_ENCODING, mode="w") as f:
            f.write(csv_string)

    def get_talpa_csv_string(self):
        return self._make_csv(self.get_talpa_lines())

    def get_applications(self):
        from applications.models import Application

        return Application.objects.filter(batch__in=self.application_batches).order_by(
            "company__name", "application_number"
        )

    def get_talpa_lines(self):
        lines = [self._get_header_row()]

        for application in self.get_applications():
            line = []
            for column in self.TALPA_COLUMNS:
                if callable(column.cell_data_source):
                    cell_value = column.cell_data_source(application)
                else:
                    cell_value = operator.attrgetter(column.cell_data_source)(
                        application
                    )
                if column.formatter:
                    # most common case: a dotted property like company.name
                    cell_value = column.formatter(cell_value)
                if not isinstance(
                    cell_value, (str, int, decimal.Decimal, datetime.date)
                ):
                    raise ValueError("Invalid type in Talpa integration")
                line.append(cell_value)
            lines.append(line)
        return lines

    def _make_csv(self, lines):
        if len(lines) == 0:
            return ""
        first_length = len(lines[0])
        assert all([len(line) == first_length for line in lines])

        io = StringIO()
        csv_writer = csv.writer(
            io, delimiter=self.CSV_DELIMITER, quoting=csv.QUOTE_NONNUMERIC
        )
        for line in lines:
            csv_writer.writerow(line)

        return io.getvalue()
