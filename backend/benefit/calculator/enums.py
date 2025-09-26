from django.db import models
from django.utils.translation import gettext_lazy as _


class RowType(models.TextChoices):
    DESCRIPTION = "description", _("Description row, amount ignored")
    SALARY_COSTS_EUR = "salary_costs", _("Salary costs")  # Palkkauskustannukset
    STATE_AID_MAX_MONTHLY_EUR = "state_aid_max_monthly_eur", _("State aid maximum %")
    PAY_SUBSIDY_MONTHLY_EUR = "pay_subsidy_monthly_eur", _("Pay subsidy/month")
    HELSINKI_BENEFIT_MONTHLY_EUR = (
        "helsinki_benefit_monthly_eur",
        _("Helsinki benefit amount monthly"),
    )
    HELSINKI_BENEFIT_SUB_TOTAL_EUR = (
        "helsinki_benefit_sub_total_eur",
        _("Helsinki benefit amount for a date range"),
    )
    HELSINKI_BENEFIT_TOTAL_EUR = (
        "helsinki_benefit_total_eur",
        _("Helsinki benefit total amount"),
    )
    TRAINING_COMPENSATION_MONTHLY_EUR = (
        "training_compensation_monthly_eur",
        _("Training compensation amount monthly"),
    )
    DEDUCTIONS_TOTAL_EUR = (
        "deductions_total_eur",
        _("Total amount of deductions monthly"),
    )


class DescriptionType(models.TextChoices):
    DATE = "date", _("Basic date range description")
    DATE_TOTAL = "date_total", _("Date range description for total row")
    DEDUCTION = "deduction", _("Deduction description")


class InstalmentStatus(models.TextChoices):
    WAITING = "waiting", _("Waiting")
    ACCEPTED = "accepted", _("Accepted")
    PAID = "paid", _("Paid")
    CANCELLED = "cancelled", _("Cancelled")
    ERROR_IN_TALPA = "error_in_talpa", _("Error in TALPA")
    COMPLETED = "completed", _("Completed")
