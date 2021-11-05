from django.db import models
from django.utils.translation import gettext_lazy as _


class RowType(models.TextChoices):
    DESCRIPTION = "description", _("Description row, amount ignored")
    SALARY_COSTS_EUR = "salary_costs", _("Salary costs")  # Palkkauskustannukset
    STATE_AID_MAX_MONTHLY_EUR = "state_aid_max_monthly_eur", _("State aid maximum %")
    PAY_SUBSIDY_MONTHLY_EUR = "pay_subsidy_monthly_eur", _("Pay subsidy/month")
    HELSINKI_BENEFIT_MONTHLY_EUR = "helsinki_benefit_monthly_eur", _(
        "Helsinki benefit amount monthly"
    )
    HELSINKI_BENEFIT_SUB_TOTAL_EUR = "helsinki_benefit_sub_total_eur", _(
        "Helsinki benefit amount for a date range"
    )
    HELSINKI_BENEFIT_TOTAL_EUR = "helsinki_benefit_total_eur", _(
        "Helsinki benefit total amount"
    )
