import decimal
import operator
from datetime import timedelta

from babel.dates import format_date
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField, SearchField
from simple_history.models import HistoricalRecords

from applications.enums import ApplicationAlterationState
from applications.models import PAY_SUBSIDY_PERCENT_CHOICES, Application
from calculator.enums import DescriptionType, InstalmentStatus, RowType
from common.exceptions import BenefitAPIException
from common.utils import (
    DurationMixin,
    date_range_overlap,
    duration_in_months,
    nested_getattr,
    to_decimal,
)
from companies.models import Company
from shared.models.abstract_models import TimeStampedModel, UUIDModel

STATE_AID_MAX_PERCENTAGE_CHOICES = (
    (50, "50%"),
    (70, "70%"),
    (100, "100%"),
)


class CalculationManager(models.Manager):
    def create_for_application(
        self, application: Application, **kwargs
    ) -> "Calculation":
        """
        Create Calculation object for application with Calculation attributes optionally
        overridden by the kwargs values.
        """
        if hasattr(application, "calculation"):
            raise BenefitAPIException(_("Calculation already exists"))
        calculation = Calculation(application=application)
        calculation.reset_values()
        for attribute_name, attribute_value in kwargs.items():
            setattr(calculation, attribute_name, attribute_value)
        calculation.save()
        return calculation


class Calculation(UUIDModel, TimeStampedModel, DurationMixin):
    """
    Data model for Helsinki benefit calculations

    There can be only one calculation per application.

    Some fields have a corresponding field in Application.
    The fields in Calculation is editable by handler. The value entered by applicant is stored in Application

    For additional descriptions of the fields, see the API documentation (serializers.py)
    """

    handler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="calculations",
        verbose_name=_("handler"),
        blank=True,
        null=True,
    )

    objects = CalculationManager()

    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="calculation",
        verbose_name=_("calculation"),
    )

    # Editable by handler. The value entered by applicant is stored in Application
    monthly_pay = models.DecimalField(  # non-zero
        verbose_name=_("monthly pay"),
        decimal_places=2,
        max_digits=7,
    )

    # Editable by handler. The value entered by applicant is stored in Application
    vacation_money = models.DecimalField(  # can be zero
        verbose_name=_("vacation money"),
        decimal_places=2,
        max_digits=7,
    )

    other_expenses = models.DecimalField(  # can be zero
        verbose_name=_("other expenses"),
        decimal_places=2,
        max_digits=7,
    )
    start_date = models.DateField(
        verbose_name=_("benefit start from date"), blank=True, null=True
    )
    end_date = models.DateField(
        verbose_name=_("benefit end date"), blank=True, null=True
    )
    state_aid_max_percentage = models.IntegerField(
        verbose_name=_("State aid maximum %"),
        choices=STATE_AID_MAX_PERCENTAGE_CHOICES,
        default=None,
        blank=True,
        null=True,
    )

    calculated_benefit_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_("amount of the benefit granted, calculated by the system"),
        blank=True,
        null=True,
    )
    override_monthly_benefit_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_(
            "monthly amount of the benefit manually entered by the application handler"
        ),
        blank=True,
        null=True,
    )
    granted_as_de_minimis_aid = models.BooleanField(default=False)

    target_group_check = models.BooleanField(default=False)

    override_monthly_benefit_amount_comment = models.CharField(
        max_length=256,
        verbose_name=_("reason for overriding the calculated benefit amount"),
        blank=True,
    )

    @property
    def ahjo_rows(self):
        rows = SalaryBenefitSubTotalRow.objects.filter(
            calculation=self, row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR
        )

        if rows.count() > 0:
            return rows
        if self.override_monthly_benefit_amount is not None:
            return ManualOverrideTotalRow.objects.filter(
                calculation=self, row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR
            )
        else:
            return SalaryBenefitTotalRow.objects.filter(
                calculation=self, row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR
            )

    history = HistoricalRecords(table_name="bf_calculator_calculator_history")

    copy_fields_from_application = {
        "employee.monthly_pay": "monthly_pay",
        "employee.vacation_money": "vacation_money",
        "employee.other_expenses": "other_expenses",
        "start_date": "start_date",
        "end_date": "end_date",
    }
    null_fields_when_reset_values = ["start_date", "end_date"]

    def reset_values(self):
        # Reset the source data for calculation.
        # 1. Fill the fields of this Calculation based on the data that the applicant
        #    entered in the Application. The handlers are supposed to edit the values
        #    in Calculation, so the data entered by applicant stays intact.
        # 2. reset pay subsidy objects according to the applicant's input. One
        #    exception, default value for start_time and end_time will be null

        for (
            source_field_name,
            target_field_name,
        ) in self.copy_fields_from_application.items():
            value = nested_getattr(self.application, source_field_name)
            if target_field_name in self.null_fields_when_reset_values:
                value = None
            elif value in [None, ""]:
                raise BenefitAPIException(_("Incomplete application"))
            setattr(self, target_field_name, value)
        PaySubsidy.reset_pay_subsidies(self.application)

    calculator = None

    def init_calculator(self):
        """
        Calculator needs to be instantiated based based on the type of the benefit sought after
        and possibly other attributes, such as date of the application.

        The calculator object should not be changed while calculation is ongoing.
        """
        from calculator.rules import HelsinkiBenefitCalculator

        if self.calculator is None:
            self.calculator = HelsinkiBenefitCalculator.get_calculator(self)
        return self.calculator

    def calculate(self, override_status=False):
        """Do the calculation again. Override status is used to force the calculation when cloning an application"""

        try:
            return self.init_calculator().calculate(override_status=override_status)
        finally:
            # Do not leave the calculator instance around. If parameters are changed,
            # a different calculator may be needed in the next run
            self.calculator = None

    def __str__(self):
        return f"Calculation for {self.application}"

    class Meta:
        db_table = "bf_calculator_calculation"
        verbose_name = _("calculation")
        verbose_name_plural = _("calculations")
        ordering = ("created_at",)


class PaySubsidy(UUIDModel, TimeStampedModel, DurationMixin):
    """
    Information about pay subsidies, as entered by the handlers in the calculator.
    """

    DEFAULT_WORK_TIME_PERCENT = decimal.Decimal("65")

    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="pay_subsidies",
        on_delete=models.CASCADE,
    )
    # ordering of the pay subsidies within application.
    ordering = models.IntegerField()
    start_date = models.DateField(
        verbose_name=_("Pay subsidy start date"), blank=True, null=True
    )
    end_date = models.DateField(
        verbose_name=_("Pay subsidy end date"), blank=True, null=True
    )
    pay_subsidy_percent = models.IntegerField(
        verbose_name=_("Pay subsidy percent"),
        choices=PAY_SUBSIDY_PERCENT_CHOICES,
    )
    work_time_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_("Work time percent"),
        default=DEFAULT_WORK_TIME_PERCENT,
        null=True,
        blank=True,
    )
    disability_or_illness = models.BooleanField(default=False)

    history = HistoricalRecords(table_name="bf_calculator_paysubsidy_history")

    def get_work_time_percent(self):
        if self.work_time_percent is None:
            return self.DEFAULT_WORK_TIME_PERCENT
        return self.work_time_percent

    @staticmethod
    def merge_compatible_subsidies(pay_subsidies):
        """
        Given a list of PaySubsidy objects, return a new list, where compatible PaySubsidies are replaced with
        a single PaySubsidy whose date range covers the combined range of the originals.
        The PaySubsidy objects in the returned list are new objects to avoid any aliasing effects.

        Two PaySubsidy objects are considered compatible if:
        * they have the equal values in these fields: application, pay_subsidy_percent, work_time_percent,
          disability_or_illness
        * the date ranges either overlap or are adjacent to each other
        """
        if len(pay_subsidies) == 0:
            return []
        pay_subsidies.sort(key=operator.attrgetter("start_date"))
        ret = []
        for subsidy in pay_subsidies:
            if (
                not ret
                or ret[-1].pay_subsidy_percent != subsidy.pay_subsidy_percent
                or ret[-1].get_work_time_percent() != subsidy.get_work_time_percent()
                or ret[-1].disability_or_illness != subsidy.disability_or_illness
                or not date_range_overlap(
                    ret[-1].start_date,
                    ret[-1].end_date + timedelta(days=1),  # also catch adjacent ranges
                    subsidy.start_date,
                    subsidy.end_date,
                )
            ):
                # make a copy so that the original object is not changed by accident
                ret.append(
                    PaySubsidy(
                        pay_subsidy_percent=subsidy.pay_subsidy_percent,
                        work_time_percent=subsidy.get_work_time_percent(),
                        application=subsidy.application,
                        disability_or_illness=subsidy.disability_or_illness,
                        start_date=subsidy.start_date,
                        end_date=subsidy.end_date,
                    )
                )
            else:
                assert ret[-1].application == subsidy.application, (
                    "Should only process PaySubsidies with the same application"
                )
                # it's a compatible PaySubsidy, just merge it with the previous one
                ret[-1].start_date = min(ret[-1].start_date, subsidy.start_date)
                ret[-1].end_date = max(ret[-1].end_date, subsidy.end_date)
        return ret

    @staticmethod
    def reset_pay_subsidies(application):
        application.pay_subsidies.all().delete()
        for ordering, percent in enumerate(
            [
                application.pay_subsidy_percent,
                application.additional_pay_subsidy_percent,
            ]
        ):
            if percent is not None:
                application.pay_subsidies.create(
                    start_date=None,
                    end_date=None,
                    pay_subsidy_percent=percent,
                    ordering=ordering,
                )

    def __str__(self):
        return (
            f"PaySubsidy {self.start_date} - {self.end_date} of"
            f" {self.pay_subsidy_percent}%"
        )

    class Meta:
        db_table = "bf_calculator_paysubsidy"
        verbose_name = _("pay subsidy")
        verbose_name_plural = _("pay subsidies")
        ordering = ["application__created_at", "ordering"]


class PreviousBenefit(UUIDModel, TimeStampedModel, DurationMixin):
    """
    Used to record benefits that have been granted before the Helsinki benefit system
    was taken to use. Up to two years of info is needed for the calculations.
    """

    company = models.ForeignKey(
        Company,
        verbose_name=_("company"),
        related_name="previous_benefits",
        on_delete=models.CASCADE,
    )
    encrypted_social_security_number = EncryptedCharField(
        max_length=11,
        verbose_name=_("encrypted social security number"),
    )
    social_security_number = SearchField(
        hash_key=settings.PREVIOUS_BENEFITS_SOCIAL_SECURITY_NUMBER_HASH_KEY,
        verbose_name=_("social security number"),
        encrypted_field_name="encrypted_social_security_number",
    )
    start_date = models.DateField(verbose_name=_("benefit start from date"))
    end_date = models.DateField(verbose_name=_("benefit end date"))
    monthly_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_("monthly amount of the previous benefit"),
    )
    total_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_("total amount of the previous benefit"),
    )

    history = HistoricalRecords(table_name="bf_calculator_previousbenefit_history")

    def __str__(self):
        return (
            f"PreviousBenefit  {self.start_date}-{self.end_date} for"
            f" {self.company.name}"
        )

    class Meta:
        db_table = "bf_calculator_previousbenefit"
        verbose_name = _("Previously granted benefit")
        verbose_name_plural = _("Previously granted benefits")


class TrainingCompensation(UUIDModel, TimeStampedModel, DurationMixin):
    """
    Information about pay subsidies, as entered by the handlers in the calculator.
    """

    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="training_compensations",
        on_delete=models.CASCADE,
    )
    # ordering of the training compensations within application.
    ordering = models.IntegerField()
    start_date = models.DateField(verbose_name=_("Pay subsidy start date"))
    end_date = models.DateField(verbose_name=_("Pay subsidy end date"))
    monthly_amount = models.DecimalField(  # can be zero
        verbose_name=_("Monthly amount of compensation"),
        decimal_places=2,
        max_digits=7,
    )

    history = HistoricalRecords(table_name="bf_calculator_trainingcompensation_history")

    def __str__(self):
        return (
            f"TrainingCompensation {self.start_date} - {self.end_date} of"
            f" {self.monthly_amount} eur"
        )

    class Meta:
        db_table = "bf_calculator_trainingcompensation"
        verbose_name = _("training compensation")
        verbose_name_plural = _("training compensations")
        ordering = ["application__created_at", "ordering"]


class CalculationRow(UUIDModel, TimeStampedModel, DurationMixin):
    proxy_row_type = None

    def __init__(self, *args, **kwargs):
        # if template is given in kwargs, it will be used in update_row below
        if "description_fi_template" in kwargs:
            self.description_fi_template = kwargs.pop("description_fi_template")

        super().__init__(*args, **kwargs)
        if not self.row_type and self.proxy_row_type:
            self.row_type = self.proxy_row_type

        if self.proxy_row_type:
            # proxy models derived from CalculationRow often only work with one row_type
            assert self.row_type == self.proxy_row_type

    calculation = models.ForeignKey(
        Calculation,
        verbose_name=_("calculation"),
        related_name="rows",
        on_delete=models.CASCADE,
    )
    row_type = models.CharField(choices=RowType.choices, max_length=64)

    ordering = models.IntegerField(default=0)

    description_fi = models.CharField(
        max_length=256,
        verbose_name=_("Description of the row to be shown in handler UI"),
    )
    amount = models.DecimalField(
        max_digits=7, decimal_places=2, verbose_name=_("row amount")
    )
    start_date = models.DateField(blank=True, null=True, verbose_name=_("Start date"))
    end_date = models.DateField(blank=True, null=True, verbose_name=_("End date"))

    description_type = models.CharField(
        choices=DescriptionType.choices, max_length=64, blank=True, null=True
    )

    history = HistoricalRecords(table_name="bf_calculator_calculationrow_history")

    def __str__(self):
        return (
            f"{self.ordering}: {self.row_type} {self.description_fi} "
            f"{self.amount if self.row_type != RowType.DESCRIPTION else ''}"
        )

    def update_row(self):
        self.amount = self.calculate_amount()
        self.description_fi = self.apply_description_template()

    def calculate_amount(self):
        raise Exception("Must be defined in subclass")

    def apply_description_template(self):
        """
        Assign value to description_fi, if description_fi_template is defined.
        The format() call is given row as parameter.
        """
        if self.description_fi_template is not None:
            return self.description_fi_template.format(row=self)
        else:
            return self.description_fi

    class Meta:
        db_table = "bf_calculator_calculationrow"
        verbose_name = _("calculation row")
        verbose_name_plural = _("calculation rows")
        unique_together = [("calculation", "ordering")]
        ordering = ["calculation__created_at", "ordering"]


class DescriptionRow(CalculationRow):
    proxy_row_type = RowType.DESCRIPTION

    def calculate_amount(self):
        return 0

    class Meta:
        proxy = True


class DateRangeDescriptionRow(CalculationRow):
    proxy_row_type = RowType.DESCRIPTION

    def __init__(self, *args, **kwargs):
        start_date = kwargs.pop("start_date", None)
        end_date = kwargs.pop("end_date", None)
        prefix_text = kwargs.pop("prefix_text", None)

        if start_date and end_date and prefix_text:
            self.description_fi_template = (
                f"{prefix_text} {format_date(start_date, locale='fi_FI')} - "
                f"{format_date(end_date, locale='fi_FI')} "
                f"({to_decimal(duration_in_months(start_date, end_date), 2)} kk)"
            )
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        return 0

    class Meta:
        proxy = True


class SalaryCostsRow(CalculationRow):
    proxy_row_type = RowType.SALARY_COSTS_EUR
    description_fi_template = "Palkkauskustannukset"

    """Calculate the amount of salary costs for the application.
    Notice that the vacation money is reported per month by the applicant."""

    def calculate_amount(self):
        return (
            self.calculation.monthly_pay
            + self.calculation.vacation_money
            + self.calculation.other_expenses
        )

    class Meta:
        proxy = True


class StateAidMaxMonthlyRow(CalculationRow):
    proxy_row_type = RowType.STATE_AID_MAX_MONTHLY_EUR
    description_fi_template = "Valtiotukimaksimi"

    def calculate_amount(self):
        return (
            self.calculation.state_aid_max_percentage
            * decimal.Decimal("0.01")
            * self.calculation.calculator.get_amount(RowType.SALARY_COSTS_EUR)
        )

    class Meta:
        proxy = True


class PaySubsidyMonthlyRow(CalculationRow):
    proxy_row_type = RowType.PAY_SUBSIDY_MONTHLY_EUR
    description_fi_template = "Palkkatuki tai yli 55-vuotiaan tuki"

    """
    Special rule regarding a 100% pay subsidy. The 100% subsidy is limited so, that it's only possible
    to have 100% of salary costs covered if the employee is working part-time, up to 65% of the full work time.
    Example (from Excel tests):
    * monthly pay = 1330,27
    * additional expenses = 656,04
    * vacation money = 498,85
    * 100% pay subsidy has been granted for 6 months
    * Pay subsidy is calcuated using formula:
      min(2020, (monthly_pay / work_time_fraction * 0.65) * 1.23
    """
    MAX_WORK_TIME_FRACTION_FOR_FULL_PAY_SUBSIDY = decimal.Decimal("0.65")
    GROSS_WAGE_COEFFICIENT_FOR_FULL_PAY_SUBSIDY = decimal.Decimal("1.23")

    def __init__(self, *args, **kwargs):
        self.pay_subsidy = kwargs.pop("pay_subsidy", None)
        self.max_subsidy = kwargs.pop("max_subsidy", None)
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        """
        1.7.2023 voimaantulevan lain mukaan lomarahaa ja sivukuluja ei oteta enää huomioon palkkatuen määrää laskiessa
        """
        assert self.max_subsidy is not None
        assert self.pay_subsidy is not None

        # for calculations, use a fraction in [0,1] range instead of a percent in
        # [0,100] range
        work_time_fraction = self.pay_subsidy.get_work_time_percent() * decimal.Decimal(
            "0.01"
        )
        pay_subsidy_fraction = self.pay_subsidy.pay_subsidy_percent * decimal.Decimal(
            "0.01"
        )
        # Pay subsidy max is 100%:
        if pay_subsidy_fraction == 1:
            full_time_salary_cost = (self.calculation.monthly_pay) / work_time_fraction

            subsidy_amount = min(
                self.max_subsidy,
                (
                    full_time_salary_cost
                    * self.MAX_WORK_TIME_FRACTION_FOR_FULL_PAY_SUBSIDY
                )
                * self.GROSS_WAGE_COEFFICIENT_FOR_FULL_PAY_SUBSIDY,
            )
        # Pay subsidy max is less than 100% (50% or 70%):
        else:
            subsidy_amount = min(
                self.max_subsidy,
                pay_subsidy_fraction * self.calculation.monthly_pay,
            )
        return subsidy_amount

    class Meta:
        proxy = True


class TrainingCompensationMonthlyRow(CalculationRow):
    proxy_row_type = RowType.TRAINING_COMPENSATION_MONTHLY_EUR
    description_fi_template = "Oppisopimuksen koulutuskorvaus"

    def __init__(self, *args, **kwargs):
        self.training_compensation = kwargs.pop(
            "training_compensation", None
        )  # sometimes there's no training benefit
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        return to_decimal(
            (
                self.training_compensation.monthly_amount
                if self.training_compensation
                else 0
            ),
            2,
        )

    class Meta:
        proxy = True


class TotalDeductionsMonthlyRow(CalculationRow):
    proxy_row_type = RowType.DEDUCTIONS_TOTAL_EUR
    description_fi_template = "Vähennykset yhteensä"

    def __init__(self, *args, **kwargs):
        self.monthly_deductions = kwargs.pop("monthly_deductions", None)
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        return to_decimal(
            self.monthly_deductions,
            2,
        )

    class Meta:
        proxy = True


class SalaryBenefitMonthlyRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_MONTHLY_EUR
    description_fi_template = "Helsinki-lisä"

    def __init__(self, *args, **kwargs):
        self.max_benefit = kwargs.pop("max_benefit", None)
        self.monthly_deductions = kwargs.pop(
            "monthly_deductions", 0
        )  # sometimes there are no deductions
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        assert self.max_benefit is not None
        return to_decimal(
            max(
                0,
                min(
                    self.max_benefit,
                    self.calculation.calculator.get_amount(
                        RowType.STATE_AID_MAX_MONTHLY_EUR
                    )
                    - self.monthly_deductions,
                ),
            ),
            0,
        )

    class Meta:
        proxy = True


class TotalRowMixin:
    @property
    def monthly_amount(self):
        # For each total row, there needs to be a row that defines the monthly amount
        row = (
            self.calculation.rows.filter(
                ordering__lt=self.ordering,
                row_type=RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
            )
            .order_by("-ordering")
            .first()
        )
        assert row is not None, (
            "Application logic error - misconstructed application rows"
        )
        return row.amount


class SalaryBenefitTotalRow(CalculationRow, TotalRowMixin):
    """
    SalaryBenefitTotalRow for the simple cases where
    * there is a single pay subsidy decision for the duration of the benefit
    * or there is no pay subsidy decision
    """

    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    def calculate_amount(self):
        return to_decimal(
            self.calculation.duration_in_months_rounded
            * self.calculation.calculator.get_amount(
                RowType.HELSINKI_BENEFIT_MONTHLY_EUR
            ),
            0,
        )

    class Meta:
        proxy = True


class SalaryBenefitSubTotalRow(CalculationRow, TotalRowMixin):
    proxy_row_type = RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR
    description_fi_template = "Yhteensä ajanjaksolta"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def calculate_amount(self):
        return to_decimal(
            duration_in_months(self.start_date, self.end_date, 2)
            * self.calculation.calculator.get_amount(
                RowType.HELSINKI_BENEFIT_MONTHLY_EUR
            ),
            0,
        )

    class Meta:
        proxy = True


class SalaryBenefitSumSubTotalsRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    def calculate_amount(self):
        return sum(
            [
                row.amount
                for row in self.calculation.rows.all().filter(
                    row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR
                )
            ]
        )

    class Meta:
        proxy = True


class EmployeeBenefitMonthlyRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_MONTHLY_EUR
    description_fi_template = "Helsinki-lisä / kk"

    def calculate_amount(self):
        return self.calculation.calculator.EMPLOYEE_BENEFIT_AMOUNT_PER_MONTH

    class Meta:
        proxy = True


class EmployeeBenefitTotalRow(CalculationRow, TotalRowMixin):
    """
    Calculate the total based on the monthly amount and the duration
    """

    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    def calculate_amount(self):
        return to_decimal(
            self.calculation.duration_in_months
            * self.calculation.calculator.get_amount(
                RowType.HELSINKI_BENEFIT_MONTHLY_EUR
            ),
            0,
        )

    class Meta:
        proxy = True


class ManualOverrideTotalRow(CalculationRow):
    """
    SalaryBenefitTotalRow for the simple cases where
    * there is a single pay subsidy decision for the duration of the benefit
    * or there is no pay subsidy decision
    """

    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    @property
    def monthly_amount(self):
        return self.calculation.override_monthly_benefit_amount

    def calculate_amount(self):
        return to_decimal(
            self.calculation.duration_in_months
            * self.calculation.override_monthly_benefit_amount,
            0,
        )

    class Meta:
        proxy = True


class Instalment(UUIDModel, TimeStampedModel):
    """
    Instalment model for Helsinki benefit grantend benefits that are paid in (two )instalments
    """

    calculation = models.ForeignKey(
        Calculation,
        verbose_name=_("calculation"),
        related_name="instalments",
        on_delete=models.CASCADE,
    )

    instalment_number = models.IntegerField()

    amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_("row amount"),
        blank=True,
    )

    amount_paid = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        editable=False,
        verbose_name=_(
            "To be set only ONCE when final amount is sent to Talpa. The set value"
            " should be defined by 'amount' field that is reduced by handled"
            " ApplicationAlteration recoveries at the time of Talpa robot visit."
        ),
        blank=True,
        null=True,
    )

    due_date = models.DateField(blank=True, null=True, verbose_name=_("Due date"))

    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=InstalmentStatus.choices,
        default=InstalmentStatus.WAITING,
        blank=True,
    )

    @property
    def is_final(self):
        """
        A helper property check if the instalment is the only one or the final one
        """
        return self.instalment_number == self.calculation.instalments.count()

    @property
    def amount_after_recoveries(self):
        if self.amount_paid:
            return max(self.amount_paid, 0)
        if self.instalment_number == 1:
            return max(self.amount, 0)

        alteration_set = self.calculation.application.alteration_set.filter(
            state=ApplicationAlterationState.HANDLED,
        )
        if alteration_set.count() == 0:
            return max(self.amount, 0)

        return max(
            self.amount
            - sum([alteration.recovery_amount or 0 for alteration in alteration_set]),
            0,
        )

    def __str__(self):
        return (
            f"Instalment of {self.amount}€, number"
            f" {self.instalment_number}/{self.calculation.instalments.count()} for"
            f" application {self.calculation.application.application_number}, due in"
            f" {self.due_date}, status: {self.status}."
        )

    class Meta:
        db_table = "bf_calculator_instalment"
        verbose_name = _("instalment")
        verbose_name_plural = _("instalments")
        ordering = ("created_at",)
