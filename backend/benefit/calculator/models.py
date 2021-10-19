import decimal

from applications.models import Application, PAY_SUBSIDY_PERCENT_CHOICES
from calculator.enums import RowType
from common.utils import duration_in_months
from companies.models import Company
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField, SearchField
from simple_history.models import HistoricalRecords

from shared.models.abstract_models import TimeStampedModel, UUIDModel

STATE_AID_MAX_PERCENTAGE_CHOICES = (
    (50, "50%"),
    (100, "100%"),
)


class Calculation(UUIDModel, TimeStampedModel):
    """
    Data model for Helsinki benefit calculations

    There can be only one calculation per application.

    Some fields have a corresponding field in Application.
    The fields in Calculation is editable by handler. The value entered by applicant is stored in Application

    For additional descriptions of the fields, see the API documentation (serializers.py)
    """

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
    start_date = models.DateField(verbose_name=_("benefit start from date"))
    end_date = models.DateField(verbose_name=_("benefit end date"))
    state_aid_max_percentage = models.IntegerField(
        verbose_name=_("State aid maximum %"),
        choices=STATE_AID_MAX_PERCENTAGE_CHOICES,
    )

    calculated_benefit_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_("amount of the benefit granted, calculated by the system"),
        blank=True,
        null=True,
    )
    override_benefit_amount = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name=_(
            "amount of the benefit manually entered by the application handler"
        ),
        blank=True,
        null=True,
    )

    @property
    def benefit_amount(self):
        if self.override_benefit_amount is not None:
            return self.override_benefit_amount
        else:
            return self.calculated_benefit_amount

    override_benefit_amount_comment = models.CharField(
        max_length=256,
        verbose_name=_("reason for overriding the calculated benefit amount"),
    )

    history = HistoricalRecords(table_name="bf_calculator_calculator_history")

    @property
    def duration_in_months(self):
        # The calculation Excel file used the DAYS360 function, so we're doing the same
        return duration_in_months(self.start_date, self.end_date)

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

    def calculate(self):
        self.init_calculator().calculate()

    def __str__(self):
        return f"Calculation for {self.application}"

    class Meta:
        db_table = "bf_calculator_calculation"
        verbose_name = _("calculation")
        verbose_name_plural = _("calculations")
        ordering = ("created_at",)


class PaySubsidy(UUIDModel, TimeStampedModel):
    """
    Information about pay subsidies, as entered by the handlers in the calculator.
    """

    application = models.ForeignKey(
        Application,
        verbose_name=_("application"),
        related_name="calculator_pay_subsidies",
        on_delete=models.CASCADE,
    )
    start_date = models.DateField(verbose_name=_("Pay subsidy start date"))
    end_date = models.DateField(verbose_name=_("Pay subsidy end date"))
    pay_subsidy_percent = models.IntegerField(
        verbose_name=_("Pay subsidy percent"),
        choices=PAY_SUBSIDY_PERCENT_CHOICES,
        null=True,
        blank=True,
    )
    work_time_percent = models.IntegerField(
        verbose_name=_("Work time percent"),
        default=100,
        null=True,
        blank=True,
    )
    amount = models.DecimalField(
        max_digits=7, decimal_places=2, verbose_name=_("amount of the pay subsidy")
    )
    history = HistoricalRecords(table_name="bf_calculator_paysubsidy_history")

    @property
    def duration_in_months(self):
        # The calculation Excel file used the DAYS360 function, so we're doing the same
        return duration_in_months(self.start_date, self.end_date)

    def __str__(self):
        return f"PaySubsidy {self.start_date}-{self.end_date} of {self.amount}"

    class Meta:
        db_table = "bf_calculator_paysubsidy"
        verbose_name = _("pay subsidy")
        verbose_name_plural = _("pay subsidies")
        ordering = ["application__created_at", "start_date"]


class PreviousBenefit(UUIDModel, TimeStampedModel):
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
        return f"PreviousBenefit  {self.start_date}-{self.end_date} for {self.company.name}"

    class Meta:
        db_table = "bf_calculator_previousbenefit"
        verbose_name = _("Previously granted benefit")
        verbose_name_plural = _("Previously granted benefits")


"""
class CalculationRowManager(models.Manager):
    # Make it easier to maintain creation order in UI
    _default_ordering = 0

    def create(self, *args, **kwargs):
        if "ordering" not in kwargs:
            kwargs["ordering"] = self._default_ordering
            self._default_ordering += 1
        return super(CalculationRowManager, self).create(*args, **kwargs)
"""


class CalculationRow(UUIDModel, TimeStampedModel):

    proxy_row_type = None

    def __init__(self, *args, **kwargs):
        # if template is given in kwargs, it will be used in update_row below
        if "description_fi_template" in kwargs:
            self.description_fi_template = kwargs.pop("description_fi_template")

        super(CalculationRow, self).__init__(*args, **kwargs)
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

    history = HistoricalRecords(table_name="bf_calculator_calculationrow_history")

    def __str__(self):
        return f"{self.ordering}: {self.row_type} {self.description_fi} {self.amount}"

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


class SalaryCostsRow(CalculationRow):
    proxy_row_type = RowType.SALARY_COSTS_EUR
    description_fi_template = "Palkkakustannukset / kk"

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
    description_fi_template = "Palkkatuki (enintään {row.max_subsidy} €)"

    def __init__(self, *args, **kwargs):
        self.pay_subsidy = kwargs.pop("pay_subsidy", None)
        self.max_subsidy = kwargs.pop("max_subsidy", None)
        super(PaySubsidyMonthlyRow, self).__init__(*args, **kwargs)

    def calculate_amount(self):
        assert self.max_subsidy is not None
        assert self.pay_subsidy is not None
        return min(
            self.max_subsidy,
            self.pay_subsidy.pay_subsidy_percent
            * decimal.Decimal("0.01")
            * self.calculation.calculator.get_amount(RowType.SALARY_COSTS_EUR),
        )

    class Meta:
        proxy = True


class SalaryBenefitMonthlyRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_MONTHLY_EUR
    description_fi_template = "Helsinki-lisä / kk (enintään {row.max_benefit} €)"

    def __init__(self, *args, **kwargs):
        self.max_benefit = kwargs.pop("max_benefit", None)
        super(SalaryBenefitMonthlyRow, self).__init__(*args, **kwargs)

    def calculate_amount(self):
        assert self.max_benefit is not None
        return max(
            0,
            min(
                self.max_benefit,
                self.calculation.calculator.get_amount(
                    RowType.STATE_AID_MAX_MONTHLY_EUR
                )
                - self.calculation.calculator.get_amount(
                    RowType.PAY_SUBSIDY_MONTHLY_EUR, default=0
                ),
            ),
        )

    class Meta:
        proxy = True


class SalaryBenefitTotalRow(CalculationRow):
    """
    SalaryBenefitTotalRow for the simple cases where
    * there is a single pay subsidy decision for the duration of the benefit
    * or there is no pay subsidy decision
    """

    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    def calculate_amount(self):
        return (
            self.calculation.duration_in_months
            * self.calculation.calculator.get_amount(
                RowType.HELSINKI_BENEFIT_MONTHLY_EUR
            )
        )

    class Meta:
        proxy = True


class SalaryBenefitSubTotalRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR
    description_fi_template = "Yhteensä ajanjaksolta"

    def __init__(self, *args, **kwargs):
        self.start_date = kwargs.pop("start_date")
        self.end_date = kwargs.pop("end_date")

    def calculate_amount(self, calculation_context):
        return duration_in_months(
            self.start_date, self.end_date
        ) * self.calculation.calculator.get_amount(RowType.HELSINKI_BENEFIT_MONTHLY_EUR)

    class Meta:
        proxy = True


"""
class SalaryBenefitPaySubsidySubTotalRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR
    description_fi_template = 'Yhteensä ajanjaksolta'

    def calculate_amount(self, calculation_context):
        assert calculation_context.get('pay_subsidy') is not None
        return (calculation_context['pay_subsidy'].duration_in_months *
                calculation_context['calculator'].get_amount(RowType.HELSINKI_BENEFIT_MONTHLY_EUR))

    class Meta:
        proxy = True
"""


class SalaryBenefitSumSubTotalsRow(CalculationRow):
    proxy_row_type = RowType.HELSINKI_BENEFIT_TOTAL_EUR
    description_fi_template = "Helsinki-lisä yhteensä"

    def calculate_amount(self, calculation_context):
        return max(
            0,
            min(
                self.max_benefit,
                calculation_context["calculator"].get_amount(
                    RowType.STATE_AID_MAX_MONTHLY_EUR
                )
                - calculation_context["calculator"].get_amount(
                    RowType.PAY_SUBSIDY_MONTHLY_EUR
                ),
            ),
        )

    class Meta:
        proxy = True
