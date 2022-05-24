import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient
from shared.common.tests.conftest import *  # noqa
from shared.common.tests.conftest import store_tokens_in_session

from applications.enums import AttachmentType, EmployerApplicationStatus
from applications.models import School
from common.tests.factories import (
    AcceptableYouthApplicationFactory,
    AcceptedYouthApplicationFactory,
    ActiveYouthApplicationFactory,
    AdditionalInfoRequestedYouthApplicationFactory,
    AttachmentFactory,
    CompanyFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    InactiveYouthApplicationFactory,
    RejectableYouthApplicationFactory,
    RejectedYouthApplicationFactory,
    YouthApplicationFactory,
)


@pytest.fixture
def company():
    company = CompanyFactory()
    return company


@pytest.fixture
def company2():
    company = CompanyFactory()
    return company


@pytest.fixture
def application(company, user):
    return EmployerApplicationFactory(
        status=EmployerApplicationStatus.DRAFT, company=company, user=user
    )


@pytest.fixture
def submitted_application(company, user):
    return EmployerApplicationFactory(
        status=EmployerApplicationStatus.SUBMITTED, company=company, user=user
    )


@pytest.fixture
def summer_voucher(application):
    summer_voucher = EmployerSummerVoucherFactory(application=application)
    yield summer_voucher
    for attachment in summer_voucher.attachments.all():
        attachment.attachment_file.delete(save=False)


@pytest.fixture
def submitted_summer_voucher(submitted_application):
    summer_voucher = EmployerSummerVoucherFactory(application=submitted_application)
    yield summer_voucher
    for attachment in summer_voucher.attachments.all():
        attachment.attachment_file.delete(save=False)


@pytest.fixture
def submitted_employment_contract_attachment(submitted_summer_voucher):
    attachment = AttachmentFactory(
        summer_voucher=submitted_summer_voucher,
        attachment_type=AttachmentType.EMPLOYMENT_CONTRACT,
    )
    yield attachment
    attachment.attachment_file.delete(save=False)


@pytest.fixture
def employment_contract_attachment(summer_voucher):
    attachment = AttachmentFactory(
        summer_voucher=summer_voucher,
        attachment_type=AttachmentType.EMPLOYMENT_CONTRACT,
    )
    yield attachment
    attachment.attachment_file.delete(save=False)


@pytest.fixture
def payslip_attachment(summer_voucher):
    attachment = AttachmentFactory(
        summer_voucher=summer_voucher, attachment_type=AttachmentType.PAYSLIP
    )
    yield attachment
    attachment.attachment_file.delete(save=False)


def store_company_in_session(client, company):
    s = client.session
    s.update(
        {
            "organization_roles": {
                "name": "Activenakusteri Oy",
                "identifier": company.business_id,
                "complete": True,
                "roles": ["NIMKO"],
            }
        }
    )
    s.save()


@pytest.fixture
def youth_application():
    return YouthApplicationFactory()


@pytest.fixture
def acceptable_youth_application():
    return AcceptableYouthApplicationFactory()


@pytest.fixture
def accepted_youth_application():
    return AcceptedYouthApplicationFactory()


@pytest.fixture
def additional_info_requested_youth_application():
    return AdditionalInfoRequestedYouthApplicationFactory()


@pytest.fixture
def rejectable_youth_application():
    return RejectableYouthApplicationFactory()


@pytest.fixture
def rejected_youth_application():
    return RejectedYouthApplicationFactory()


@pytest.fixture
def inactive_youth_application():
    return InactiveYouthApplicationFactory()


@pytest.fixture
def active_youth_application():
    return ActiveYouthApplicationFactory()


@pytest.fixture
def api_client(user, company):
    permissions = Permission.objects.all()
    user.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(user)

    store_tokens_in_session(client)
    store_company_in_session(client, company)

    return client


@pytest.fixture
def api_client2(other_user, company2):
    permissions = Permission.objects.all()
    other_user.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(other_user)

    store_tokens_in_session(client)
    store_company_in_session(client, company2)

    return client


@pytest.fixture
def unauthenticated_api_client():
    return APIClient()


@pytest.fixture
def school_list():
    TEST_SCHOOL_NAMES = [
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
    School.objects.bulk_create(
        objs=[School(name=name) for name in TEST_SCHOOL_NAMES],
        ignore_conflicts=True,  # Ignore conflicts if a school with name already exists
    )
