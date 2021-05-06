import factory

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
