from datetime import datetime
from typing import Union

from django.conf import settings
from django.utils import translation

from applications.enums import ApplicationBatchStatus
from applications.models import Application
from applications.services.applications_csv_report import (
    ApplicationsCsvService,
    csv_default_column,
    format_bool,
    format_datetime,
    get_application_origin_label,
    get_benefit_type_label,
    get_submitted_at_date,
)
from applications.services.csv_export_base import CsvColumn, get_organization_type


class ApplicationsPowerBiCsvService(ApplicationsCsvService):
    """
    This subclass customizes the csv_columns for a different export format.
    """

    def get_completed_in_talpa_date(
        self, application: Application
    ) -> Union[datetime, None]:
        if (
            application.batch
            and application.batch.status == ApplicationBatchStatus.COMPLETED
        ):
            return application.batch.modified_at.strftime("%d.%m.%Y")
        return None

    def get_alteration_amount(self, application: Application) -> float:
        sum = 0
        for alteration in application.alteration_set.all():
            # Only include alterations with recovery amount over 20€
            if alteration.recovery_amount and alteration.recovery_amount > 20:
                sum += alteration.recovery_amount
        return sum

    @property
    def csv_columns(self):
        calculated_benefit_amount = "calculation.calculated_benefit_amount"

        columns = [
            CsvColumn("Hakemusnumero", "application_number"),
            CsvColumn("Työnantajan tyyppi", get_organization_type),
            CsvColumn("Työnantajan Y-tunnus", "company.business_id"),
            csv_default_column(
                "Helsinki-lisän määrä lopullinen", calculated_benefit_amount
            ),
            csv_default_column("Päätöspäivä", "batch.decision_date"),
            CsvColumn("Hakemuksen tila", "status"),
            CsvColumn(
                "Hakemuksen tyyppi", "application_origin", get_application_origin_label
            ),
            CsvColumn(
                "Hakemus saapunut",
                get_submitted_at_date,
                format_datetime,
            ),
            csv_default_column("Haettava lisä", "benefit_type", get_benefit_type_label),
            csv_default_column("Haettu alkupäivä", "start_date"),
            csv_default_column("Haettu päättymispäivä", "end_date"),
            CsvColumn("Työnantajan yhtiömuoto", "company_form"),
            CsvColumn("Työnantajan yhtiömuoto (YTJ-numero)", "company_form_code"),
            CsvColumn(
                "Yhdistys jolla taloudellista toimintaa?",
                "association_has_business_activities",
                format_bool,
            ),
            CsvColumn("Hakijan kieli", "applicant_language"),
            csv_default_column("Palkkatuki myönnetty?", "pay_subsidy_granted", str),
            csv_default_column("Palkkatukiprosentti", "pay_subsidy_percent"),
            csv_default_column(
                "Oppisopimus?",
                "apprenticeship_program",
                format_bool,
                default_value=None,
            ),
            csv_default_column(
                "Työntekijän kuukausipalkka (hakijalta)", "employee.monthly_pay"
            ),
            csv_default_column(
                "Työntekijän lomaraha (hakijalta)", "employee.vacation_money"
            ),
            csv_default_column(
                "Työntekijän muut kulut (hakijalta)", "employee.other_expenses"
            ),
            csv_default_column("Työntekijän työtunnit", "employee.working_hours"),
            csv_default_column("Työntekijän syntymäpäivä", "employee.birthday"),
            csv_default_column(
                "Helsinki-lisän määrä lopullinen", calculated_benefit_amount
            ),
            csv_default_column("Laskelman alkupäivä", "calculation.start_date"),
            csv_default_column("Laskelman päättymispäivä", "calculation.end_date"),
            csv_default_column("Käsittelypäivä", "handled_at", format_datetime),
            csv_default_column(
                "Valtiotukimaksimi", "calculation.state_aid_max_percentage"
            ),
            csv_default_column("Laskelman lopputulos", calculated_benefit_amount),
            csv_default_column(
                "Myönnetään de minimis -tukena?",
                "calculation.granted_as_de_minimis_aid",
                format_bool,
                default_value=None,
            ),
            csv_default_column("Päätöspäivä", "batch.decision_date"),
            csv_default_column(
                "Talpaan viennin päivä", self.get_completed_in_talpa_date
            ),
            csv_default_column("Takaisinlaskutettu", self.get_alteration_amount),
        ]

        if settings.PAYMENT_INSTALMENTS_ENABLED:
            columns.append(
                csv_default_column(
                    "Myönnetty maksuerä 1", self.get_instalment_1_amount
                ),
            )
            columns.append(
                csv_default_column(
                    "Myönnetty maksuerä 2", self.get_instalment_2_amount
                ),
            )
            columns.append(
                csv_default_column(
                    "Maksettava maksuerä 2",
                    self.get_instalment_2_amount_after_recoveries,
                ),
            )
            columns.append(
                csv_default_column(
                    "Maksuerän 2 maksupäivä", self.get_instalment_2_due_date
                ),
            )

        return columns

    def get_row_items(self):
        with translation.override("fi"):
            for application in self.get_applications():
                application.application_row_idx = 1
                yield application
