import itertools
import random
from datetime import date, timedelta

import factory
from applications.enums import ApplicationStatus, ApplicationStep, BenefitType
from applications.models import (
    AhjoDecision,
    Application,
    APPLICATION_LANGUAGE_CHOICES,
    ApplicationBasis,
    ApplicationBatch,
    DeMinimisAid,
    Employee,
)
from calculator.models import Calculation
from companies.tests.factories import CompanyFactory
from users.tests.factories import HandlerFactory


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
    identifier = factory.Sequence(
        lambda id: f"basis_identifier_{id}"
    )  # ensure it is unique

    class Meta:
        model = ApplicationBasis


class ApplicationFactory(factory.django.DjangoModelFactory):
    company = factory.SubFactory(CompanyFactory)
    employee = factory.RelatedFactory(
        "applications.tests.factories.EmployeeFactory",
        factory_related_name="application",
    )
    company_name = factory.Faker("sentence", nb_words=2)
    company_form = factory.Faker("sentence", nb_words=1)
    company_department = factory.Faker("street_address")
    official_company_street_address = factory.Faker("street_address")
    official_company_city = factory.Faker("city")
    official_company_postcode = factory.Faker("postcode")
    use_alternative_address = factory.Faker("boolean")
    alternative_company_street_address = factory.Faker("street_address")
    alternative_company_city = factory.Faker("city")
    alternative_company_postcode = factory.Faker("postcode", locale="fi_FI")
    company_bank_account_number = factory.Faker("iban", locale="fi_FI")
    company_contact_person_phone_number = factory.Sequence(
        lambda n: f"050-10000{n}"
    )  # max.length in validation seems to be 10 digits
    company_contact_person_email = factory.Faker("email")
    company_contact_person_first_name = factory.Faker("first_name")
    company_contact_person_last_name = factory.Faker("last_name")
    association_has_business_activities = None
    applicant_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    co_operation_negotiations = factory.Faker("boolean")
    co_operation_negotiations_description = factory.Maybe(
        "co_operation_negotiations", factory.Faker("paragraph"), ""
    )
    pay_subsidy_granted = False
    pay_subsidy_percent = None

    additional_pay_subsidy_percent = None

    apprenticeship_program = factory.Faker("boolean")
    archived = factory.Faker("boolean")
    application_step = ApplicationStep.STEP_1
    benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
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


class ReceivedApplicationFactory(ApplicationFactory):
    status = ApplicationStatus.RECEIVED
    applicant_terms_approval = factory.RelatedFactory(
        "terms.tests.factories.ApplicantTermsApprovalFactory",
        factory_related_name="application",
    )
    calculation = factory.RelatedFactory(
        "calculator.tests.factories.CalculationFactory",
        factory_related_name="application",
    )

    @factory.post_generation
    def calculation(self, created, extracted, **kwargs):
        self.calculation = Calculation.objects.create_for_application(self)
        self.calculation.init_calculator()
        self.calculation.calculate()


class HandlingApplicationFactory(ReceivedApplicationFactory):
    status = ApplicationStatus.HANDLING

    @factory.post_generation
    def calculation(self, created, extracted, **kwargs):
        from calculator.tests.factories import (  # avoid circular import
            PaySubsidyFactory,
        )

        previous_status = self.status
        self.status = (
            ApplicationStatus.HANDLING
        )  # so that recalculation succeeds even in subclasses
        self.calculation = Calculation.objects.create_for_application(self)
        self.save()
        PaySubsidyFactory(
            application=self,
            start_date=self.calculation.start_date,
            end_date=self.calculation.end_date,
        )
        self.calculation.calculate()
        self.status = previous_status
        self.calculation.handler = HandlerFactory()
        self.calculation.save()
        self.save()
        assert len(self.ahjo_rows) == 1


class DecidedApplicationFactory(HandlingApplicationFactory):
    status = ApplicationStatus.ACCEPTED


class EmployeeFactory(factory.django.DjangoModelFactory):
    # pass employee=None to prevent ApplicationFactory from creating another employee
    application = factory.SubFactory(ApplicationFactory, employee=None)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    social_security_number = factory.Faker("ssn", locale="fi_FI")
    phone_number = factory.Sequence(lambda n: f"050-10000{n}")
    email = factory.Faker("email")

    employee_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    job_title = factory.Faker("job")
    monthly_pay = factory.Faker("random_int", max=5000)
    vacation_money = factory.Faker("random_int", max=5000)
    other_expenses = factory.Faker("random_int", max=5000)
    working_hours = factory.Faker("random_int", min=18, max=40)
    is_living_in_helsinki = factory.Faker("boolean")

    collective_bargaining_agreement = factory.Faker("word")

    class Meta:
        model = Employee


class ApplicationBatchFactory(factory.django.DjangoModelFactory):
    proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
    application_1 = factory.RelatedFactory(
        DecidedApplicationFactory,
        factory_related_name="batch",
        status=factory.SelfAttribute("batch.proposal_for_decision"),
    )

    application_2 = factory.RelatedFactory(
        DecidedApplicationFactory,
        factory_related_name="batch",
        status=factory.SelfAttribute("batch.proposal_for_decision"),
    )
    decision_maker_title = factory.Faker("sentence", nb_words=2)
    decision_maker_name = factory.Faker("name")
    section_of_the_law = factory.Faker("word")
    decision_date = factory.Faker(
        "date_between_dates",
        date_start=factory.LazyAttribute(lambda _: date.today() - timedelta(days=30)),
        date_end=factory.LazyAttribute(lambda _: date.today()),
    )

    expert_inspector_name = factory.Faker("name")
    expert_inspector_email = factory.Faker("email")

    class Meta:
        model = ApplicationBatch
