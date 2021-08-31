import factory

from applications.enums import (
    ApplicationStatus,
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AttachmentType,
)
from applications.models import Application, Attachment, SummerVoucher
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
        model = Application
