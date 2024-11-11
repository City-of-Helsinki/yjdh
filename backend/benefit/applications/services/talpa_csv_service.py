import decimal
import logging

from django.conf import settings
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.utils import timezone, translation

from applications.models import Application
from applications.services.applications_csv_report import (
    ApplicationsCsvService,
    csv_default_column,
)
from applications.services.csv_export_base import CsvColumn, get_organization_type
from calculator.enums import InstalmentStatus

LOGGER = logging.getLogger(__name__)


class TalpaCsvService(ApplicationsCsvService):
    """Return only columns that are needed for Talpa"""

    def get_relevant_instalment_amount(
        self, application: Application
    ) -> decimal.Decimal:
        """Return the amount of the currently accepted and due instalment"""
        # TODO remove this flag when the feature is enabled ready for production
        if settings.PAYMENT_INSTALMENTS_ENABLED:
            try:
                instalment = application.calculation.instalments.get(
                    status=InstalmentStatus.ACCEPTED,
                    due_date__lte=timezone.now().date(),
                )
                return instalment.amount
            except ObjectDoesNotExist:
                LOGGER.error(
                    f"Valid payable Instalment not found for application {application.application_number}"
                )
            except MultipleObjectsReturned:
                LOGGER.error(
                    f"Multiple payable Instalments found for application \
{application.application_number}, there should be only one"
                )
        return application.calculation.calculated_benefit_amount

    @property
    def CSV_COLUMNS(self):
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
                "Helsinki-lisän määrä lopullinen", self.get_relevant_instalment_amount
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
