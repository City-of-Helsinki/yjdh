from django.db import models
from django.utils.translation import gettext_lazy as _


class RowType(models.TextChoices):
    SALARY_COSTS_EUR = "salary_costs", _("Salary costs")  # Palkkauskustannukset
    STATE_AID_MAX_PERCENT = "state_aid_max_percent", _("State aid maximum %")
    PAY_SUBSIDY_MONTHLY_EUR = "pay_subsidy_monthly_eur", _("Pay subsidy/month")
    HELSINKI_BENEFIT_MONTHLY_EUR = "helsinki_benefit_monthly_eur", _(
        "Helsinki benefit amount monthly"
    )
    HELSINKI_BENEFIT_TOTAL_EUR = "helsinki_benefit_total_eur", _(
        "Helsinki benefit total amount"
    )
    # More to be added
