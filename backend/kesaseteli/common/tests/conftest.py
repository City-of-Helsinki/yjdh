import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient
from shared.common.tests.conftest import *  # noqa
from shared.common.tests.conftest import store_tokens_in_session

from applications.enums import ApplicationStatus, AttachmentType
from common.tests.factories import (
    ActiveYouthApplicationFactory,
    ApplicationFactory,
    AttachmentFactory,
    CompanyFactory,
    InactiveYouthApplicationFactory,
    SummerVoucherFactory,
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
    return ApplicationFactory(
        status=ApplicationStatus.DRAFT, company=company, user=user
    )


@pytest.fixture
def submitted_application(company, user):
    return ApplicationFactory(
        status=ApplicationStatus.SUBMITTED, company=company, user=user
    )


@pytest.fixture
def summer_voucher(application):
    summer_voucher = SummerVoucherFactory(application=application)
    yield summer_voucher
    for attachment in summer_voucher.attachments.all():
        attachment.attachment_file.delete(save=False)


@pytest.fixture
def submitted_summer_voucher(submitted_application):
    summer_voucher = SummerVoucherFactory(application=submitted_application)
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
