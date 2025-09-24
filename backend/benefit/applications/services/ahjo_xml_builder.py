import copy
import logging
import os
from dataclasses import dataclass
from datetime import date
from typing import List, Tuple, Union

from django.conf import settings
from django.template.loader import render_to_string
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from lxml import etree
from lxml.etree import XMLSchema, XMLSchemaParseError, XMLSyntaxError

from applications.enums import ApplicationStatus
from applications.models import (
    APPLICATION_LANGUAGE_CHOICES,
    AhjoDecisionText,
    Application,
)
from calculator.enums import RowType
from calculator.models import Calculation, CalculationRow

XML_VERSION = "<?xml version='1.0' encoding='UTF-8'?>"
XML_SCHEMA_PATH = os.path.join(
    settings.BASE_DIR, "applications", "resources", "hkilisa-paatosteksti.xsd"
)
SECRET_ATTACHMENT_TEMPLATE = "secret_decision.xml"

AhjoXMLString = str

LOGGER = logging.getLogger(__name__)


class AhjoXMLBuilder:
    def __init__(self, application: Application) -> None:
        self.application = application
        self.content_type = "application/xml"

    def generate_xml(self) -> AhjoXMLString:
        raise NotImplementedError("Subclasses must implement generate_xml")

    def generate_xml_file_name(self) -> str:
        raise NotImplementedError("Subclasses must implement generate_xml_file_name")

    def load_xsd_as_string(self, xsd_path: str) -> str:
        """
        Loads an XSD file from the resources directory of an app.
        """

        # Open the file and return its contents
        with open(xsd_path, "r") as file:
            return file.read()

    def validate_against_schema(
        self, xml_string: str, xsd_string: str
    ) -> Union[bool, None]:
        try:
            # Parse the XML string
            xml_doc = etree.fromstring(xml_string.encode("utf-8"))

            # Parse the XSD schema
            xsd_doc = etree.fromstring(xsd_string.encode("utf-8"))
            schema = XMLSchema(xsd_doc)

            # Validate the XML against the schema
            schema.assertValid(
                xml_doc
            )  # This will raise an exception if the document is not valid
            return True  # Return True if no exception was raised
        except XMLSchemaParseError as e:
            LOGGER.error(
                "Decision proposal XML Schema Error for application"
                f" {self.application.application_number}: {e}"
            )
            raise
        except XMLSyntaxError as e:
            LOGGER.error(
                "Decision proposal XML Syntax Error for application"
                f" {self.application.application_number}: {e}"
            )
            raise
        except etree.DocumentInvalid as e:
            LOGGER.error(
                "Decision proposal Validation Error for application"
                f" {self.application.application_number}: {e}"
            )
            raise


class AhjoPublicXMLBuilder(AhjoXMLBuilder):
    """Generates the XML for the public decision."""

    def __init__(
        self, application: Application, ahjo_decision_text: AhjoDecisionText
    ) -> None:
        super().__init__(application)
        self.ahjo_decision_text = ahjo_decision_text

    @staticmethod
    def sanitize_text_input(text: str) -> str:
        replacements = {"&nbsp;": " ", "\u200b": "", "\ufeff": "", "\u00a0": " "}

        for target, replacement in replacements.items():
            text = text.replace(target, replacement)

        text = text.replace("&", "&amp;")
        return text

    def generate_xml(self) -> AhjoXMLString:
        xml_string = (
            f"{XML_VERSION}<body>{self.ahjo_decision_text.decision_text}</body>"
        )
        xml_string = self.sanitize_text_input(xml_string)
        self.validate_against_schema(
            xml_string, self.load_xsd_as_string(XML_SCHEMA_PATH)
        )
        return xml_string

    def generate_xml_file_name(self) -> str:
        date_str = self.application.created_at.strftime("%d.%m.%Y")
        return (
            f"Hakemus {date_str} päätösteksti {self.application.application_number}.xml"
        )


@dataclass
class BenefitPeriodRow:
    start_date: date
    end_date: date
    amount_per_month: int
    total_amount: int


class AhjoSecretXMLBuilder(AhjoXMLBuilder):
    def generate_xml(self) -> AhjoXMLString:
        context = self.get_context_for_secret_xml()

        # Set the locale for this thread to the application's language
        translation.activate(self.application.applicant_language)

        xml_string = render_to_string(SECRET_ATTACHMENT_TEMPLATE, context)

        # Reset the locale to the default
        translation.deactivate()
        self.validate_against_schema(
            xml_string, self.load_xsd_as_string(XML_SCHEMA_PATH)
        )

        return xml_string

    def _get_period_rows_for_xml(
        self,
        calculation: Calculation,
    ) -> Tuple[
        CalculationRow,
        List[CalculationRow],
    ]:
        total_amount_row = calculation.rows.filter(
            row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR
        ).first()

        total_amount_row_with_int = copy.copy(total_amount_row)
        total_amount_row_with_int.amount = int(total_amount_row_with_int.amount)

        row_types_to_list = [
            RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
            RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ]
        calculation_rows = calculation.rows.filter(row_type__in=row_types_to_list)
        return total_amount_row_with_int, calculation_rows

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
                            amount_per_month=int(r.amount),
                            # the total amount is also in the next row
                            total_amount=int(calculation_rows[idx + 1].amount),
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
                amount_per_month=int(calculation_row_per_month.amount),
                total_amount=int(total_amount_row.amount),
            )
        )
        return calculation_rows_for_xml

    def get_context_for_secret_xml(self) -> dict:
        """Get the context for the secret XML."""
        context = {
            "application": self.application,
            "benefit_type": _("Salary Benefit"),
            # Ahjo only supports Finnish language
            "language": APPLICATION_LANGUAGE_CHOICES[0][0],
            "include_calculation_data": False,
        }
        if self.application.status == ApplicationStatus.ACCEPTED:
            context_rest = self.get_context_for_accepted_decision_xml()
            context = {**context, **context_rest}
            context["include_calculation_data"] = True
        return context

    def get_context_for_accepted_decision_xml(self) -> dict:
        total_amount_row, calculation_rows = self._get_period_rows_for_xml(
            self.application.calculation
        )
        # If there is only one period, we can combine the monthly eur row and the total
        # row into a single row
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
            "calculation_periods": calculation_data_for_xml,
            "total_amount_row": total_amount_row,
        }

    def generate_xml_file_name(self) -> str:
        date_str = self.application.created_at.strftime("%d.%m.%Y")
        return (
            f"Hakemus {date_str} päätöksen liite"
            f" {self.application.application_number}.xml"
        )
