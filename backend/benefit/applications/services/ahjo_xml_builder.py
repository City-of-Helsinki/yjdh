from dataclasses import dataclass
from datetime import date
from typing import List, Tuple

from django.template.loader import render_to_string
from django.utils import translation
from django.utils.translation import gettext_lazy as _

from applications.models import AhjoDecisionText, Application
from calculator.enums import RowType
from calculator.models import Calculation, CalculationRow

XML_VERSION = "<?xml version='1.0' encoding='UTF-8'?>"

AhjoXMLString = str


class AhjoXMLBuilder:
    def __init__(self, application: Application) -> None:
        self.application = application
        self.content_type = "application/xml"

    def generate_xml(self) -> AhjoXMLString:
        raise NotImplementedError("Subclasses must implement generate_xml")

    def generate_xml_file_name(self) -> str:
        raise NotImplementedError("Subclasses must implement generate_xml_file_name")


class AhjoPublicXMLBuilder(AhjoXMLBuilder):
    """Generates the XML for the public decision."""

    def __init__(
        self, application: Application, ahjo_decision_text: AhjoDecisionText
    ) -> None:
        super().__init__(application)
        self.ahjo_decision_text = ahjo_decision_text

    def generate_xml(self) -> AhjoXMLString:
        return f"{XML_VERSION}{self.ahjo_decision_text.decision_text}"

    def generate_xml_file_name(self) -> str:
        date_str = self.application.created_at.strftime("%d.%m.%Y")
        return f"Hakemus {date_str}, päätösteksti, {self.application.application_number}.xml"


SECRET_ATTACHMENT_TEMPLATE = "secret_decision.xml"


@dataclass
class BenefitPeriodRow:
    start_date: date
    end_date: date
    amount_per_month: float
    total_amount: float


class AhjoSecretXMLBuilder(AhjoXMLBuilder):
    def generate_xml(self) -> AhjoXMLString:
        context = self.get_context_for_secret_xml()
        # Set the locale for this thread to the application's language
        translation.activate(self.application.applicant_language)

        xml_content = render_to_string(SECRET_ATTACHMENT_TEMPLATE, context)

        # Reset the locale to the default
        translation.deactivate()
        return xml_content

    def _get_period_rows_for_xml(
        self,
        calculation: Calculation,
    ) -> Tuple[CalculationRow, List[CalculationRow],]:
        total_amount_row = calculation.rows.filter(
            row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR
        ).first()

        row_types_to_list = [
            RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
            RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ]
        calculation_rows = calculation.rows.filter(row_type__in=row_types_to_list)
        return total_amount_row, calculation_rows

    def _prepare_multiple_period_rows(
        self,
        calculation_rows: List[CalculationRow],
    ) -> List[BenefitPeriodRow]:
        """In the case  where there are multiple benefit periods,
        there will be multiple pairs of sub total rows and a corresponding monthly eur rows.
        Here we prepare the calculation rows per payment period by looping through the calculation rows
        and parsing the data into a list of BenefitPeriodRows.
        """
        calculation_rows_for_xml = []

        for idx, r in enumerate(calculation_rows):
            # check that we do not go out of bounds
            if 0 <= idx + 1 < len(calculation_rows):
                # the dates are in the next row, which is always a sub total row
                start_date = calculation_rows[idx + 1].start_date
                end_date = calculation_rows[idx + 1].end_date
                # get data only from rows that have start_date and end_date
                if start_date and end_date:
                    calculation_rows_for_xml.append(
                        BenefitPeriodRow(
                            start_date=start_date,
                            end_date=end_date,
                            amount_per_month=r.amount,
                            # the total amount is also in the next row
                            total_amount=calculation_rows[idx + 1].amount,
                        )
                    )

        return calculation_rows_for_xml

    def _prepare_single_period_row(
        self,
        calculation_row_per_month: CalculationRow,
        total_amount_row: CalculationRow,
    ) -> List[BenefitPeriodRow]:
        """In the case where there is only one benefit period,
        we combine the monthly eur row and the salary benefit total row into a single BenefitPeriodRow.
        """
        calculation_rows_for_xml = []
        calculation_rows_for_xml.append(
            BenefitPeriodRow(
                start_date=total_amount_row.start_date,
                end_date=total_amount_row.end_date,
                amount_per_month=calculation_row_per_month.amount,
                total_amount=total_amount_row.amount,
            )
        )
        return calculation_rows_for_xml

    def get_context_for_secret_xml(self) -> dict:
        total_amount_row, calculation_rows = self._get_period_rows_for_xml(
            self.application.calculation
        )
        # If there is only one period, we can combine the monthly eur row and the total row into a single row
        if (
            len(calculation_rows) == 1
            and calculation_rows[0].row_type == RowType.HELSINKI_BENEFIT_MONTHLY_EUR
        ):
            calculation_data_for_xml = self._prepare_single_period_row(
                calculation_rows[0], total_amount_row
            )
        else:
            calculation_data_for_xml = self._prepare_multiple_period_rows(
                calculation_rows
            )
        return {
            "application": self.application,
            "benefit_type": _("Salary Benefit"),
            "calculation_periods": calculation_data_for_xml,
            "total_amount_row": total_amount_row,
            "language": self.application.applicant_language,
        }

    def generate_xml_file_name(self) -> str:
        date_str = self.application.created_at.strftime("%d.%m.%Y")
        return (
            f"Hakemus {date_str}, liite 1/1, {self.application.application_number}.xml"
        )
