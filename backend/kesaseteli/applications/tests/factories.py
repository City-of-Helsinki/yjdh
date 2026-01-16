import factory
import factory.fuzzy
from django.conf import settings

from applications.models import SummerVoucherConfiguration
from applications.target_groups import AbstractTargetGroup


class SummerVoucherConfigurationFactory(factory.django.DjangoModelFactory):
    year = factory.fuzzy.FuzzyInteger(2020, 2099)
    target_group = factory.Iterator(
        [[cls().identifier] for cls in AbstractTargetGroup.__subclasses__()]
    )
    voucher_value_in_euros = settings.SUMMER_VOUCHER_DEFAULT_VOUCHER_VALUE
    min_work_compensation_in_euros = (
        settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_COMPENSATION
    )
    min_work_hours = settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_HOURS

    class Meta:
        model = SummerVoucherConfiguration
