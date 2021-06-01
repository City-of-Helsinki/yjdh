import random

import factory
from django.contrib.auth import get_user_model

from applications.enums import ApplicationStatus
from applications.models import Application, SummerVoucher
from companies.tests.factories import CompanyFactory


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    username = factory.Sequence(lambda n: "user_%d" % (n + 1))
    email = factory.Faker("email")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")

    @classmethod
    def _setup_next_sequence(cls):
        User = get_user_model()
        try:
            latest_id = User.objects.latest("id").id
            return latest_id + 1
        except User.DoesNotExist:
            return 1


class SummerVoucherFactory(factory.django.DjangoModelFactory):
    summer_voucher_id = factory.Faker("md5")
    contact_name = factory.Faker("name")
    contact_email = factory.Faker("email")
    work_postcode = factory.Faker("postcode")

    employee_name = factory.Faker("name")
    employee_school = factory.Faker("lexify", text="????? School")
    employee_ssn = factory.Faker("bothify", text="######-###?")
    employee_phone_number = factory.Faker("phone_number")

    is_unnumbered_summer_voucher = factory.Faker("boolean")
    unnumbered_summer_voucher_reason = factory.Faker("text")

    class Meta:
        model = SummerVoucher


class ApplicationFactory(factory.django.DjangoModelFactory):
    company = factory.SubFactory(CompanyFactory)
    summer_vouchers = factory.RelatedFactoryList(
        SummerVoucherFactory,
        factory_related_name="application",
        size=lambda: random.randint(1, 3),
    )
    status = factory.Faker("random_element", elements=ApplicationStatus.values)

    invoicer_name = factory.Faker("name")
    invoicer_email = factory.Faker("email")
    invoicer_phone_number = factory.Faker("phone_number")

    class Meta:
        model = Application
