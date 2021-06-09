from django.utils.translation import gettext_lazy as _
from localflavor.generic.models import IBANField

from shared.models.abstract_models import AbstractCompany


class Company(AbstractCompany):
    bank_account_number = IBANField(
        include_countries=("FI",), verbose_name=_("bank account number")
    )

    class Meta:
        db_table = "bf_companies_company"
        verbose_name = _("company")
        verbose_name_plural = _("companies")
