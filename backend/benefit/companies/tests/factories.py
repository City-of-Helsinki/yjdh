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


def generate_search_results(search_term: str) -> list[dict]:
    return [
        {"name": f"{search_term}_{index}", "business_id": business_id}
        for index, business_id in enumerate(["6242868-6", "4675403-5", "0071782-9"])
    ]
