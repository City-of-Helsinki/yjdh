import itertools
import random
from datetime import date, timedelta

import factory
from applications.enums import ApplicationStatus, BenefitType
from applications.models import (
    Application,
    APPLICATION_LANGUAGE_CHOICES,
    ApplicationBasis,
    DeMinimisAid,
    Employee,
)
from common.tests.conftest import *  # noqa
from companies.tests.factories import CompanyFactory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()


class DeMinimisAidFactory(factory.django.DjangoModelFactory):
    granter = factory.Faker("sentence", nb_words=2)

    # delay evaluation of date_start and date_end so that any freeze_time takes effect
    granted_at = factory.Faker(
        "date_between_dates",
        date_start=factory.LazyAttribute(
            lambda _: date.today() - timedelta(days=365 * 2)
        ),
        date_end=factory.LazyAttribute(lambda _: date.today()),
    )
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
    company_form = factory.Faker("sentence", nb_words=1)
    official_company_street_address = factory.Faker("street_address")
    official_company_city = factory.Faker("city")
    official_company_postcode = factory.Faker("postcode")
    use_alternative_address = factory.Faker("boolean")
    alternative_company_street_address = factory.Faker("street_address")
    alternative_company_city = factory.Faker("city")
    alternative_company_postcode = factory.Faker("postcode", locale="fi_FI")
    company_bank_account_number = factory.Faker("iban", locale="fi_FI")
    company_contact_person_phone_number = factory.Sequence(lambda n: f"050-100000{n}")
    company_contact_person_email = factory.Faker("email")
    association_has_business_activities = None
    applicant_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    co_operation_negotiations = factory.Faker("boolean")
    co_operation_negotiations_description = factory.LazyAttribute(
        lambda o: factory.Faker("sentence") if o.co_operation_negotiations else ""
    )
    apprenticeship_program = factory.Faker("boolean")
    archived = factory.Faker("boolean")
    benefit_type = factory.Faker("random_element", elements=BenefitType.values)
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(1, 365))
    )
    de_minimis_aid = True
    status = ApplicationStatus.DRAFT

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


class EmployeeFactory(factory.django.DjangoModelFactory):
    application = factory.SubFactory(ApplicationFactory)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    social_security_number = factory.Faker("ssn")

    phone_number = factory.Faker("phone_number")
    email = factory.Faker("email")

    employee_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    job_title = factory.Faker("job")
    monthly_pay = factory.Faker("random_int", max=5000)
    vacation_money = factory.Faker("random_int", max=5000)
    other_expenses = factory.Faker("random_int", max=5000)
    working_hours = factory.Faker("random_int", max=40)
    is_living_in_helsinki = factory.Faker("boolean")

    collective_bargaining_agreement = factory.Faker("words")

    class Meta:
        model = Employee
