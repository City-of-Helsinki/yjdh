import random
from datetime import date, datetime, timedelta
from typing import List, Optional

import factory
import factory.fuzzy
import pytz
from faker import Faker
from shared.common.tests.factories import UserFactory

from applications.enums import (
    ApplicationStatus,
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AttachmentType,
    HiredWithoutVoucherAssessment,
    SummerVoucherExceptionReason,
)
from applications.models import EmployerApplication, Attachment, SummerVoucher, YouthApplication
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


class AttachmentFactory(factory.django.DjangoModelFactory):
    attachment_type = factory.Faker("random_element", elements=AttachmentType.values)
    content_type = factory.Faker(
        "random_element", elements=[val[1] for val in ATTACHMENT_CONTENT_TYPE_CHOICES]
    )
    attachment_file = factory.django.FileField(filename="file.pdf")

    class Meta:
        model = Attachment


class SummerVoucherFactory(factory.django.DjangoModelFactory):
    summer_voucher_serial_number = factory.Faker("md5")
    summer_voucher_exception_reason = factory.Faker(
        "random_element", elements=SummerVoucherExceptionReason.values
    )

    employee_name = factory.Faker("name")
    employee_school = factory.Faker("lexify", text="????? School")
    employee_ssn = factory.Faker("bothify", text="######-###?")
    employee_phone_number = factory.Faker("phone_number")
    employee_home_city = factory.Faker("city")
    employee_postcode = factory.Faker("postcode")

    employment_postcode = factory.Faker("postcode")
    employment_start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    employment_end_date = factory.LazyAttribute(
        lambda o: o.employment_start_date + timedelta(days=random.randint(31, 364))
    )
    employment_work_hours = factory.Faker(
        "pydecimal", left_digits=2, right_digits=1, min_value=1
    )
    employment_salary_paid = factory.Faker(
        "pydecimal", left_digits=4, right_digits=2, min_value=1
    )
    employment_description = factory.Faker("sentence")
    hired_without_voucher_assessment = factory.Faker(
        "random_element", elements=HiredWithoutVoucherAssessment.values
    )

    class Meta:
        model = SummerVoucher


class ApplicationFactory(factory.django.DjangoModelFactory):
    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(UserFactory)
    status = factory.Faker("random_element", elements=ApplicationStatus.values)
    street_address = factory.Faker("street_address")
    contact_person_name = factory.Faker("name")
    contact_person_email = factory.Faker("email")
    contact_person_phone_number = factory.Faker("phone_number")

    is_separate_invoicer = factory.Faker("boolean")
    invoicer_name = factory.Faker("name")
    invoicer_email = factory.Faker("email")
    invoicer_phone_number = factory.Faker("phone_number")

    class Meta:
        model = EmployerApplication


def get_listed_test_schools() -> List[str]:
    return [
        "Arabian peruskoulu",
        "Botby grundskola",
        "Ressu Comprehensive School",
    ]


def get_unlisted_test_schools() -> List[str]:
    return [
        "Jokin muu koulu",
        "Testikoulu",
    ]


def get_all_test_schools() -> List[str]:
    return get_listed_test_schools() + get_unlisted_test_schools()


def uses_unlisted_test_school(youth_application: YouthApplication) -> bool:
    return youth_application.school not in get_listed_test_schools()


def get_test_phone_number() -> str:
    # NAMES_REGEX didn't accept phone numbers starting with (+358) but did with +358
    # so removing the parentheses to make the generated phone numbers fit it
    return Faker(locale="fi").phone_number().replace("(+358)", "+358")


def copy_created_at(youth_application: YouthApplication) -> Optional[datetime]:
    return youth_application.created_at


class BaseYouthApplicationFactory(factory.django.DjangoModelFactory):
    created_at = factory.fuzzy.FuzzyDateTime(
        start_dt=datetime(2021, 1, 1, tzinfo=pytz.UTC),
    )
    modified_at = factory.LazyAttribute(copy_created_at)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    social_security_number = factory.Faker("ssn", locale="fi")  # Must be Finnish
    school = factory.Faker("random_element", elements=get_all_test_schools())
    is_unlisted_school = factory.LazyAttribute(uses_unlisted_test_school)
    email = factory.Faker("email")
    phone_number = factory.LazyFunction(get_test_phone_number)
    language = factory.Faker("random_element", elements=["fi", "sv", "en"])
    _is_active = None

    class Meta:
        model = YouthApplication
        exclude = ["_is_active"]


class YouthApplicationFactory(BaseYouthApplicationFactory):
    _is_active = factory.Faker("boolean")
    receipt_confirmed_at = factory.Maybe(
        "_is_active",
        factory.LazyAttribute(copy_created_at),
        None,
    )


class ActiveYouthApplicationFactory(BaseYouthApplicationFactory):
    _is_active = True
    receipt_confirmed_at = factory.LazyAttribute(copy_created_at)


class InactiveYouthApplicationFactory(BaseYouthApplicationFactory):
    _is_active = False
    receipt_confirmed_at = None
