import factory

from companies.models import Company
from shared.service_bus.enums import YtjOrganizationCode


class CompanyFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("company", locale="fi_FI")
    business_id = factory.Faker("numerify", text="#######-#")
    company_form = "oy"
    company_form_code = YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT
    bank_account_number = factory.Faker("iban", locale="fi_FI")

    street_address = factory.Faker("street_address", locale="fi_FI")
    postcode = factory.Faker("postcode", locale="fi_FI")
    city = factory.Faker("city", locale="fi_FI")

    class Meta:
        model = Company
