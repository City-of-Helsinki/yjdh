import itertools
import random

import factory
from applications.enums import ApplicationStatus, BenefitType
from applications.models import (
    Application,
    APPLICATION_LANGUAGE_CHOICES,
    ApplicationBasis,
    DeMinimisAid,
)
from companies.tests.factories import CompanyFactory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()


class DeMinimisAidFactory(factory.django.DjangoModelFactory):
    granter = factory.Faker("sentence", nb_words=2)
    granted_at = factory.Faker("date")
    amount = factory.Faker("pyint", min_value=1, max_value=100000)
    ordering = factory.Iterator(itertools.count(0))

    class Meta:
        model = DeMinimisAid


class ApplicationBasisFactory(factory.django.DjangoModelFactory):
    identifier = factory.Faker("sentence", nb_words=2)

    class Meta:
        model = ApplicationBasis


class ApplicationFactory(factory.django.DjangoModelFactory):
    company = factory.SubFactory(CompanyFactory)

    company_name = factory.Faker("sentence", nb_words=2)
    official_company_street_address = factory.Faker("street_address")
    official_company_city = factory.Faker("city")
    official_company_postcode = factory.Faker("postcode")
    use_alternative_address = factory.Faker("boolean")
    alternative_company_street_address = factory.Faker("street_address")
    alternative_company_city = factory.Faker("city")
    alternative_company_postcode = factory.Faker("postcode")
    company_bank_account_number = factory.Faker("iban", locale="fi_FI")
    company_contact_person_phone_number = factory.Faker("phone_number")
    company_contact_person_email = factory.Faker("email")
    association_has_business_activities = factory.Faker("boolean")
    applicant_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    co_operation_negotiations = factory.Faker("boolean")
    co_operation_negotiations_description = factory.Faker("sentence")
    apprenticeship_program = factory.Faker("boolean")
    archived = factory.Faker("boolean")
    benefit_type = factory.Faker("random_element", elements=BenefitType.values)
    start_date = factory.Faker("date")
    end_date = factory.Faker("date")
    de_minimis_aid = True
    status = factory.Faker("random_element", elements=ApplicationStatus.values)

    @factory.post_generation
    def bases(self, created, extracted, **kwargs):
        if basis_count := kwargs.pop("basis_count", random.randint(1, 5)):
            for bt in ApplicationBasisFactory.create_batch(basis_count, **kwargs):
                self.bases.add(bt)

    de_minimis_1 = factory.RelatedFactory(
        DeMinimisAidFactory,
        factory_related_name="application",
    )
    de_minimis_2 = factory.RelatedFactory(
        DeMinimisAidFactory,
        factory_related_name="application",
    )

    class Meta:
        model = Application
