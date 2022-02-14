import decimal
import random
from datetime import date, timedelta

import factory
from applications.tests.factories import ApplicationFactory
from calculator.enums import RowType
from calculator.models import (
    Calculation,
    CalculationRow,
    PaySubsidy,
    PreviousBenefit,
    STATE_AID_MAX_PERCENTAGE_CHOICES,
    TrainingCompensation,
)
from common.utils import duration_in_months
from companies.tests.factories import CompanyFactory


class PaySubsidyFactory(factory.django.DjangoModelFactory):
    application = factory.SubFactory(ApplicationFactory)
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
    )
    pay_subsidy_percent = 50
    work_time_percent = decimal.Decimal(100)
    ordering = factory.Sequence(lambda n: n + 1)
    disability_or_illness = False

    class Meta:
        model = PaySubsidy


class TrainingCompensationFactory(factory.django.DjangoModelFactory):
    application = factory.SubFactory(ApplicationFactory)
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
    )
    monthly_amount = factory.Faker(
        "pydecimal", left_digits=3, right_digits=2, min_value=0
    )
    ordering = factory.Sequence(lambda n: n + 1)

    class Meta:
        model = TrainingCompensation


class CalculationRowFactory(factory.django.DjangoModelFactory):
    row_type = factory.Faker("random_element", elements=RowType.choices)
    ordering = factory.Sequence(lambda n: n + 1)
    description_fi = factory.Faker("sentence", nb_words=3)
    amount = factory.Faker("pydecimal", left_digits=4, right_digits=2, min_value=0)

    class Meta:
        model = CalculationRow


class CalculationFactory(factory.django.DjangoModelFactory):
    application = factory.SubFactory(ApplicationFactory)
    monthly_pay = factory.Faker("random_int", max=5000)
    vacation_money = factory.Faker("random_int", max=5000)
    other_expenses = factory.Faker("random_int", max=5000)
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
    )
    state_aid_max_percentage = factory.Faker(
        "random_element", elements=[v[0] for v in STATE_AID_MAX_PERCENTAGE_CHOICES]
    )
    calculated_benefit_amount = factory.Faker(
        "pydecimal", left_digits=4, right_digits=2, min_value=0
    )
    override_monthly_benefit_amount = None
    override_monthly_benefit_amount_comment = ""

    row_1 = factory.RelatedFactory(
        CalculationRowFactory,
        ordering=0,
        row_type=RowType.SALARY_COSTS_EUR,
        amount=decimal.Decimal("1000"),
        factory_related_name="calculation",
    )
    row_2 = factory.RelatedFactory(
        CalculationRowFactory,
        ordering=1,
        row_type=RowType.PAY_SUBSIDY_MONTHLY_EUR,
        amount=decimal.Decimal("0"),
        factory_related_name="calculation",
    )
    row_3 = factory.RelatedFactory(
        CalculationRowFactory,
        ordering=2,
        row_type=RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
        amount=decimal.Decimal("300"),
        factory_related_name="calculation",
    )
    row_4 = factory.RelatedFactory(
        CalculationRowFactory,
        ordering=3,
        row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR,
        amount=decimal.Decimal("600"),
        factory_related_name="calculation",
    )

    class Meta:
        model = Calculation


class PreviousBenefitFactory(factory.django.DjangoModelFactory):
    company = company = factory.SubFactory(CompanyFactory)
    social_security_number = factory.Faker("ssn", locale="fi_FI")

    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(2020, 1, 1),
        date_end=date(2021, 12, 31),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
    )
    monthly_amount = factory.Faker(
        "pydecimal", left_digits=3, right_digits=2, min_value=0
    )
    total_amount = factory.LazyAttribute(
        lambda o: duration_in_months(o.start_date, o.end_date) * o.monthly_amount
    )

    class Meta:
        model = PreviousBenefit
