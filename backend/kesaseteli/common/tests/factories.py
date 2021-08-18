import random

import factory

from applications.enums import ApplicationStatus
from applications.models import Application, SummerVoucher
from companies.models import Company


class CompanyFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("company")
    business_id = factory.Faker("numerify", text="#######-#")
    company_form = "oy"
    industry = factory.Faker("job")

    street_address = factory.Faker("street_address")
    postcode = factory.Faker("postcode")
    city = factory.Faker("city")
    ytj_json = factory.Faker("json")

    class Meta:
        model = Company


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
