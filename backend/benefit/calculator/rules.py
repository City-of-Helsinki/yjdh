import collections
import datetime
import decimal

from applications.enums import ApplicationStatus, BenefitType, OrganizationType
from calculator.enums import RowType
from calculator.models import (
    DateRangeDescriptionRow,
    DescriptionRow,
    EmployeeBenefitMonthlyRow,
    EmployeeBenefitTotalRow,
    ManualOverrideTotalRow,
    PaySubsidy,
    PaySubsidyMonthlyRow,
    SalaryBenefitMonthlyRow,
    SalaryBenefitSubTotalRow,
    SalaryBenefitSumSubTotalsRow,
    SalaryBenefitTotalRow,
    SalaryCostsRow,
    StateAidMaxMonthlyRow,
    TotalDeductionsMonthlyRow,
    TrainingCompensationMonthlyRow,
)
from common.utils import pairwise
from django.db import transaction

BenefitSubRange = collections.namedtuple(
    "BenefitSubRange",
    ["start_date", "end_date", "pay_subsidy", "training_compensation"],
)


class HelsinkiBenefitCalculator:
    def __init__(self, calculation):
        self.calculation = calculation
        self._row_counter = 0

    @staticmethod
    def get_calculator(calculation):
        # in future, one might use e.g. application date to determine the correct calculator
        if calculation.override_monthly_benefit_amount is not None:
            return ManualOverrideCalculator(calculation)
        elif calculation.application.benefit_type == BenefitType.SALARY_BENEFIT:
            return SalaryBenefitCalculator2021(calculation)
        elif calculation.application.benefit_type == BenefitType.EMPLOYMENT_BENEFIT:
            return EmployeeBenefitCalculator2021(calculation)
        else:
            return DummyBenefitCalculator(calculation)

    def get_sub_total_ranges(self):
        # return a list of BenefitSubRange(start_date, end_date, pay_subsidy, training_compensation)
        # that require a separate calculation.
        # date range are inclusive

        pay_subsidies = PaySubsidy.merge_compatible_subsidies(
            list(self.calculation.application.pay_subsidies.order_by("start_date"))
        )
        training_compensations = list(
            self.calculation.application.training_compensations.order_by("start_date")
        )

        change_days = {
            self.calculation.start_date,
            self.calculation.end_date + datetime.timedelta(days=1),
        }
        for item in pay_subsidies + training_compensations:
            if item.start_date > self.calculation.start_date:
                change_days.add(item.start_date)
            if item.end_date < self.calculation.end_date:
                # the end_date of PaySubsidy and TrainingCompensation is the last day it is in effect so the
                # change day is the day after end_date
                change_days.add(item.end_date + datetime.timedelta(days=1))

        def get_item_in_effect(items, day):
            for item in items:
                if item.start_date <= day <= item.end_date:
                    return item
            return None

        ranges = []
        assert len(change_days) >= 2
        for range_start, range_end in pairwise(sorted(change_days)):
            pay_subsidy = get_item_in_effect(pay_subsidies, range_start)
            training_compensation = get_item_in_effect(
                training_compensations, range_start
            )
            ranges.append(
                BenefitSubRange(
                    range_start,
                    range_end - datetime.timedelta(days=1),  # make the range inclusive
                    pay_subsidy,
                    training_compensation,
                )
            )
        return ranges

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
        return row

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


class ManualOverrideCalculator(HelsinkiBenefitCalculator):
    def create_rows(self):
        self._create_row(ManualOverrideTotalRow)


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

    def create_deduction_rows(self, benefit_sub_range):
        if benefit_sub_range.pay_subsidy or benefit_sub_range.training_compensation:
            self._create_row(
                DescriptionRow,
                description_fi_template="Vähennettävät korvaukset / kk",
            )
        if benefit_sub_range.pay_subsidy:
            pay_subsidy_monthly_eur = self._create_row(
                PaySubsidyMonthlyRow,
                pay_subsidy=benefit_sub_range.pay_subsidy,
                max_subsidy=self.get_maximum_monthly_pay_subsidy(),
            ).amount
        else:
            pay_subsidy_monthly_eur = 0

        if (
            benefit_sub_range.training_compensation
            and benefit_sub_range.training_compensation.monthly_amount > 0
        ):
            training_compensation_monthly_eur = self._create_row(
                TrainingCompensationMonthlyRow,
                training_compensation=benefit_sub_range.training_compensation,
            ).amount
        else:
            training_compensation_monthly_eur = 0

        monthly_deductions = pay_subsidy_monthly_eur + training_compensation_monthly_eur

        if (
            benefit_sub_range.pay_subsidy
            and benefit_sub_range.training_compensation
            and benefit_sub_range.training_compensation.monthly_amount > 0
        ):
            # as per UI design, create the totals row even if the amount of training compensation
            # is zero, if the TrainingCompensation has been created
            self._create_row(
                TotalDeductionsMonthlyRow, monthly_deductions=monthly_deductions
            )

        return monthly_deductions

    def create_rows(self):
        date_ranges = self.get_sub_total_ranges()
        assert date_ranges
        self._create_row(SalaryCostsRow)
        self._create_row(StateAidMaxMonthlyRow)

        for sub_range in date_ranges:
            if len(date_ranges) > 1:
                self._create_row(
                    DateRangeDescriptionRow,
                    start_date=sub_range.start_date,
                    end_date=sub_range.end_date,
                    prefix_text="Ajalta",
                )
            monthly_deductions = self.create_deduction_rows(sub_range)

            self._create_row(
                SalaryBenefitMonthlyRow,
                max_benefit=self.SALARY_BENEFIT_MAX,
                monthly_deductions=monthly_deductions,
            )
            self._create_row(
                SalaryBenefitSubTotalRow,
                start_date=sub_range.start_date,
                end_date=sub_range.end_date,
            )

        if len(date_ranges) > 1:
            self._create_row(
                DateRangeDescriptionRow,
                start_date=date_ranges[0].start_date,
                end_date=date_ranges[-1].end_date,
                prefix_text="Koko ajalta",
            )
            self._create_row(SalaryBenefitSumSubTotalsRow)
        else:
            self._create_row(SalaryBenefitTotalRow)


class EmployeeBenefitCalculator2021(HelsinkiBenefitCalculator):
    """
    Calculation of employee benefit, according to rules in effect 2021 (and possibly onwards)
    """

    EMPLOYEE_BENEFIT_AMOUNT_PER_MONTH = 500

    def create_rows(self):
        self._create_row(EmployeeBenefitMonthlyRow)
        self._create_row(EmployeeBenefitTotalRow)
