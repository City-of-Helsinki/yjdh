import factory
from companies.models import Company

ASSOCIATION_FORM_CODE = 29  # "muu yhdistys"
COMPANY_FORM_CODE = 16  # "osakeyhtiö"


class CompanyFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("company")
    business_id = factory.Faker("numerify", text="#######-#")
    company_form = "oy"
    company_form_code = COMPANY_FORM_CODE
    bank_account_number = factory.Faker("iban", locale="fi_FI")

    street_address = factory.Faker("street_address")
    postcode = factory.Faker("postcode")
    city = factory.Faker("city")

    class Meta:
        model = Company
