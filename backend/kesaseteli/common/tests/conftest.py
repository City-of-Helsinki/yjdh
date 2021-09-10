import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient
from shared.common.tests.factories import UserFactory
from shared.oidc.tests.conftest import *  # noqa

from applications.enums import ApplicationStatus, AttachmentType
from common.tests.factories import (
    ApplicationFactory,
    AttachmentFactory,
    CompanyFactory,
    SummerVoucherFactory,
)


@pytest.fixture
def company(eauthorization_profile):
    company = CompanyFactory(eauth_profile=eauthorization_profile)
    return company


@pytest.fixture
def user_with_profile(oidc_profile, eauthorization_profile):
    user = UserFactory(oidc_profile=oidc_profile)

    eauthorization_profile.oidc_profile = oidc_profile
    eauthorization_profile.save()

    return user


@pytest.fixture
def application(company, user_with_profile):
    return ApplicationFactory(
        status=ApplicationStatus.DRAFT, company=company, user=user_with_profile
    )


@pytest.fixture
def summer_voucher(application):
    summer_voucher = SummerVoucherFactory(application=application)
    yield summer_voucher
    for attachment in summer_voucher.attachments.all():
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


@pytest.fixture
def api_client(user_with_profile):
    permissions = Permission.objects.all()
    user_with_profile.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(user_with_profile)
    return client


@pytest.fixture
def unauthenticated_api_client():
    return APIClient()
