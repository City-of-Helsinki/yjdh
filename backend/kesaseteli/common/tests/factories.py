import random
from datetime import date, datetime, timedelta
from typing import List, Optional

import factory
import factory.fuzzy
from django.db.models.signals import post_save
from django.utils import timezone
from django.utils.timezone import get_current_timezone

from applications.enums import (
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AdditionalInfoUserReason,
    AttachmentType,
    EmployerApplicationStatus,
    HiredWithoutVoucherAssessment,
    SummerVoucherExceptionReason,
    VtjTestCase,
    YouthApplicationStatus,
    get_supported_languages,
)
from applications.models import (
    Attachment,
    EmployerApplication,
    EmployerSummerVoucher,
    YouthApplication,
    YouthSummerVoucher,
)
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_not_found_content,
)
from common.tests.faker import get_faker
from common.tests.mixins import SaveAfterPostGenerationMixin
from common.tests.utils import get_random_social_security_number_for_year
from companies.models import Company
from shared.common.tests.factories import (
    DuplicateAllowingUserFactory,
    HandlerUserFactory,
)


class CompanyFactory(SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory):
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


class AttachmentFactory(
    SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory
):
    attachment_type = factory.Faker("random_element", elements=AttachmentType.values)
    content_type = factory.Faker(
        "random_element", elements=[val[1] for val in ATTACHMENT_CONTENT_TYPE_CHOICES]
    )
    attachment_file = factory.django.FileField(filename="file.pdf")

    class Meta:
        model = Attachment


class EmployerSummerVoucherFactory(
    SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory
):
    summer_voucher_serial_number = factory.Faker("md5")
    target_group = factory.Faker(
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
    is_exported = False

    class Meta:
        model = EmployerSummerVoucher


class EmployerApplicationFactory(
    SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory
):
    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(DuplicateAllowingUserFactory)
    status = factory.Faker("random_element", elements=EmployerApplicationStatus.values)
    street_address = factory.Faker("street_address")
    bank_account_number = factory.Faker("iban")
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
        "Aleksis Kiven peruskoulu",
        "Apollon yhteiskoulu",
        "Arabian peruskoulu",
        "Aurinkolahden peruskoulu",
        "Botby grundskola",
        "Elias-koulu",
        "Englantilainen koulu",
        "Grundskolan Norsen",
        "Haagan peruskoulu",
        "Helsingin Juutalainen Yhteiskoulu",
        "Helsingin Kristillinen koulu",
        "Helsingin Montessori-koulu",
        "Helsingin Rudolf Steiner -koulu",
        "Helsingin Saksalainen koulu",
        "Helsingin Suomalainen yhteiskoulu",
        "Helsingin Uusi yhteiskoulu",
        "Helsingin eurooppalainen koulu",
        "Helsingin normaalilyseo",
        "Helsingin ranskalais-suomalainen koulu",
        "Helsingin yhteislyseo",
        "Helsingin yliopiston Viikin normaalikoulu",
        "Herttoniemen yhteiskoulu",
        "Hiidenkiven peruskoulu",
        "Hoplaxskolan",
        "International School of Helsinki",
        "Itäkeskuksen peruskoulu",
        "Jätkäsaaren peruskoulu",
        "Kalasataman peruskoulu",
        "Kankarepuiston peruskoulu",
        "Kannelmäen peruskoulu",
        "Karviaistien koulu",
        "Kruununhaan yläasteen koulu",
        "Kruunuvuorenrannan peruskoulu",
        "Kulosaaren yhteiskoulu",
        "Käpylän peruskoulu",
        "Laajasalon peruskoulu",
        "Latokartanon peruskoulu",
        "Lauttasaaren yhteiskoulu",
        "Maatullin peruskoulu",
        "Malmin peruskoulu",
        "Marjatta-koulu",
        "Maunulan yhteiskoulu",
        "Meilahden yläasteen koulu",
        "Merilahden peruskoulu",
        "Minervaskolan",
        "Munkkiniemen yhteiskoulu",
        "Myllypuron peruskoulu",
        "Naulakallion koulu",
        "Oulunkylän yhteiskoulu",
        "Outamon koulu",
        "Pakilan yläasteen koulu",
        "Pasilan peruskoulu",
        "Pitäjänmäen peruskoulu",
        "Pohjois-Haagan yhteiskoulu",
        "Porolahden peruskoulu",
        "Puistolan peruskoulu",
        "Puistopolun peruskoulu",
        "Pukinmäenkaaren peruskoulu",
        "Ressu Comprehensive School",
        "Ressun peruskoulu",
        "Sakarinmäen peruskoulu",
        "Solakallion koulu",
        "Sophie Mannerheimin koulu",
        "Suomalais-venäläinen koulu",
        "Suutarinkylän peruskoulu",
        "Taivallahden peruskoulu",
        "Toivolan koulu",
        "Torpparinmäen peruskoulu",
        "Töölön yhteiskoulu",
        "Valteri-koulu",
        "Vartiokylän yläasteen koulu",
        "Vesalan peruskoulu",
        "Vuoniityn peruskoulu",
        "Yhtenäiskoulu",
        "Zacharias Topeliusskolan",
        "Åshöjdens grundskola",
        "Östersundom skola",
    ]


def get_unlisted_test_schools() -> List[str]:
    return [
        "Jokin muu koulu",
        "Testikoulu",
    ]


def determine_school(youth_application) -> str:
    return get_faker().random_element(
        get_unlisted_test_schools()
        if youth_application.is_unlisted_school
        else get_listed_test_schools()
    )


def get_test_phone_number() -> str:
    # PHONE_NUMBER_REGEX didn't accept phone numbers starting with (+358) but did with
    # +358 so removing the parentheses to make the generated phone numbers fit it
    return get_faker().phone_number().replace("(+358)", "+358")


def determine_modified_at(youth_application) -> Optional[datetime]:
    return get_faker().date_time_between_dates(
        youth_application.created_at + timedelta(days=10),
        youth_application.created_at + timedelta(days=20),
        tzinfo=get_current_timezone(),
    )


def copy_encrypted_original_vtj_json(youth_application) -> Optional[str]:
    return youth_application.encrypted_original_vtj_json


def determine_handler(youth_application):
    if youth_application.status in YouthApplicationStatus.handled_values():
        return HandlerUserFactory()
    return None


def determine_handled_at(youth_application):
    if youth_application.status in YouthApplicationStatus.handled_values():
        return get_faker().date_time_between_dates(
            youth_application.created_at + timedelta(days=3),
            youth_application.created_at + timedelta(days=10),
            tzinfo=get_current_timezone(),
        )
    return None


def determine_receipt_confirmed_at(youth_application):
    if youth_application.status in YouthApplicationStatus.active_values():
        return get_faker().date_time_between_dates(
            youth_application.created_at,
            youth_application.created_at + timedelta(days=1),
            tzinfo=get_current_timezone(),
        )
    return None


def determine_is_unlisted_school(youth_application):
    # Used for changing return value of youth_application.need_additional_info
    if youth_application._has_additional_info or youth_application.status in [
        YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
    ]:
        return True
    elif (
        youth_application.status
        in YouthApplicationStatus.can_have_additional_info_values()
    ):
        return get_faker().boolean()
    else:
        return False


def determine_is_accepted(youth_application):
    return youth_application.status == YouthApplicationStatus.ACCEPTED.value


def determine_youth_application_has_additional_info(youth_application):
    if (
        youth_application.status
        in YouthApplicationStatus.can_have_additional_info_values()
    ):
        if (
            youth_application.status
            in YouthApplicationStatus.must_have_additional_info_values()
        ):
            return True
        return get_faker().boolean()
    return False


def determine_additional_info_provided_at(youth_application):
    if youth_application._has_additional_info:
        return get_faker().date_time_between_dates(
            youth_application.created_at + timedelta(days=1),
            youth_application.created_at + timedelta(days=3),
            tzinfo=get_current_timezone(),
        )
    return None


def determine_additional_info_user_reasons(youth_application):
    if youth_application._has_additional_info:
        return list(
            get_faker().random_elements(AdditionalInfoUserReason.values, unique=True)
        )
    return []


def determine_additional_info_description(youth_application):
    if youth_application._has_additional_info:
        return get_faker().sentence()
    return ""


def determine_vtj_json_for_vtj_test_case(youth_application):
    vtj_test_case = youth_application.last_name
    if vtj_test_case not in VtjTestCase.values:
        raise ValueError(f"Invalid VtjTestCase value {vtj_test_case}")

    return YouthApplication.get_mocked_vtj_json_for_vtj_test_case(
        vtj_test_case=vtj_test_case,
        first_name=youth_application.first_name,
        last_name=youth_application.last_name,
        social_security_number=youth_application.social_security_number,
    )


def determine_automatically_acceptable_vtj_json(youth_application):
    return mock_vtj_person_id_query_found_content(
        first_name=youth_application.first_name,
        last_name=youth_application.last_name,
        social_security_number=youth_application.social_security_number,
        is_alive=True,
        is_home_municipality_helsinki=True,
    )


def determine_need_additional_info_vtj_json(youth_application):
    return mock_vtj_person_id_query_found_content(
        first_name=youth_application.first_name,
        last_name=youth_application.last_name,
        social_security_number=youth_application.social_security_number,
        is_alive=True,
        is_home_municipality_helsinki=False,
    )


def determine_target_group_social_security_number(youth_application):
    return get_random_social_security_number_for_year(date.today().year - 16)


@factory.django.mute_signals(post_save)
class AbstractYouthApplicationFactory(
    SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory
):
    creator = (
        None  # For most cases there's no creator, only non-VTJ applications have one
    )
    created_at = timezone.now()
    modified_at = factory.LazyAttribute(determine_modified_at)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    social_security_number = factory.Faker("ssn", locale="fi")  # Must be Finnish
    school = factory.LazyAttribute(determine_school)
    is_unlisted_school = factory.LazyAttribute(determine_is_unlisted_school)
    email = factory.Faker("email")
    phone_number = factory.LazyFunction(get_test_phone_number)
    postcode = factory.Faker("postcode", locale="fi")
    language = factory.Faker("random_element", elements=get_supported_languages())
    receipt_confirmed_at = factory.LazyAttribute(determine_receipt_confirmed_at)
    handler = factory.LazyAttribute(determine_handler)
    handled_at = factory.LazyAttribute(determine_handled_at)
    additional_info_provided_at = factory.LazyAttribute(
        determine_additional_info_provided_at
    )
    additional_info_user_reasons = factory.LazyAttribute(
        determine_additional_info_user_reasons
    )
    additional_info_description = factory.LazyAttribute(
        determine_additional_info_description
    )
    encrypted_original_vtj_json = mock_vtj_person_id_query_not_found_content()
    encrypted_handler_vtj_json = mock_vtj_person_id_query_not_found_content()

    youth_summer_voucher = factory.Maybe(
        "_is_accepted",
        # We pass in "youth_application" to link the generated YouthSummerVoucher to our
        # just-generated YouthApplication. This will call
        # YouthSummerVoucherFactory(youth_application=<generated youth application>),
        # thus skipping the SubFactory.
        factory.RelatedFactory(
            "common.tests.factories.YouthSummerVoucherFactory",
            factory_related_name="youth_application",
        ),
        None,
    )

    # Excluded parameters
    _has_additional_info = factory.LazyAttribute(
        determine_youth_application_has_additional_info
    )
    _is_accepted = factory.LazyAttribute(determine_is_accepted)

    class Meta:
        abstract = True
        model = YouthApplication
        exclude = ["_has_additional_info", "_is_accepted"]


class YouthApplicationFactory(AbstractYouthApplicationFactory):
    status = factory.Faker("random_element", elements=YouthApplicationStatus.values)


class AbstractNonVtjYouthApplicationFactory(AbstractYouthApplicationFactory):
    """
    An abstract base class for youth applications created using
    YouthApplicationViewSet.create_without_ssn endpoint.

    These youth applications don't have a social security number or VTJ data.
    """

    # Non-VTJ youth applications always have empty social security number and no VTJ
    # data:
    social_security_number = ""
    encrypted_original_vtj_json = None
    encrypted_handler_vtj_json = None

    # Fields that are only applicable to non-VTJ youth applications:
    non_vtj_birthdate = factory.Faker("date_of_birth", minimum_age=1, maximum_age=99)
    non_vtj_home_municipality = factory.Faker(
        "random_element",
        elements=[
            "Helsinki",
            "Espoo",
            "Vantaa",
            "Utsjoki",
            "Stockholm",
            "Tallinn",
            "",  # Not a required field so may be empty
        ],
    )

    # Non-VTJ youth applications should always have a creator
    # as they are created by a handler user:
    creator = factory.SubFactory(HandlerUserFactory)

    # Non-VTJ youth applications should always have additional info:
    additional_info_description = factory.Faker("text", max_nb_chars=80)

    # All non-VTJ youth applications are created into a state from whence they can
    # directly be approved/rejected. Thus, all their timestamps should be set to
    # the same value i.e. the time of creation:
    created_at = timezone.now()
    modified_at = timezone.now()
    receipt_confirmed_at = timezone.now()
    additional_info_provided_at = timezone.now()

    # Fields that always have the same values in all non-VTJ youth applications:
    is_unlisted_school = True
    additional_info_user_reasons = [AdditionalInfoUserReason.OTHER.value]

    class Meta:
        abstract = True


class AcceptableNonVtjYouthApplicationFactory(AbstractNonVtjYouthApplicationFactory):
    """
    A youth application created using
    YouthApplicationViewSet.create_without_ssn endpoint.
    """

    status = YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value


class AcceptedNonVtjYouthApplicationFactory(AbstractNonVtjYouthApplicationFactory):
    """
    A youth application created using
    YouthApplicationViewSet.create_without_ssn endpoint and then accepted.
    """

    status = YouthApplicationStatus.ACCEPTED.value


class RejectedNonVtjYouthApplicationFactory(AbstractNonVtjYouthApplicationFactory):
    """
    A youth application created using
    YouthApplicationViewSet.create_without_ssn endpoint and then rejected.
    """

    status = YouthApplicationStatus.REJECTED.value


class UnhandledYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.unhandled_values()
    )


class ActiveYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.active_values()
    )


class ActiveUnhandledYouthApplicationFactory(ActiveYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.active_unhandled_values()
    )


class InactiveYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.SUBMITTED.value


class InactiveNoNeedAdditionalInfoYouthApplicationFactory(
    InactiveYouthApplicationFactory
):
    social_security_number = factory.LazyAttribute(
        determine_target_group_social_security_number
    )
    is_unlisted_school = False
    encrypted_original_vtj_json = factory.LazyAttribute(
        determine_automatically_acceptable_vtj_json
    )
    encrypted_handler_vtj_json = factory.LazyAttribute(copy_encrypted_original_vtj_json)


class InactiveNeedAdditionalInfoYouthApplicationFactory(
    InactiveYouthApplicationFactory
):
    social_security_number = factory.LazyAttribute(
        determine_target_group_social_security_number
    )
    is_unlisted_school = True
    encrypted_original_vtj_json = factory.LazyAttribute(
        determine_need_additional_info_vtj_json
    )
    encrypted_handler_vtj_json = factory.LazyAttribute(copy_encrypted_original_vtj_json)


class VtjTestCaseYouthApplicationFactory(YouthApplicationFactory):
    first_name = VtjTestCase.first_name()
    last_name = factory.Faker("random_element", elements=VtjTestCase.values)
    encrypted_original_vtj_json = factory.LazyAttribute(
        determine_vtj_json_for_vtj_test_case
    )
    encrypted_handler_vtj_json = factory.LazyAttribute(copy_encrypted_original_vtj_json)


class InactiveVtjTestCaseYouthApplicationFactory(VtjTestCaseYouthApplicationFactory):
    status = YouthApplicationStatus.SUBMITTED.value


class ActiveVtjTestCaseYouthApplicationFactory(VtjTestCaseYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.active_values()
    )


class AcceptableYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.acceptable_values()
    )


class AcceptedYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.ACCEPTED.value


class AdditionalInfoRequestedYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value


class AdditionalInfoProvidedYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value


class AwaitingManualProcessingYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value


class RejectableYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = factory.Faker(
        "random_element", elements=YouthApplicationStatus.rejectable_values()
    )


class RejectedYouthApplicationFactory(AbstractYouthApplicationFactory):
    status = YouthApplicationStatus.REJECTED.value


@factory.django.mute_signals(post_save)
class YouthSummerVoucherFactory(
    SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory
):
    # Passing in youth_summer_voucher=None here disables RelatedFactory in
    # AcceptedYouthApplicationFactory and prevents it from creating another
    # YouthSummerVoucher.
    youth_application = factory.SubFactory(
        AcceptedYouthApplicationFactory, youth_summer_voucher=None
    )
    # NOTE: Difference from production use:
    # - This does not generate a gapless sequence
    summer_voucher_serial_number = factory.Faker(
        "pyint", min_value=1, max_value=(2**63) - 1
    )
    target_group = ""

    class Meta:
        model = YouthSummerVoucher
