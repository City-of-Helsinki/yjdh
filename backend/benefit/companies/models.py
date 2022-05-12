from django.db import models
from django.utils.translation import gettext_lazy as _
from shared.models.abstract_models import AbstractCompany

from common.localized_iban_field import LocalizedIBANField


class Company(AbstractCompany):
    bank_account_number = LocalizedIBANField(
        include_countries=("FI",), verbose_name=_("bank account number")
    )
    company_form_code = models.IntegerField(
        verbose_name=_("YTJ type code for company form")
    )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "bf_companies_company"
        verbose_name = _("company")
        verbose_name_plural = _("companies")
