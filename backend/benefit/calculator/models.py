from applications.models import Application
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
    amount = models.DecimalField(
        max_digits=7, decimal_places=2, verbose_name=_("amount of the pay subsidy")
    )
    history = HistoricalRecords(table_name="bf_calculator_paysubsidy_history")

    def __str__(self):
        return f"PaySubsidy {self.start_date}-{self.end_date} of {self.amount}"

    class Meta:
        db_table = "bf_calculator_paysubsidy"
        verbose_name = _("pay subsidy")
        verbose_name_plural = _("pay subsidies")
        ordering = ["application__created_at", "start_date"]


class CalculationRow(UUIDModel, TimeStampedModel):
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
        return "row {} of {}".format(self.ordering, self.calculation.pk)

    class Meta:
        db_table = "bf_calculator_calculationrow"
        verbose_name = _("calculation row")
        verbose_name_plural = _("calculation rows")
        unique_together = [("calculation", "ordering")]
        ordering = ["calculation__created_at", "ordering"]


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
