import collections
import datetime
import decimal
import logging
from typing import Union

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from applications.enums import ApplicationStatus, BenefitType, PaySubsidyGranted
from calculator.enums import DescriptionType, InstalmentStatus, RowType
from calculator.models import (
    Calculation,
    CalculationRow,
    DateRangeDescriptionRow,
    DescriptionRow,
    EmployeeBenefitMonthlyRow,
    EmployeeBenefitTotalRow,
    Instalment,
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

LOGGER = logging.getLogger(__name__)
BenefitSubRange = collections.namedtuple(
    "BenefitSubRange",
    ["start_date", "end_date", "pay_subsidy", "training_compensation"],
)


class HelsinkiBenefitCalculator:
    def __init__(self, calculation: Calculation):
        self.calculation = calculation
        self._row_counter = 0
        self.instalment_threshold = settings.INSTALMENT_THRESHOLD
        self.first_instalment_limit = settings.FIRST_INSTALMENT_LIMIT

    def _get_change_days(
        self, pay_subsidies, training_compensations, start_date, end_date
    ):
        change_days = {start_date, end_date + datetime.timedelta(days=1)}
        for item in pay_subsidies + training_compensations:
            if item.start_date is not None and item.start_date > start_date:
                change_days.add(item.start_date)
            if item.end_date is not None and item.end_date < end_date:
                change_days.add(item.end_date + datetime.timedelta(days=1))
        return change_days

    def _get_item_in_effect(
        self, items: list[PaySubsidy], day: datetime.date
    ) -> Union[PaySubsidy, None]:
        """Return the first item in the list whose start date is less than or equal to the given day,
        and whose end date is greater than or equal to the given day.
        If no such item is found, it returns None."""
        for item in items:
            if (
                item.start_date is not None
                and item.end_date is not None
                and (item.start_date <= day <= item.end_date)
            ):
                return item
        return None

    @staticmethod
    def get_calculator(calculation: Calculation):
        # in future, one might use e.g. application date to determine the correct calculator
        if calculation.override_monthly_benefit_amount is not None:
            return ManualOverrideCalculator(calculation)
        elif calculation.application.benefit_type == BenefitType.SALARY_BENEFIT:
            return SalaryBenefitCalculator2023(calculation)
        elif calculation.application.benefit_type == BenefitType.EMPLOYMENT_BENEFIT:
            return EmployeeBenefitCalculator2021(calculation)
        else:
            return DummyBenefitCalculator(calculation)

    def get_sub_total_ranges(self):
        """return a list of BenefitSubRange(start_date, end_date, pay_subsidy, training_compensation)
        that require a separate calculation.
        date range are inclusive"""

        if self.calculation.start_date is None or self.calculation.end_date is None:
            raise ValueError(
                "Cannot get sub total range of calculation start_date or end_date"
            )
        pay_subsidies = PaySubsidy.merge_compatible_subsidies(
            list(self.calculation.application.pay_subsidies.order_by("start_date"))
        )
        training_compensations = list(
            self.calculation.application.training_compensations.order_by("start_date")
        )
        change_days = self._get_change_days(
            pay_subsidies,
            training_compensations,
            self.calculation.start_date,
            self.calculation.end_date,
        )

        ranges = []
        assert len(change_days) >= 2
        for range_start, range_end in pairwise(sorted(change_days)):
            pay_subsidy = self._get_item_in_effect(pay_subsidies, range_start)
            training_compensation = self._get_item_in_effect(
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

        if (
            ranges[-1].end_date != self.calculation.end_date
            or ranges[0].start_date != self.calculation.start_date
        ):
            raise ValueError("Error in range of calculation.start_date / end_date")

        return ranges

    def get_amount(self, row_type: RowType, default=None):
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

    def can_calculate(self):
        if not all(
            [
                self.calculation.start_date,
                self.calculation.end_date,
            ]
        ):
            return False
        return True

    def create_instalments(self, total_benefit_amount: decimal.Decimal) -> None:
        """Create one instalment in the usual case,
        two instalments if the benefit amount exceeds the threshold,
        with the second instalment due 6 months later.
        """
        instalments = self._calculate_instalment_amounts(total_benefit_amount)
        self._create_instalments(instalments)

    def _calculate_instalment_amounts(
        self, total_benefit_amount: decimal.Decimal
    ) -> list[tuple[int, decimal.Decimal, datetime.datetime]]:
        """Calculate the number of instalments and their amounts based on the total benefit.
        Returns a list of tuples containing (instalment_number, amount, due_date).
        If the total benefit is less or equal to the instalment threshold, a single instalment is created.
        If not, two instalments are created, with the amount of
        the first instalment being equal to the FIRST_INSTALMENT_LIMIT,
        and the second being equal to the rest of the total.
        """
        if total_benefit_amount <= self.instalment_threshold:
            return [
                (1, total_benefit_amount, timezone.now(), InstalmentStatus.ACCEPTED)
            ]

        first_instalment_amount = self.first_instalment_limit
        second_instalment_amount = total_benefit_amount - first_instalment_amount

        return [
            (1, first_instalment_amount, timezone.now(), InstalmentStatus.ACCEPTED),
            (
                2,
                second_instalment_amount,
                timezone.now() + datetime.timedelta(days=181),
                InstalmentStatus.WAITING,
            ),
        ]

    def _create_instalments(
        self,
        instalments: list[
            tuple[int, decimal.Decimal, datetime.datetime, InstalmentStatus]
        ],
    ) -> None:
        """Create instalment objects from the provided instalment data."""
        for instalment_number, amount, due_date, status in instalments:
            Instalment.objects.create(
                calculation=self.calculation,
                instalment_number=instalment_number,
                amount=amount,
                due_date=due_date,
                status=status,
            )

    @transaction.atomic
    def calculate(self, override_status=False):
        if (
            self.calculation.application.status in self.CALCULATION_ALLOWED_STATUSES
            or override_status
        ):
            self.calculation.rows.all().delete()
            self.calculation.instalments.all().delete()
            if self.can_calculate():
                self.create_rows()
                # the total benefit amount is stored in Calculation model, for easier processing.
                total_benefit_amount = self.get_amount(
                    RowType.HELSINKI_BENEFIT_TOTAL_EUR
                )
                self.calculation.calculated_benefit_amount = total_benefit_amount
                self.create_instalments(total_benefit_amount)
            else:
                self.calculation.calculated_benefit_amount = None
            self.calculation.save()

    def _create_row(self, row_class: CalculationRow, **kwargs):
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

    def get_amount(self, row_type: RowType, default=None):
        return decimal.Decimal(0)


class ManualOverrideCalculator(HelsinkiBenefitCalculator):
    def create_rows(self):
        self._create_row(
            ManualOverrideTotalRow,
            start_date=self.calculation.start_date,
            end_date=self.calculation.end_date,
        )


class SalaryBenefitCalculator2023(HelsinkiBenefitCalculator):
    """
    Calculation of salary benefit, according to rules in effect starting from 1.7.2023
    """

    # The maximum amount of pay subsidy depends on the pay subsidy percent in the pay subsidy decision.
    PAY_SUBSIDY_MAX_FOR_100_PERCENT = 2020
    PAY_SUBSIDY_MAX_FOR_70_PERCENT = 1770
    PAY_SUBSIDY_MAX_FOR_50_PERCENT = 1260
    SALARY_BENEFIT_MAX = 800
    SALARY_BENEFIT_NEW_MAX = settings.SALARY_BENEFIT_NEW_MAX

    @property
    def is_subsidised(self) -> bool:
        return (
            self.calculation.application.pay_subsidy_granted
            in [PaySubsidyGranted.GRANTED, PaySubsidyGranted.GRANTED_AGED]
            or self.calculation.application.pay_subsidies.exists()
        )

    @property
    def max_monthly_benefit(self) -> int:
        """If the pay subsidy or subsidy for persons aged 55 or older has been granted,
        the maximum amount of the salary benefit is 800 euros per month.
        Otherwise it will be the new maximum amount."""
        # Enable the new maximum amount only if the instalments are enabled
        if settings.PAYMENT_INSTALMENTS_ENABLED is False:
            return self.SALARY_BENEFIT_MAX

        if self.is_subsidised:
            return int(self.SALARY_BENEFIT_MAX)
        else:
            return int(self.SALARY_BENEFIT_NEW_MAX)

    def can_calculate(self):
        if not all(
            [
                self.calculation.start_date,
                self.calculation.end_date,
                self.calculation.state_aid_max_percentage,
            ]
        ):
            return False
        for pay_subsidy in self.calculation.application.pay_subsidies.all():
            if not all([pay_subsidy.start_date, pay_subsidy.end_date]):
                return False
        return True

    def get_maximum_monthly_pay_subsidy(self, pay_subsidy):
        if pay_subsidy.pay_subsidy_percent == 100:
            return self.PAY_SUBSIDY_MAX_FOR_100_PERCENT
        elif pay_subsidy.pay_subsidy_percent == 70:
            return self.PAY_SUBSIDY_MAX_FOR_70_PERCENT
        else:
            return self.PAY_SUBSIDY_MAX_FOR_50_PERCENT

    def create_deduction_rows(self, benefit_sub_range):
        # Create the rows for the calculation
        # that display the deduction amounts for pay subsidy and training compensation
        if benefit_sub_range.pay_subsidy or benefit_sub_range.training_compensation:
            self._create_row(
                DescriptionRow,
                description_fi_template="Vähennettävät korvaukset / kk",
                description_type=DescriptionType.DEDUCTION,
            )
        if benefit_sub_range.pay_subsidy:
            pay_subsidy_monthly_eur = self._create_row(
                PaySubsidyMonthlyRow,
                pay_subsidy=benefit_sub_range.pay_subsidy,
                max_subsidy=self.get_maximum_monthly_pay_subsidy(
                    benefit_sub_range.pay_subsidy
                ),
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
                    description_type=DescriptionType.DATE,
                )
            monthly_deductions = self.create_deduction_rows(sub_range)

            self._create_row(
                SalaryBenefitMonthlyRow,
                max_benefit=self.max_monthly_benefit,
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
                start_date=self.calculation.start_date,
                end_date=self.calculation.end_date,
                description_type=DescriptionType.DATE_TOTAL,
                prefix_text="Koko ajalta",
            )
            self._create_row(
                SalaryBenefitSumSubTotalsRow,
                start_date=self.calculation.start_date,
                end_date=self.calculation.end_date,
            )
        else:
            self._create_row(
                SalaryBenefitTotalRow,
                start_date=self.calculation.start_date,
                end_date=self.calculation.end_date,
                description_type=DescriptionType.DEDUCTION,
            )


class EmployeeBenefitCalculator2021(HelsinkiBenefitCalculator):
    """
    Calculation of employee benefit, according to rules in effect 2021 (and possibly onwards)
    """

    EMPLOYEE_BENEFIT_AMOUNT_PER_MONTH = 500

    def create_rows(self):
        self._create_row(EmployeeBenefitMonthlyRow)
        self._create_row(
            EmployeeBenefitTotalRow,
            start_date=self.calculation.start_date,
            end_date=self.calculation.end_date,
        )
