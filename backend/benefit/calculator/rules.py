import collections
import datetime
import decimal

from applications.enums import ApplicationStatus, BenefitType, OrganizationType
from calculator.enums import RowType
from calculator.models import (  # SalaryBenefitPaySubsidySubTotalRow,
    DescriptionRow,
    EmployeeBenefitMonthlyRow,
    EmployeeBenefitTotalRow,
    PaySubsidyMonthlyRow,
    SalaryBenefitMonthlyRow,
    SalaryBenefitTotalRow,
    SalaryCostsRow,
    StateAidMaxMonthlyRow,
)
from django.db import transaction

BenefitSubRange = collections.namedtuple(
    "BenefitSubRange", ["start_date", "end_date", "pay_subsidy"]
)


class HelsinkiBenefitCalculator:
    def __init__(self, calculation):
        self.calculation = calculation
        self._row_counter = 0

    @staticmethod
    def get_calculator(calculation):
        # in future, one might use e.g. application date to determine the correct calculator
        if calculation.application.benefit_type == BenefitType.SALARY_BENEFIT:
            return SalaryBenefitCalculator2021(calculation)
        elif calculation.application.benefit_type == BenefitType.EMPLOYMENT_BENEFIT:
            return EmployeeBenefitCalculator2021(calculation)
        else:
            return DummyBenefitCalculator(calculation)

    def get_sub_total_ranges(self):
        # return a list of (start_date, end_date, pay_subsidy) that require a separate calculation.
        # date range are inclusive
        if pay_subsidies := list(
            self.calculation.application.pay_subsidies.order_by("start_date")
        ):
            ranges = []
            if self.calculation.start_date < pay_subsidies[0].start_date:
                ranges.append(
                    BenefitSubRange(
                        self.calculation.start_date,
                        pay_subsidies[0].start_date - datetime.timedelta(days=1),
                        None,
                    )
                )
            for pay_subsidy in pay_subsidies:
                # pay subsidies must not have gaps
                ranges.append(
                    BenefitSubRange(
                        pay_subsidy.start_date, pay_subsidy.end_date, pay_subsidy
                    )
                )
            if self.calculation.end_date > pay_subsidies[-1].end_date:
                ranges.append(
                    BenefitSubRange(
                        pay_subsidies[-1].end_date + datetime.timedelta(days=1),
                        self.calculation.end_date,
                        None,
                    )
                )
            return ranges
        else:
            return [
                BenefitSubRange(
                    self.calculation.start_date, self.calculation.end_date, None
                )
            ]

    def get_amount(self, row_type, default=None):
        # This function is used by the various CalculationRow to retrieve a previously calculated value
        row = (
            self.calculation.rows.order_by("-ordering")
            .filter(row_type=row_type)
            .first()
        )
        if not row and default is not None:
            return default
        assert row, f"Internal error, {row_type} not found"
        return row.amount

    # if calculation is enabled for non-handler users, need to change this
    # locked applications (transferred to Ahjo) should never be re-calculated.
    CALCULATION_ALLOWED_STATUSES = [
        ApplicationStatus.RECEIVED,
        ApplicationStatus.HANDLING,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
    ]

    @transaction.atomic
    def calculate(self):
        if self.calculation.application.status in self.CALCULATION_ALLOWED_STATUSES:
            self.calculation.rows.all().delete()
            self.create_rows()
            # the total benefit amount is stored in Calculation model, for easier processing.
            self.calculation.calculated_benefit_amount = self.get_amount(
                RowType.HELSINKI_BENEFIT_TOTAL_EUR
            )
            self.calculation.save()

    def _create_row(self, row_class, **kwargs):
        row = row_class(
            calculation=self.calculation, ordering=self._row_counter, **kwargs
        )
        self._row_counter += 1
        row.update_row()
        row.save()

    def create_rows(self):
        pass


class DummyBenefitCalculator(HelsinkiBenefitCalculator):
    def create_rows(self):
        self._create_row(
            DescriptionRow,
            description_fi_template="Laskentalogiikka ei käytössä",
        )
        self._create_row(
            SalaryBenefitTotalRow,
        )

    def get_amount(self, row_type, default=None):
        return decimal.Decimal(0)


class SalaryBenefitCalculator2021(HelsinkiBenefitCalculator):
    """
    Calculation of salary benefit, according to rules in effect 2021 (and possibly onwards)
    """

    ASSOCIATION_PAY_SUBSIDY_MAX = 1800
    COMPANY_PAY_SUBSIDY_MAX = 1400
    SALARY_BENEFIT_MAX = 800

    def get_maximum_monthly_pay_subsidy(self):
        if (
            OrganizationType.resolve_organization_type(
                self.calculation.application.company.company_form
            )
            == "company"
            or self.calculation.application.association_has_business_activities
        ):
            return self.COMPANY_PAY_SUBSIDY_MAX
        else:
            return self.ASSOCIATION_PAY_SUBSIDY_MAX

    def create_rows(self):
        date_ranges = self.get_sub_total_ranges()
        assert date_ranges
        if len(date_ranges) == 1:
            self._create_row(SalaryCostsRow)
            self._create_row(StateAidMaxMonthlyRow)
            if date_ranges[0].pay_subsidy:
                self._create_row(
                    DescriptionRow,
                    description_fi_template="Vähennettävät korvaukset / kk",
                )
                self._create_row(
                    PaySubsidyMonthlyRow,
                    pay_subsidy=date_ranges[0].pay_subsidy,
                    max_subsidy=self.get_maximum_monthly_pay_subsidy(),
                )
            self._create_row(
                SalaryBenefitMonthlyRow, max_benefit=self.SALARY_BENEFIT_MAX
            )
            self._create_row(SalaryBenefitTotalRow)
        else:
            for start_date, end_date, pay_subsidy in date_ranges:
                pass
            raise Exception("Complex cases TBD")


class EmployeeBenefitCalculator2021(HelsinkiBenefitCalculator):
    """
    Calculation of employee benefit, according to rules in effect 2021 (and possibly onwards)
    """

    EMPLOYEE_BENEFIT_AMOUNT_PER_MONTH = 500

    def create_rows(self):
        self._create_row(EmployeeBenefitMonthlyRow)
        self._create_row(EmployeeBenefitTotalRow)
